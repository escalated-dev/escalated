import { FRAME_SOURCE, HOST_SOURCE, PROTOCOL_VERSION, isProtocolMessage, toOrigin } from './protocol';

/**
 * The host side of the iframe embed (ADR 2026-11-05-embeddable-admin), for an
 * admin panel that frames Escalated's admin:
 *
 *     import { connectEscalatedFrame } from '@escalated-dev/escalated/embed';
 *
 *     const frame = connectEscalatedFrame(document.querySelector('#support-frame'), {
 *         origin: 'https://support.example.com',
 *         onNavigate: ({ url, title }) => highlightMenu(url),
 *     });
 *     frame.setTheme('light');
 *
 * Messages are accepted only from `origin` and from that iframe's window; the
 * frame is sized from its `resize` messages unless `autoResize` is false.
 * Nothing is ever posted to '*'.
 *
 * @param {HTMLIFrameElement} iframe
 * @param {Object} options
 * @param {string} options.origin            Escalated's origin, exactly
 * @param {Function} [options.onReady]       ({ url, route, title })
 * @param {Function} [options.onNavigate]    ({ url, route, title })
 * @param {Function} [options.onResize]      ({ height })
 * @param {boolean} [options.autoResize=true]
 * @param {Window} [options.win]
 */
export function connectEscalatedFrame(iframe, options = {}) {
    const win = options.win || (typeof window !== 'undefined' ? window : null);
    const origin = toOrigin(options.origin);
    if (!iframe || !win || !origin) {
        throw new Error("[escalated] connectEscalatedFrame needs the iframe element and Escalated's exact origin.");
    }

    const autoResize = options.autoResize !== false;

    function onMessage(event) {
        if (event.origin !== origin || event.source !== iframe.contentWindow) return;
        const data = event.data;
        if (!isProtocolMessage(data, FRAME_SOURCE)) return;

        if (data.type === 'resize' && Number.isFinite(data.height) && data.height >= 0) {
            if (autoResize) iframe.style.height = `${Math.ceil(data.height)}px`;
            options.onResize?.({ height: data.height });
        } else if (data.type === 'ready') {
            options.onReady?.({ url: data.url, route: data.route, title: data.title });
        } else if (data.type === 'navigate') {
            options.onNavigate?.({ url: data.url, route: data.route, title: data.title });
        }
    }

    win.addEventListener('message', onMessage);

    function post(type, data = {}) {
        iframe.contentWindow?.postMessage({ ...data, source: HOST_SOURCE, version: PROTOCOL_VERSION, type }, origin);
    }

    return {
        /** Switch the framed admin between light and dark, optionally with panel token overrides. */
        setTheme(mode, tokens = undefined) {
            post('theme', tokens ? { mode, tokens } : { mode });
        },
        /** Visit a path inside the embedded admin (it must be under the embed base URL). */
        navigate(url) {
            post('navigate', { url });
        },
        disconnect() {
            win.removeEventListener('message', onMessage);
        },
    };
}
