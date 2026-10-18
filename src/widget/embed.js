/**
 * Reads how a host page wants the widget embedded: from the <script> tag's
 * data-* attributes and from a `window.EscalatedWidget` object set before
 * the script loads. Attributes win over the global object.
 */

const TAB_ALIASES = {
    help: 'help',
    kb: 'help',
    articles: 'help',
    contact: 'contact',
    ticket: 'contact',
    chat: 'chat',
    status: 'status',
};

export const WIDGET_TABS = ['help', 'contact', 'chat', 'status'];

export function normalizeTab(tab) {
    return (
        TAB_ALIASES[
            String(tab ?? '')
                .trim()
                .toLowerCase()
        ] ?? null
    );
}

function normalizeTabs(value) {
    if (value == null || value === '') return null;
    const list = Array.isArray(value) ? value : String(value).split(',');
    const tabs = [...new Set(list.map(normalizeTab).filter(Boolean))];
    return tabs.length ? tabs : null;
}

function bool(value, fallback = false) {
    if (value == null) return fallback;
    if (typeof value === 'boolean') return value;
    return !['false', '0', 'no', 'off'].includes(String(value).trim().toLowerCase());
}

function parseJson(value) {
    if (!value) return {};
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

/** data-meta-order-number="A-1" → { order_number: 'A-1' } */
function metaAttributes(scriptTag) {
    const meta = {};
    for (const attr of scriptTag?.attributes ?? []) {
        if (attr.name.startsWith('data-meta-') && attr.name.length > 10) {
            meta[attr.name.slice(10).replace(/-/g, '_')] = attr.value;
        }
    }
    return meta;
}

/**
 * When the script is the bundle a backend serves at {widgetPath}/embed.js,
 * the backend is the script's own origin and path: no data-base-url needed.
 */
function fromScriptSrc(scriptTag, location) {
    const src = scriptTag?.getAttribute('src');
    if (!src) return {};
    try {
        const url = new URL(src, location?.href);
        const match = url.pathname.match(/^(.*\/widget)\/embed\.js$/);
        return match ? { baseUrl: url.origin, widgetPath: match[1] } : {};
    } catch {
        return {};
    }
}

export function readEmbedConfig(scriptTag, globalConfig = {}, location = globalThis.location) {
    const attr = (name) => scriptTag?.getAttribute(`data-${name}`) ?? undefined;
    const g = globalConfig && typeof globalConfig === 'object' ? globalConfig : {};
    const pick = (name, key = name) => attr(name) ?? g[key];
    const src = fromScriptSrc(scriptTag, location);

    const department = pick('department');
    const metadata = {
        ...(typeof g.metadata === 'object' && g.metadata ? g.metadata : {}),
        ...parseJson(attr('metadata')),
        ...metaAttributes(scriptTag),
    };

    return {
        baseUrl: attr('base-url') ?? g.baseUrl ?? src.baseUrl ?? '',
        // Host-framework-specific path prefix. Every plugin except the NestJS
        // reference mounts at /support/widget; NestJS mounts at
        // /escalated/widget. Set via data-widget-path on NestJS backends,
        // unless the script itself was loaded from {widgetPath}/embed.js.
        widgetPath: attr('widget-path') ?? g.widgetPath ?? src.widgetPath ?? '/support/widget',
        color: pick('color') || '#4F46E5',
        position: pick('position') || 'bottom-right',
        mode: pick('mode') === 'inline' ? 'inline' : 'launcher',
        target: pick('target') ?? null,
        tabs: normalizeTabs(pick('tabs')),
        defaultTab: normalizeTab(attr('tab') ?? attr('default-tab') ?? g.defaultTab),
        department: department === '' || department == null ? null : department,
        lockDepartment: bool(pick('lock-department', 'lockDepartment')),
        prefill: {
            name: pick('name') ?? g.prefill?.name ?? '',
            email: pick('email') ?? g.prefill?.email ?? '',
            subject: pick('subject') ?? g.prefill?.subject ?? '',
            message: pick('message') ?? g.prefill?.message ?? '',
        },
        title: pick('title') || 'Support',
        greeting: pick('greeting') ?? null,
        openOnLoad: bool(pick('open', 'openOnLoad')),
        hideLauncher: bool(pick('hide-launcher', 'hideLauncher')),
        metadata,
        metadataProvider: typeof g.metadata === 'function' ? g.metadata : null,
    };
}
