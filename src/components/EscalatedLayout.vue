<script>
// Shared by every EscalatedLayout instance in the window (iframe embed only).
const frameBridge = { started: false };
const frameState = { url: '', route: null, title: '' };
</script>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import { usePage, Link, router } from '@inertiajs/vue3';
import { usePluginExtensions } from '../composables/usePluginExtensions';
import PluginBadge from './PluginBadge.vue';
import { usePermissions } from '../composables/usePermissions';
import { useI18n } from '../composables/useI18n';
import { watchScrollAffordance } from '../utils/scrollAffordance';
import AgentShell from './AgentShell.vue';
import { escalatedNavIcons } from '../utils/adminNavIcons';
import { startFrameBridge } from '../embed/frameBridge';
import { applyPanelTheme } from '../plugin';

const props = defineProps({
    title: { type: String, default: 'Support' },
    /** Agent pages with their own panes (inbox, ticket) fill the content area edge to edge. */
    fullBleed: { type: Boolean, default: false },
});

const page = usePage();
const hostLayout = inject('escalated-layout', null);
const panelConfig = inject('escalated-panel', { appName: 'Escalated', logo: null, mode: 'dark' });
// Embedding the admin in the host's admin panel (ADR 2026-11-05). Both are
// optional: without `layoutScope` the host layout wraps customer pages only,
// exactly as before.
const layoutScope = inject('escalated-layout-scope', null);
const namedLayouts = inject('escalated-layouts', null);
const inLayoutScope = (section) => (layoutScope ?? ['customer']).includes(section);
// The backend marks embedded admin responses; anything else is not embedded.
const serverEmbed = computed(() => {
    const embed = page.props.escalated?.embed;
    return embed && embed.enabled === true ? embed : null;
});
const embedMode = computed(() => (serverEmbed.value?.mode === 'iframe' ? 'iframe' : 'layout'));
// A theme the framing page asked for (iframe mode only).
const frameThemeMode = ref(null);
const panelMode = computed(() => frameThemeMode.value || panelConfig.mode);

const isAgent = computed(() => page.props.escalated?.is_agent);
const isAdmin = computed(() => page.props.escalated?.is_admin);
const prefix = computed(() => {
    const p = page.props.escalated?.prefix || 'support';
    return p.startsWith('/') ? p : `/${p}`;
});

const currentUrl = computed(() => page.url);
const isAdminSection = computed(() => !!serverEmbed.value || currentUrl.value?.includes('/admin'));
const isAgentSection = computed(() => currentUrl.value?.includes('/agent'));
const isPanel = computed(() => isAdminSection.value || isAgentSection.value);
const isDark = computed(() => isPanel.value && panelMode.value !== 'light');

// Admin pages render chrome-free (no sidebar or top bar) when the backend
// embeds them or the host put `admin` in `layoutScope`.
const adminEmbedded = computed(() => isAdminSection.value && (!!serverEmbed.value || inLayoutScope('admin')));
const adminHostLayout = computed(() => {
    if (!adminEmbedded.value || embedMode.value === 'iframe') return null;
    const named = serverEmbed.value?.layout;
    if (named && namedLayouts?.[named]) return namedLayouts[named];
    return inLayoutScope('admin') ? hostLayout : null;
});
const agentHostLayout = computed(() => (inLayoutScope('agent') ? hostLayout : null));
const customerHostLayout = computed(() => (inLayoutScope('customer') ? hostLayout : null));

const showPoweredBy = computed(() => page.props.escalated?.show_powered_by !== false);
const kbEnabled = computed(() => page.props.escalated?.knowledge_base_enabled !== false);
const newslettersEnabled = computed(() => page.props.escalated?.features?.newsletters === true);
// Roles & permissions is an install-level switch (ADR 2026-10-29). While it is
// off the Roles screens 404, so there is no link. A backend that does not send
// the flag yet keeps the link as before.
const rolesFlag = computed(() => page.props.escalated?.features?.roles_permissions);
const kbPublic = computed(() => page.props.escalated?.knowledge_base_public !== false);

provide('esc-dark', isDark);

const { menuItems: pluginMenuItems } = usePluginExtensions();
const { hasPermission } = usePermissions();
const { t } = useI18n();

const adminLinks = computed(() => {
    const p = prefix.value;
    const coreLinks = [
        {
            href: `${p}/admin/reports`,
            label: 'Reports',
            icon: escalatedNavIcons['reports'],
            position: 10,
        },
        {
            href: `${p}/admin/tickets`,
            label: 'Tickets',
            icon: escalatedNavIcons['tickets'],
            position: 20,
        },
        {
            href: `${p}/admin/departments`,
            label: 'Departments',
            icon: escalatedNavIcons['departments'],
            position: 30,
        },
        {
            href: `${p}/admin/sla-policies`,
            label: 'SLA Policies',
            icon: escalatedNavIcons['sla-policies'],
            position: 40,
        },
        {
            href: `${p}/admin/kb-articles`,
            label: 'Knowledge Base',
            icon: escalatedNavIcons['knowledge-base'],
            position: 45,
        },
        {
            href: `${p}/admin/escalation-rules`,
            label: 'Escalation Rules',
            icon: escalatedNavIcons['escalation-rules'],
            position: 50,
        },
        {
            href: `${p}/admin/workflows`,
            label: 'Workflows',
            icon: escalatedNavIcons['workflows'],
            position: 53,
        },
        {
            href: `${p}/admin/automations`,
            label: 'Automations',
            // Time-based rules, next to the event-driven ones. The two are
            // separate surfaces and always have been; this entry was simply
            // never added, so the screen the backends render had no way in.
            icon: escalatedNavIcons['automations'],
            position: 53.5,
        },
        {
            href: `${p}/admin/webhooks`,
            label: 'Webhooks',
            icon: escalatedNavIcons['webhooks'],
            position: 54,
        },
        {
            href: `${p}/admin/tags`,
            label: 'Tags',
            icon: escalatedNavIcons['tags'],
            position: 60,
        },
        {
            href: `${p}/admin/custom-fields`,
            label: 'Custom Fields',
            icon: escalatedNavIcons['custom-fields'],
            position: 62,
        },
        {
            href: `${p}/admin/statuses`,
            label: 'Statuses',
            icon: escalatedNavIcons['statuses'],
            position: 64,
        },
        {
            href: `${p}/admin/canned-responses`,
            label: 'Canned Responses',
            icon: escalatedNavIcons['canned-responses'],
            position: 70,
        },
        {
            href: `${p}/admin/macros`,
            label: 'Macros',
            icon: escalatedNavIcons['macros'],
            position: 80,
        },
        ...(newslettersEnabled.value && isAdmin.value && hasPermission('newsletters.manage')
            ? [
                  {
                      href: `${p}/admin/newsletters`,
                      label: t('newsletters.nav.newsletters'),
                      icon: escalatedNavIcons['newsletters'],
                      position: 81,
                  },
              ]
            : []),
        {
            href: `${p}/admin/skills`,
            label: 'Skills',
            icon: escalatedNavIcons['skills'],
            position: 82,
        },
        ...(rolesFlag.value === false || (rolesFlag.value === true && !hasPermission('role.view'))
            ? []
            : [
                  {
                      href: `${p}/admin/roles`,
                      label: 'Roles',
                      icon: escalatedNavIcons['roles'],
                      position: 84,
                  },
              ]),
        {
            href: `${p}/admin/users`,
            label: 'Users',
            icon: escalatedNavIcons['users'],
            position: 83,
        },
        {
            href: `${p}/admin/capacity`,
            label: 'Capacity',
            icon: escalatedNavIcons['capacity'],
            position: 85,
        },
        {
            href: `${p}/admin/business-hours`,
            label: 'Business Hours',
            icon: escalatedNavIcons['business-hours'],
            position: 86,
        },
        {
            href: `${p}/admin/audit-log`,
            label: 'Audit Log',
            icon: escalatedNavIcons['audit-log'],
            position: 88,
        },
        {
            href: `${p}/admin/api-tokens`,
            label: 'API Tokens',
            icon: escalatedNavIcons['api-tokens'],
            position: 90,
        },
        {
            href: `${p}/admin/custom-objects`,
            label: 'Custom Objects',
            icon: escalatedNavIcons['custom-objects'],
            position: 92,
        },
        {
            href: `${p}/admin/plugins`,
            label: 'Plugins',
            icon: escalatedNavIcons['plugins'],
            position: 95,
        },
        {
            href: `${p}/admin/import`,
            label: 'Import',
            icon: escalatedNavIcons['import'],
            position: 97,
        },
        {
            href: `${p}/admin/settings`,
            label: 'Settings',
            icon: escalatedNavIcons['settings'],
            position: 100,
        },
    ];

    // Merge core admin links with plugin-provided menu items
    const pluginLinks = pluginMenuItems.value.map((item) => ({
        href: item.route,
        label: item.label,
        icon: item.icon,
        position: item.position || 100,
        badge: item.badge ?? null,
        submenu: item.submenu || [],
    }));

    return [...coreLinks, ...pluginLinks].sort((a, b) => (a.position || 100) - (b.position || 100));
});

const userName = computed(() => page.props.auth?.user?.name || 'User');
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

function isActive(href, exact = false) {
    if (!currentUrl.value) return false;
    const path = currentUrl.value.split(/[?#]/)[0];
    if (exact) return path === href;
    return path === href || path.startsWith(href + '/');
}

// Below the `lg` breakpoint the admin sidebar and the agent nav links fold
// away behind a menu button. It starts closed on the server and the client
// alike, so SSR markup hydrates without a mismatch; CSS alone decides whether
// the navigation shows at a given width.
const navOpen = ref(false);
function toggleNav() {
    navOpen.value = !navOpen.value;
}
function closeNav() {
    navOpen.value = false;
}
watch(currentUrl, closeNav);

function onKeydown(event) {
    if (event.key === 'Escape' && navOpen.value) closeNav();
}

// Tables scroll sideways inside `.esc-table-scroll`; mark the edges that have
// more content past them so the scroll is visible before anyone tries it.
const contentRoot = ref(null);
let stopScrollAffordance = () => {};

onMounted(() => {
    window.addEventListener('keydown', onKeydown);
    stopScrollAffordance = watchScrollAffordance(contentRoot.value);
    if (serverEmbed.value && embedMode.value === 'iframe') connectFrame();
});

// One bridge per window: the layout remounts on every Inertia page, the
// bridge outlives it and reads the latest page when it reports.
function connectFrame() {
    frameState.url = page.url;
    frameState.route = serverEmbed.value?.route ?? null;
    frameState.title = props.title;
    if (frameBridge.started) return;
    frameBridge.started = true;
    startFrameBridge({
        allowedOrigins: serverEmbed.value.allowed_origins,
        baseUrl: serverEmbed.value.base_url,
        getState: () => ({ ...frameState }),
        subscribeNavigate: (callback) => router.on('navigate', () => setTimeout(callback, 0)),
        visit: (url) => router.visit(url),
        onTheme: ({ mode, tokens }) => {
            frameThemeMode.value = mode;
            applyPanelTheme({ ...tokens, mode });
        },
    });
}

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown);
    stopScrollAffordance();
});
</script>

<template>
    <!-- MODE 0: Admin embedded in the host's admin panel (opt-in; ADR 2026-11-05) -->
    <component :is="adminHostLayout" v-if="adminEmbedded && adminHostLayout">
        <template #header>
            <h2 class="text-xl font-semibold leading-tight" data-testid="esc-embedded-title">{{ title }}</h2>
        </template>
        <div
            class="min-w-0 rounded-[var(--esc-radius-lg,0.75rem)] bg-[var(--esc-panel-bg)] text-[var(--esc-panel-text)]"
            :style="{ colorScheme: panelMode === 'light' ? 'light' : 'dark' }"
            data-testid="esc-embedded-admin"
            :data-esc-embed-mode="embedMode"
        >
            <main ref="contentRoot" role="main" class="min-w-0 p-4 sm:p-6">
                <slot />
            </main>
        </div>
    </component>

    <!-- MODE 0b: Admin embedded with no host Vue layout: the host chrome is in its root view, or this is an iframe -->
    <div
        v-else-if="adminEmbedded"
        class="min-w-0 bg-[var(--esc-panel-bg)] text-[var(--esc-panel-text)]"
        :style="{ colorScheme: panelMode === 'light' ? 'light' : 'dark' }"
        data-testid="esc-embedded-admin"
        :data-esc-embed-mode="embedMode"
    >
        <header class="flex items-center gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
            <h1
                class="truncate text-base font-semibold text-[var(--esc-panel-header-text,var(--esc-panel-text))]"
                data-testid="esc-embedded-title"
            >
                {{ title }}
            </h1>
        </header>
        <main ref="contentRoot" role="main" class="min-w-0 p-4 sm:p-6">
            <slot />
        </main>
    </div>

    <!-- MODE 1: Admin — sidebar layout; the sidebar folds into a drawer below lg -->
    <div
        v-else-if="isAdminSection"
        class="flex min-h-screen bg-[var(--esc-panel-bg)]"
        :style="{ colorScheme: panelConfig.mode === 'light' ? 'light' : 'dark' }"
    >
        <!-- Drawer backdrop (narrow screens only) -->
        <div
            v-if="navOpen"
            class="fixed inset-0 z-30 bg-black/40 lg:hidden"
            aria-hidden="true"
            data-testid="esc-nav-backdrop"
            @click="closeNav"
        ></div>

        <!-- Sidebar -->
        <aside
            id="esc-admin-sidebar"
            :class="[
                'fixed inset-y-0 left-0 z-40 flex w-64 max-w-[85vw] flex-col border-r border-[var(--esc-panel-border)] bg-[var(--esc-panel-sidebar-bg)] transition-[transform,visibility] duration-200 lg:visible lg:translate-x-0 lg:shadow-none',
                navOpen ? 'visible translate-x-0 shadow-2xl' : 'invisible -translate-x-full',
            ]"
            data-testid="esc-admin-sidebar"
        >
            <!-- Logo -->
            <div class="flex h-16 items-center gap-3 px-5">
                <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--esc-panel-logo-tile-bg,var(--esc-panel-border-input))] text-[var(--esc-panel-logo-tile-fg,var(--esc-panel-text))]"
                    data-testid="esc-logo-tile"
                >
                    <img
                        v-if="typeof panelConfig.logo === 'string'"
                        :src="panelConfig.logo"
                        class="h-5 w-5"
                        alt="Escalated logo"
                    />
                    <component :is="panelConfig.logo" v-else-if="panelConfig.logo" class="h-5 w-5" />
                    <svg
                        v-else
                        class="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <defs>
                            <linearGradient id="esc-rainbow-admin" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#f97316" />
                                <stop offset="30%" stop-color="#eab308" />
                                <stop offset="50%" stop-color="#22c55e" />
                                <stop offset="70%" stop-color="#3b82f6" />
                                <stop offset="100%" stop-color="#8b5cf6" />
                            </linearGradient>
                        </defs>
                        <g transform="translate(12,12) scale(1.35) translate(-12,-12)">
                            <polyline points="17 11 12 6 7 11" stroke="url(#esc-rainbow-admin)" />
                            <polyline points="17 18 12 13 7 18" stroke="url(#esc-rainbow-admin)" />
                        </g>
                    </svg>
                </div>
                <div class="min-w-0">
                    <span class="text-sm font-bold text-[var(--esc-panel-text)] tracking-wide">{{
                        panelConfig.appName
                    }}</span>
                    <span
                        class="ml-1.5 rounded bg-[var(--esc-panel-active)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--esc-panel-text-muted)]"
                        >ADMIN</span
                    >
                </div>
                <button
                    type="button"
                    class="-mr-2 ml-auto rounded-lg p-2 text-[var(--esc-panel-text-muted)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] lg:hidden"
                    aria-label="Close navigation"
                    data-testid="esc-nav-close"
                    @click="closeNav"
                >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Nav -->
            <nav role="navigation" aria-label="Admin navigation" class="mt-1 flex-1 space-y-0.5 overflow-y-auto px-3">
                <Link
                    v-for="link in adminLinks"
                    :key="link.href"
                    :href="link.href"
                    :aria-current="isActive(link.href) ? 'page' : undefined"
                    :class="[
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all',
                        isActive(link.href)
                            ? 'bg-[var(--esc-panel-active)] text-[var(--esc-panel-active-text,var(--esc-panel-text))]'
                            : 'text-[var(--esc-panel-text-muted)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]',
                    ]"
                    @click="closeNav"
                >
                    <svg
                        :class="[
                            'h-[18px] w-[18px] shrink-0',
                            isActive(link.href)
                                ? 'text-[var(--esc-panel-active-text,var(--esc-panel-text))]'
                                : 'text-[var(--esc-panel-text-muted)] group-hover:text-[var(--esc-panel-text-tertiary)]',
                        ]"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        viewBox="0 0 24 24"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
                    </svg>
                    {{ link.label }}
                    <PluginBadge :value="link.badge" />
                </Link>
            </nav>

            <!-- Bottom section -->
            <div class="border-t border-[var(--esc-panel-border)] p-3">
                <Link
                    v-if="isAgent"
                    :href="`${prefix}/agent`"
                    class="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] text-[var(--esc-panel-text-muted)] transition-colors hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                        />
                    </svg>
                    Agent Panel
                </Link>
                <Link
                    :href="prefix"
                    class="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] text-[var(--esc-panel-text-muted)] transition-colors hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                        />
                    </svg>
                    Back to App
                </Link>

                <!-- User -->
                <div class="mt-2 flex items-center gap-3 rounded-lg bg-[var(--esc-panel-hover)] px-3 py-2.5">
                    <div
                        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--esc-panel-active)] text-xs font-semibold text-[var(--esc-panel-text-tertiary)]"
                    >
                        {{ userInitial }}
                    </div>
                    <span class="truncate text-sm text-[var(--esc-panel-text-tertiary)]">{{ userName }}</span>
                </div>
            </div>

            <!-- Powered by -->
            <div v-if="showPoweredBy" class="px-4 pb-3">
                <a
                    href="https://escalated.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-[var(--esc-panel-text-muted)] opacity-60 transition-opacity hover:opacity-100"
                >
                    <img
                        :src="
                            isDark
                                ? 'https://escalated.dev/brand/logo-icon-dark.svg'
                                : 'https://escalated.dev/brand/logo-icon-white.svg'
                        "
                        alt="Escalated logo"
                        class="h-3.5 w-3.5"
                    />
                    Powered by Escalated
                </a>
            </div>
        </aside>

        <!-- Main content -->
        <div class="flex min-w-0 flex-1 flex-col lg:pl-64">
            <!-- Top bar -->
            <header
                role="banner"
                class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-header-bg,var(--esc-panel-topbar-bg))] px-4 backdrop-blur-xl sm:px-6"
            >
                <button
                    type="button"
                    class="-ml-2 rounded-lg p-2 text-[var(--esc-panel-header-text,var(--esc-panel-text))] hover:bg-[var(--esc-panel-hover)] lg:hidden"
                    aria-controls="esc-admin-sidebar"
                    :aria-expanded="navOpen ? 'true' : 'false'"
                    aria-label="Open navigation"
                    data-testid="esc-nav-toggle"
                    @click="toggleNav"
                >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                </button>
                <h1 class="truncate text-sm font-semibold text-[var(--esc-panel-header-text,var(--esc-panel-text))]">
                    {{ title }}
                </h1>
            </header>

            <!-- Page content -->
            <main ref="contentRoot" role="main" class="min-w-0 flex-1 p-4 sm:p-6">
                <slot />
            </main>
        </div>
    </div>

    <!-- MODE 2a: Agent workspace inside the host layout (opt-in: layoutScope 'agent') -->
    <component :is="agentHostLayout" v-else-if="isAgentSection && agentHostLayout">
        <template #header>
            <h2 class="text-xl font-semibold leading-tight">{{ title }}</h2>
        </template>
        <AgentShell :title="title" :full-bleed="fullBleed">
            <slot />
        </AgentShell>
    </component>

    <!-- MODE 2: Agent: rail + top bar shell, the same family as admin -->
    <AgentShell v-else-if="isAgentSection" :title="title" :full-bleed="fullBleed">
        <slot />
    </AgentShell>

    <!-- MODE 3: Customer pages — use host app layout if provided -->
    <component :is="customerHostLayout" v-else-if="customerHostLayout">
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold leading-tight text-gray-800">{{ title }}</h2>
                <nav class="flex items-center gap-4 text-sm">
                    <Link :href="prefix" class="text-gray-600 hover:text-gray-900">My Tickets</Link>
                    <Link
                        v-if="kbEnabled && (kbPublic || page.props.auth?.user)"
                        :href="`${prefix}/kb`"
                        class="text-gray-600 hover:text-gray-900"
                    >
                        Knowledge Base
                    </Link>
                    <Link v-if="isAgent" :href="`${prefix}/agent`" class="text-gray-600 hover:text-gray-900">
                        Agent Panel
                    </Link>
                    <Link v-if="isAdmin" :href="`${prefix}/admin/reports`" class="text-gray-600 hover:text-gray-900">
                        Admin
                    </Link>
                </nav>
            </div>
        </template>

        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <slot />
        </div>
    </component>

    <!-- MODE 4: Customer standalone fallback (no host layout) -->
    <div v-else class="min-h-screen bg-gray-50">
        <nav class="border-b border-gray-200 bg-white">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="flex h-14 items-center justify-between">
                    <div class="flex items-center gap-6">
                        <span class="text-lg font-bold text-gray-900">{{ title }}</span>
                        <div class="flex items-center gap-4 text-sm">
                            <Link :href="prefix" class="text-gray-600 hover:text-gray-900">My Tickets</Link>
                            <Link
                                v-if="kbEnabled && (kbPublic || page.props.auth?.user)"
                                :href="`${prefix}/kb`"
                                class="text-gray-600 hover:text-gray-900"
                            >
                                Knowledge Base
                            </Link>
                            <Link v-if="isAgent" :href="`${prefix}/agent`" class="text-gray-600 hover:text-gray-900">
                                Agent Panel
                            </Link>
                            <Link
                                v-if="isAdmin"
                                :href="`${prefix}/admin/reports`"
                                class="text-gray-600 hover:text-gray-900"
                            >
                                Admin
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <main class="flex-1">
            <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <slot />
            </div>
        </main>

        <!-- Powered by -->
        <footer v-if="showPoweredBy" class="border-t border-gray-200 py-3 text-center">
            <a
                href="https://escalated.dev"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-[11px] text-gray-400 transition-colors hover:text-gray-600"
            >
                <img src="https://escalated.dev/brand/logo-icon-white.svg" alt="Escalated logo" class="h-3.5 w-3.5" />
                Powered by Escalated
            </a>
        </footer>
    </div>
</template>

<style>
/* Tables in the panels scroll sideways inside this container rather than
   widening the page. A shadow on an edge says there is more past it; the
   layout keeps data-esc-overflow current (see utils/scrollAffordance.js). */
.esc-table-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
}
.esc-table-scroll[data-esc-overflow='end'] {
    box-shadow: inset -14px 0 12px -12px rgb(0 0 0 / 0.3);
}
.esc-table-scroll[data-esc-overflow='start'] {
    box-shadow: inset 14px 0 12px -12px rgb(0 0 0 / 0.3);
}
.esc-table-scroll[data-esc-overflow='start end'] {
    box-shadow:
        inset 14px 0 12px -12px rgb(0 0 0 / 0.3),
        inset -14px 0 12px -12px rgb(0 0 0 / 0.3);
}
</style>
