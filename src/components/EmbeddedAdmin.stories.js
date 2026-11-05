/* eslint-disable vue/one-component-per-file */
import { computed, defineComponent, h, markRaw, provide } from 'vue';
import { setPage } from '../../.storybook/inertia-mock.js';
import { panelThemeTokens } from '../plugin.js';
import EscalatedNavigation from './EscalatedNavigation.vue';
import TagsIndex from '../pages/Admin/Tags/Index.vue';

/**
 * Escalated's admin embedded in a host's own admin panel (ADR 2026-11-05;
 * docs/embedding-admin.md). The host layout below is a stand-in for any
 * Inertia + Vue admin: it owns the sidebar, the header and the user menu, and
 * lists Escalated's menu with <EscalatedNavigation /> from the shared
 * `escalated.navigation` prop. Escalated renders the page chrome-free inside it.
 */
export default {
    title: 'Embedding/Admin in a host panel',
    parameters: { layout: 'fullscreen' },
};

const hostPalette = {
    light: { bg: '#f3f4f6', side: '#ffffff', text: '#111827', muted: '#6b7280', border: '#e5e7eb', brand: '#0f766e' },
    dark: { bg: '#0b0f14', side: '#111827', text: '#f9fafb', muted: '#9ca3af', border: '#1f2937', brand: '#2dd4bf' },
};

function hostLayout(mode) {
    const c = hostPalette[mode];
    return markRaw(
        defineComponent({
            name: 'FakeHostAdminLayout',
            setup(_, { slots }) {
                return () =>
                    h('div', { style: { display: 'flex', minHeight: '100vh', background: c.bg, color: c.text } }, [
                        h(
                            'aside',
                            {
                                style: {
                                    width: '248px',
                                    flexShrink: 0,
                                    background: c.side,
                                    borderRight: `1px solid ${c.border}`,
                                    padding: '16px 12px',
                                },
                            },
                            [
                                h(
                                    'div',
                                    {
                                        style: {
                                            fontWeight: 700,
                                            fontSize: '15px',
                                            padding: '4px 12px 16px',
                                            color: c.brand,
                                        },
                                    },
                                    'Acme Admin',
                                ),
                                h(
                                    'div',
                                    {
                                        style: {
                                            fontSize: '11px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            color: c.muted,
                                            padding: '0 12px 6px',
                                        },
                                    },
                                    'Store',
                                ),
                                ...['Dashboard', 'Orders', 'Customers'].map((label) =>
                                    h(
                                        'div',
                                        { style: { fontSize: '13px', padding: '8px 12px', color: c.muted } },
                                        label,
                                    ),
                                ),
                                h(
                                    'div',
                                    {
                                        style: {
                                            fontSize: '11px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            color: c.muted,
                                            padding: '16px 12px 6px',
                                        },
                                    },
                                    'Support',
                                ),
                                h(EscalatedNavigation),
                            ],
                        ),
                        h('div', { style: { flex: 1, minWidth: 0 } }, [
                            h(
                                'header',
                                {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px 24px',
                                        borderBottom: `1px solid ${c.border}`,
                                        background: c.side,
                                    },
                                },
                                [
                                    slots.header?.(),
                                    h('span', { style: { fontSize: '13px', color: c.muted } }, 'Jordan (Owner)'),
                                ],
                            ),
                            h('main', { style: { padding: '24px' } }, slots.default?.()),
                        ]),
                    ]);
            },
        }),
    );
}

const navigation = [
    ['reports', 'Reports', 'reports', 10],
    ['tickets', 'Tickets', 'tickets', 20],
    ['departments', 'Departments', 'departments', 30],
    ['tags', 'Tags', 'tags', 60],
    ['macros', 'Macros', 'macros', 80],
    ['users', 'Users', 'users', 83],
    ['settings', 'Settings', 'settings', 100],
].map(([key, label, path, position]) => ({
    key,
    label,
    route: `escalated.admin.${key}`,
    url: `/admin/support/${path}`,
    icon: key,
    position,
    active: key === 'tags',
    badge: null,
    plugin: null,
    children: [],
}));

const tags = [
    { id: 1, name: 'billing', color: '#f59e0b', tickets_count: 14 },
    { id: 2, name: 'bug', color: '#ef4444', tickets_count: 9 },
    { id: 3, name: 'feature-request', color: '#8b5cf6', tickets_count: 21 },
];

function frame(mode, embedMode = 'layout') {
    return defineComponent({
        name: 'EmbedFrame',
        setup(_, { slots }) {
            setPage('/admin/support/tags', {
                auth: { user: { id: 1, name: 'Jordan' } },
                escalated: {
                    prefix: 'support',
                    is_admin: true,
                    is_agent: true,
                    permissions: ['*'],
                    embed: {
                        enabled: true,
                        mode: embedMode,
                        layout: null,
                        route: 'escalated.admin.tags.index',
                        base_url: '/admin/support',
                        allowed_origins: [],
                    },
                    navigation,
                },
            });
            provide('escalated-panel', { appName: 'Escalated', logo: null, mode });
            provide(
                'esc-dark',
                computed(() => mode !== 'light'),
            );
            if (embedMode === 'layout') {
                provide('escalated-layout', hostLayout(mode));
                provide('escalated-layout-scope', ['customer', 'admin']);
            }
            if (typeof document !== 'undefined') {
                for (const [prop, value] of Object.entries(panelThemeTokens(mode))) {
                    document.documentElement.style.setProperty(prop, value);
                }
            }
            return () =>
                h(
                    'div',
                    {
                        style: {
                            ...panelThemeTokens(mode),
                            fontFamily: "Inter, -apple-system, 'Segoe UI', sans-serif",
                        },
                    },
                    slots.default?.(),
                );
        },
    });
}

function render(mode, embedMode) {
    const Frame = frame(mode, embedMode);
    return () => ({
        components: { Frame, TagsIndex },
        setup: () => ({ tags }),
        template: '<Frame><TagsIndex :tags="tags" /></Frame>',
    });
}

/** The host's light admin, with Escalated's panel in light mode to match. */
export const InHostLayoutLight = { render: render('light', 'layout') };

/** The host's dark admin, with Escalated's panel in dark mode. */
export const InHostLayoutDark = { render: render('dark', 'layout') };

/** Chrome-free, as served into an iframe or a server-rendered root view. */
export const ChromeFreeLight = { render: render('light', 'iframe') };
export const ChromeFreeDark = { render: render('dark', 'iframe') };
