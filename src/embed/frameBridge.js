import {
    FRAME_SOURCE,
    HOST_SOURCE,
    PROTOCOL_VERSION,
    isPathUnder,
    isProtocolMessage,
    normaliseOrigins,
    toOrigin,
} from './protocol';

/**
 * The framed side of the iframe embed (ADR 2026-11-05-embeddable-admin).
 * EscalatedLayout starts it when the backend says the page is embedded in
 * iframe mode; hosts do not call it themselves.
 *
 * It talks only to the parent window, and only when the parent's origin is on
 * `allowedOrigins`. Otherwise it stays silent and ignores every message.
 *
 * @param {Object} options
 * @param {string[]} options.allowedOrigins   `escalated.embed.allowed_origins`
 * @param {string} options.baseUrl            `escalated.embed.base_url`
 * @param {Function} options.getState         () => ({ url, route, title }) for the current page
 * @param {Function} [options.subscribeNavigate] (callback) => unsubscribe; called after each navigation
 * @param {Function} [options.visit]          (url) => void, an Inertia visit
 * @param {Function} [options.onTheme]        ({ mode, tokens }) => void
 * @param {Function} [options.getRoot]       () => the element whose height is reported, read each time
 *                                            (default: <body>). Not <html>: inside a frame its height
 *                                            is at least the frame's, so the frame could never shrink.
 * @param {Window} [options.win]
 * @returns {Function} stop
 */
export function startFrameBridge(options = {}) {
    const win = options.win || (typeof window !== 'undefined' ? window : null);
    if (!win || !win.parent || win.parent === win) return () => {};

    const allowed = normaliseOrigins(options.allowedOrigins);
    const parentOrigin = resolveParentOrigin(win);
    if (!parentOrigin || !allowed.includes(parentOrigin)) return () => {};

    const getState = typeof options.getState === 'function' ? options.getState : () => ({});

    function post(type, data = {}) {
        win.parent.postMessage({ ...data, source: FRAME_SOURCE, version: PROTOCOL_VERSION, type }, parentOrigin);
    }

    function onMessage(event) {
        if (event.source !== win.parent) return;
        if (!allowed.includes(event.origin) || event.origin !== parentOrigin) return;
        const data = event.data;
        if (!isProtocolMessage(data, HOST_SOURCE)) return;

        if (data.type === 'theme' && (data.mode === 'light' || data.mode === 'dark')) {
            const tokens = {};
            if (data.tokens && typeof data.tokens === 'object') {
                for (const [key, value] of Object.entries(data.tokens)) {
                    if (typeof value === 'string') tokens[key] = value;
                }
            }
            options.onTheme?.({ mode: data.mode, tokens });
        } else if (data.type === 'navigate' && isPathUnder(data.url, options.baseUrl)) {
            options.visit?.(data.url);
        }
    }

    win.addEventListener('message', onMessage);

    const measured = () => (typeof options.getRoot === 'function' && options.getRoot()) || win.document?.body;

    let lastHeight = -1;
    function reportHeight() {
        const root = measured();
        if (!root) return;
        const height = Math.ceil(root.scrollHeight || root.getBoundingClientRect?.().height || 0);
        if (height !== lastHeight) {
            lastHeight = height;
            post('resize', { height });
        }
    }

    let observer = null;
    if (typeof win.ResizeObserver === 'function') {
        observer = new win.ResizeObserver(reportHeight);
        // The body grows and shrinks with each page, so watching it catches every change.
        if (win.document?.body) observer.observe(win.document.body);
    }

    const unsubscribe =
        typeof options.subscribeNavigate === 'function'
            ? options.subscribeNavigate(() => {
                  post('navigate', pageState(getState()));
                  reportHeight();
              })
            : null;

    post('ready', pageState(getState()));
    reportHeight();

    return () => {
        win.removeEventListener('message', onMessage);
        observer?.disconnect();
        if (typeof unsubscribe === 'function') unsubscribe();
    };
}

function pageState(state = {}) {
    return {
        url: typeof state.url === 'string' ? state.url : '',
        route: typeof state.route === 'string' ? state.route : null,
        title: typeof state.title === 'string' ? state.title : '',
    };
}

/** The parent's origin: ancestorOrigins where the browser has it, else the referrer. */
function resolveParentOrigin(win) {
    const ancestors = win.location?.ancestorOrigins;
    if (ancestors && ancestors.length) return toOrigin(ancestors[0]);
    const referrer = win.document?.referrer;
    return referrer ? toOrigin(referrer) : null;
}
