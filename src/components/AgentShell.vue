<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Link, router, usePage } from '@inertiajs/vue3';
import { useI18n } from '../composables/useI18n';
import { useKeyboardShortcuts } from '../composables/useKeyboardShortcuts';
import { agentCommands } from '../composables/useAgentCommands';
import { AGENT_STATUSES, useAgentStatus } from '../composables/useAgentStatus';
import { watchScrollAffordance } from '../utils/scrollAffordance';
import {
    activeQueueKey,
    normalisePrefix,
    recallInbox,
    ticketsUrl,
    ticketUrl,
    viewIcon,
    workspaceQueues,
} from '../utils/agentQueues';
import ActiveChatsPanel from './ActiveChatsPanel.vue';
import CommandPalette from './CommandPalette.vue';
import PanelIcon from './PanelIcon.vue';
import PanelMenu from './PanelMenu.vue';
import SaveViewDialog from './SaveViewDialog.vue';

/**
 * The agent panel shell: a left rail with the queues, a slim top bar with the
 * sections and search, and the command palette. EscalatedLayout renders it for
 * every page under /agent.
 *
 * Everything it shows comes from shared page props. Counts, views and stats
 * come from the optional `inbox` prop; a backend that does not send it gets
 * the same rail without numbers.
 */
const props = defineProps({
    title: { type: String, default: '' },
    /** Pages with their own panes (the inbox, a ticket) fill the area edge to edge. */
    fullBleed: { type: Boolean, default: false },
});

const page = usePage();
const panelConfig = inject('escalated-panel', { appName: 'Escalated', logo: null, mode: 'dark' });
const { t } = useI18n();

const escalated = computed(() => page.props.escalated || {});
const prefix = computed(() => normalisePrefix(escalated.value.prefix));
const user = computed(() => page.props.auth?.user || null);
const userId = computed(() => user.value?.id ?? null);
const userName = computed(() => user.value?.name || t('agent_panel.nav.agent'));
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());
const isAdmin = computed(() => escalated.value.is_admin === true);
const showPoweredBy = computed(() => escalated.value.show_powered_by !== false);
const kbEnabled = computed(() => escalated.value.knowledge_base_enabled !== false);
const chatEnabled = computed(() => escalated.value.chat_enabled === true);
const activeChats = computed(() => escalated.value.active_chats || []);

const inbox = computed(() => page.props.inbox || null);
const counts = computed(() => inbox.value?.counts || {});
const views = computed(() => (Array.isArray(inbox.value?.views) ? inbox.value.views : []));
const canSaveViews = computed(() => Array.isArray(inbox.value?.views));

const currentUrl = computed(() => page.url || '');
const path = computed(() => currentUrl.value.split(/[?#]/)[0]);

const queueLabels = computed(() => ({
    mine: t('agent_panel.nav.inbox'),
    unassigned: t('agent_panel.nav.unassigned'),
    all: t('agent_panel.nav.all_tickets'),
}));

const queues = computed(() =>
    workspaceQueues(userId.value).map((queue) => ({
        ...queue,
        label: queueLabels.value[queue.key],
        href: ticketsUrl(prefix.value, queue.filters),
        count: counts.value[queue.key],
    })),
);

const viewLinks = computed(() =>
    views.value.map((view) => ({
        key: `view:${view.id}`,
        label: view.name,
        icon: viewIcon(view),
        count: view.count,
        href: ticketsUrl(prefix.value, view.filters || {}),
    })),
);

const onTicketPages = computed(() => path.value.startsWith(`${prefix.value}/agent/tickets`));

// The queue the page is showing. The backend's `queue` prop says so outright;
// otherwise it is read off the URL, and a ticket page falls back to the
// queue its list came from.
const activeKey = computed(() => {
    if (!onTicketPages.value) return null;
    // A single ticket's URL says nothing about the queue: use the backend's
    // queue prop, else the queue of the list it was opened from.
    if (path.value !== `${prefix.value}/agent/tickets` && !page.props.queue?.key) {
        return recallInbox()?.queueKey ?? null;
    }
    return activeQueueKey({
        url: currentUrl.value,
        userId: userId.value,
        views: views.value,
        queue: page.props.queue || null,
    });
});

const sections = computed(() => {
    const p = prefix.value;
    const list = [
        {
            key: 'tickets',
            label: t('agent_panel.nav.tickets'),
            href: `${p}/agent/tickets`,
            active: onTicketPages.value,
        },
        {
            key: 'dashboard',
            label: t('agent_panel.nav.dashboard'),
            href: `${p}/agent`,
            active: path.value === `${p}/agent`,
        },
    ];
    if (kbEnabled.value) {
        list.push({ key: 'kb', label: t('agent_panel.nav.knowledge_base'), href: `${p}/kb`, active: false });
    }
    return list;
});

// --- Drawer (below lg) ---------------------------------------------------
const navOpen = ref(false);
function closeNav() {
    navOpen.value = false;
}
watch(currentUrl, closeNav);

// --- Command palette -------------------------------------------------------
const paletteOpen = ref(false);
const pageCommands = agentCommands();

const isMac = ref(false);
const paletteHint = computed(() => (isMac.value ? '⌘K' : 'Ctrl K'));

function visit(href) {
    router.visit(href);
}

const navigationCommands = computed(() => {
    const go = t('agent_panel.palette.group_navigation');
    return [
        ...queues.value.map((queue) => ({
            id: `queue-${queue.key}`,
            label: queue.label,
            icon: queue.icon,
            group: go,
            hint: { mine: 'g i', unassigned: 'g u', all: 'g a' }[queue.key],
            run: () => visit(queue.href),
        })),
        ...viewLinks.value.map((view) => ({
            id: view.key,
            label: view.label,
            icon: view.icon,
            group: go,
            run: () => visit(view.href),
        })),
        {
            id: 'dashboard',
            label: t('agent_panel.nav.dashboard'),
            icon: 'home',
            group: go,
            run: () => visit(`${prefix.value}/agent`),
        },
    ];
});

const paletteCommands = computed(() => [...pageCommands.value, ...navigationCommands.value]);

function openTicket(reference) {
    visit(ticketUrl(prefix.value, reference));
}

function searchTickets(query) {
    visit(ticketsUrl(prefix.value, { search: query }));
}

function onGlobalKeydown(event) {
    if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        paletteOpen.value = !paletteOpen.value;
        return;
    }
    if (event.key === 'Escape' && navOpen.value) closeNav();
}

function goToQueue(key) {
    const queue = queues.value.find((q) => q.key === key);
    if (queue) visit(queue.href);
}

useKeyboardShortcuts(
    {
        'g i': () => goToQueue('mine'),
        'g u': () => goToQueue('unassigned'),
        'g a': () => goToQueue('all'),
    },
    { enabled: computed(() => !paletteOpen.value) },
);

// --- Saved views -----------------------------------------------------------
const showSaveView = ref(false);
const currentFilters = computed(() => page.props.filters || {});
function onViewSaved() {
    router.reload({ only: ['inbox'] });
}

// --- Online status ------------------------------------------------------------
// The agent's own availability. The backend may share it as
// `escalated.agent_status` (or the live-chat `chat_status`); otherwise the
// last choice in this browser is used. See useAgentStatus.
const statusMenuOpen = ref(false);
const topbarStatusOpen = ref(false);
const { status: agentStatus, setStatus: setAgentStatus } = useAgentStatus({
    initial: escalated.value.agent_status || escalated.value.chat_status || null,
});
const STATUS_COLORS = {
    online: 'var(--esc-sla-ok)',
    away: 'var(--esc-priority-medium)',
    offline: 'var(--esc-panel-text-tertiary)',
};
const statusItems = computed(() =>
    AGENT_STATUSES.map((value) => ({
        key: value,
        label: t(`agent_panel.status.${value}`),
        dot: STATUS_COLORS[value],
        checked: value === agentStatus.value,
    })),
);
const currentStatus = computed(() => ({
    label: t(`agent_panel.status.${agentStatus.value}`),
    color: STATUS_COLORS[agentStatus.value],
}));

function setStatus(item) {
    setAgentStatus(item.key);
}

function navItemClass(active) {
    return [
        'group flex h-8 items-center gap-2.5 rounded-[var(--esc-radius,6px)] px-2.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]',
        active
            ? 'bg-[var(--esc-panel-active)] font-medium text-[var(--esc-panel-active-text,var(--esc-panel-text))]'
            : 'text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)]',
    ];
}

function formatCount(value) {
    if (typeof value !== 'number') return '';
    return value > 999 ? '999+' : String(value);
}

// Tables scroll sideways inside `.esc-table-scroll`; mark the edges that have
// more content past them, as the admin layout does.
const contentRoot = ref(null);
let stopScrollAffordance = () => {};

onMounted(() => {
    isMac.value = /Mac|iPhone|iPad/.test(window.navigator?.platform || window.navigator?.userAgent || '');
    window.addEventListener('keydown', onGlobalKeydown);
    stopScrollAffordance = watchScrollAffordance(contentRoot.value);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onGlobalKeydown);
    stopScrollAffordance();
});

defineExpose({ openPalette: () => (paletteOpen.value = true) });
</script>

<template>
    <div
        class="flex h-[var(--esc-shell-height,100dvh)] overflow-hidden bg-[var(--esc-panel-bg)] text-[var(--esc-panel-text)]"
        :style="{ colorScheme: panelConfig.mode === 'light' ? 'light' : 'dark' }"
        data-testid="esc-agent-shell"
    >
        <div
            v-if="navOpen"
            class="fixed inset-0 z-30 bg-black/40 lg:hidden"
            aria-hidden="true"
            data-testid="esc-nav-backdrop"
            @click="closeNav"
        ></div>

        <!-- Rail -->
        <aside
            id="esc-agent-rail"
            :class="[
                // Below lg the rail is a drawer. Only max-lg: variants, so nothing
                // has to be undone from lg up.
                'flex w-60 shrink-0 flex-col border-r border-[var(--esc-panel-border)] bg-[var(--esc-panel-sidebar-bg)] max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:max-w-[85vw] max-lg:transition-[transform,visibility] max-lg:duration-200',
                navOpen
                    ? 'max-lg:visible max-lg:translate-x-0 max-lg:shadow-2xl'
                    : 'max-lg:invisible max-lg:-translate-x-full',
            ]"
            data-testid="esc-agent-rail"
        >
            <div class="flex h-12 shrink-0 items-center gap-2.5 border-b border-[var(--esc-panel-border)] px-4">
                <div
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--esc-panel-logo-tile-bg,var(--esc-panel-border-input))] text-[var(--esc-panel-logo-tile-fg,var(--esc-panel-text))]"
                    data-testid="esc-logo-tile"
                >
                    <img
                        v-if="typeof panelConfig.logo === 'string'"
                        :src="panelConfig.logo"
                        class="h-4 w-4"
                        alt="Escalated logo"
                    />
                    <component :is="panelConfig.logo" v-else-if="panelConfig.logo" class="h-4 w-4" />
                    <svg
                        v-else
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <defs>
                            <linearGradient id="esc-rainbow-agent" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#f97316" />
                                <stop offset="30%" stop-color="#eab308" />
                                <stop offset="50%" stop-color="#22c55e" />
                                <stop offset="70%" stop-color="#3b82f6" />
                                <stop offset="100%" stop-color="#8b5cf6" />
                            </linearGradient>
                        </defs>
                        <g transform="translate(12,12) scale(1.35) translate(-12,-12)">
                            <polyline points="17 11 12 6 7 11" stroke="url(#esc-rainbow-agent)" />
                            <polyline points="17 18 12 13 7 18" stroke="url(#esc-rainbow-agent)" />
                        </g>
                    </svg>
                </div>
                <span class="truncate text-sm font-semibold tracking-wide text-[var(--esc-panel-text)]">{{
                    panelConfig.appName
                }}</span>
                <button
                    type="button"
                    class="-mr-1.5 ml-auto rounded-[var(--esc-radius,6px)] p-1.5 text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] lg:hidden"
                    :aria-label="t('agent_panel.nav.close_navigation')"
                    data-testid="esc-nav-close"
                    @click="closeNav"
                >
                    <PanelIcon name="x" class="h-4 w-4" />
                </button>
            </div>

            <nav :aria-label="t('agent_panel.nav.label')" class="flex-1 overflow-y-auto px-2.5 py-3">
                <div class="px-2.5 pb-1.5 text-[12px] font-medium text-[var(--esc-panel-text-tertiary)]">
                    {{ t('agent_panel.nav.workspace') }}
                </div>
                <ul class="space-y-px" data-testid="esc-rail-queues">
                    <li v-for="queue in queues" :key="queue.key">
                        <Link
                            :href="queue.href"
                            :aria-current="activeKey === queue.key ? 'page' : undefined"
                            :class="navItemClass(activeKey === queue.key)"
                            @click="closeNav"
                        >
                            <PanelIcon :name="queue.icon" class="h-4 w-4 shrink-0 opacity-80" />
                            <span class="min-w-0 flex-1 truncate">{{ queue.label }}</span>
                            <span
                                v-if="formatCount(queue.count)"
                                class="text-[12px] tabular-nums text-[var(--esc-panel-text-tertiary)]"
                                >{{ formatCount(queue.count) }}</span
                            >
                        </Link>
                    </li>
                    <li v-if="activeChats.length">
                        <Link
                            :href="ticketsUrl(prefix, { live_chat: 1 })"
                            :aria-current="activeKey === 'live' ? 'page' : undefined"
                            :class="navItemClass(activeKey === 'live')"
                            data-testid="esc-rail-live-chats"
                            @click="closeNav"
                        >
                            <PanelIcon name="chat" class="h-4 w-4 shrink-0 opacity-80" />
                            <span class="min-w-0 flex-1 truncate">{{ t('agent_panel.nav.live_chats') }}</span>
                            <span class="text-[12px] tabular-nums text-[var(--esc-panel-text-tertiary)]">{{
                                activeChats.length
                            }}</span>
                        </Link>
                    </li>
                </ul>

                <template v-if="viewLinks.length || canSaveViews">
                    <div class="mt-5 flex items-center justify-between px-2.5 pb-1.5">
                        <span class="text-[12px] font-medium text-[var(--esc-panel-text-tertiary)]">{{
                            t('agent_panel.nav.views')
                        }}</span>
                        <button
                            v-if="canSaveViews"
                            type="button"
                            class="-mr-1 rounded p-0.5 text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                            :aria-label="t('agent_panel.nav.new_view')"
                            :title="t('agent_panel.nav.new_view')"
                            data-testid="esc-rail-new-view"
                            @click="showSaveView = true"
                        >
                            <PanelIcon name="plus" class="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <ul class="space-y-px" data-testid="esc-rail-views">
                        <li v-for="view in viewLinks" :key="view.key">
                            <Link
                                :href="view.href"
                                :aria-current="activeKey === view.key ? 'page' : undefined"
                                :class="navItemClass(activeKey === view.key)"
                                @click="closeNav"
                            >
                                <PanelIcon :name="view.icon" class="h-4 w-4 shrink-0 opacity-80" />
                                <span class="min-w-0 flex-1 truncate">{{ view.label }}</span>
                                <span
                                    v-if="formatCount(view.count)"
                                    class="text-[12px] tabular-nums text-[var(--esc-panel-text-tertiary)]"
                                    >{{ formatCount(view.count) }}</span
                                >
                            </Link>
                        </li>
                    </ul>
                </template>
            </nav>

            <!-- Footer -->
            <div class="shrink-0 border-t border-[var(--esc-panel-border)] p-2.5">
                <Link v-if="isAdmin" :href="`${prefix}/admin/reports`" :class="navItemClass(false)">
                    <PanelIcon name="cog" class="h-4 w-4 shrink-0 opacity-80" />
                    {{ t('agent_panel.nav.admin') }}
                </Link>
                <Link :href="prefix" :class="[navItemClass(false), 'whitespace-nowrap']">
                    <PanelIcon name="exit" class="h-4 w-4 shrink-0 opacity-80" />
                    {{ t('agent_panel.nav.back_to_app') }}
                </Link>
                <div class="relative mt-1.5">
                    <button
                        type="button"
                        class="flex w-full items-center gap-2.5 rounded-[var(--esc-radius,6px)] px-2 py-1.5 text-left hover:bg-[var(--esc-panel-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        aria-haspopup="menu"
                        :aria-expanded="statusMenuOpen ? 'true' : 'false'"
                        data-testid="esc-rail-user"
                        @click="statusMenuOpen = !statusMenuOpen"
                    >
                        <span
                            class="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--esc-panel-active)] text-[12px] font-semibold text-[var(--esc-panel-text-secondary)]"
                            aria-hidden="true"
                        >
                            {{ userInitial }}
                            <span
                                class="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-[var(--esc-panel-sidebar-bg)]"
                                :style="{ background: currentStatus.color }"
                                data-testid="esc-status-dot"
                            ></span>
                        </span>
                        <span class="min-w-0 flex-1">
                            <span class="block truncate text-[13px] font-medium text-[var(--esc-panel-text)]">{{
                                userName
                            }}</span>
                            <span class="block text-[12px] text-[var(--esc-panel-text-tertiary)]">
                                {{ currentStatus.label }}
                            </span>
                        </span>
                        <PanelIcon
                            name="chevronUpDown"
                            class="h-4 w-4 shrink-0 text-[var(--esc-panel-text-tertiary)]"
                        />
                    </button>
                    <PanelMenu
                        v-model:open="statusMenuOpen"
                        :items="statusItems"
                        :label="t('agent_panel.status.label')"
                        direction="up"
                        width="w-full"
                        @select="setStatus"
                    />
                </div>
                <a
                    v-if="showPoweredBy"
                    href="https://escalated.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mt-1.5 block px-2 text-[11px] text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-tertiary)]"
                    >Powered by Escalated</a
                >
            </div>
        </aside>

        <!-- Main column -->
        <div class="flex min-w-0 flex-1 flex-col">
            <header
                role="banner"
                class="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-header-bg,var(--esc-panel-bg))] px-3 sm:px-4"
                data-testid="esc-agent-topbar"
            >
                <button
                    type="button"
                    class="-ml-1 rounded-[var(--esc-radius,6px)] p-1.5 text-[var(--esc-panel-header-text,var(--esc-panel-text))] hover:bg-[var(--esc-panel-hover)] lg:hidden"
                    aria-controls="esc-agent-rail"
                    :aria-expanded="navOpen ? 'true' : 'false'"
                    :aria-label="t('agent_panel.nav.open_navigation')"
                    data-testid="esc-nav-toggle"
                    @click="navOpen = !navOpen"
                >
                    <PanelIcon name="menu" class="h-5 w-5" />
                </button>
                <nav :aria-label="t('agent_panel.nav.sections')" class="flex h-full items-stretch gap-1">
                    <Link
                        v-for="section in sections"
                        :key="section.key"
                        :href="section.href"
                        :aria-current="section.active ? 'page' : undefined"
                        :class="[
                            'relative flex items-center px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--esc-panel-accent)]',
                            section.active
                                ? 'text-[var(--esc-panel-header-text,var(--esc-panel-text))] after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:bg-[var(--esc-panel-accent)]'
                                : 'text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text)]',
                        ]"
                    >
                        {{ section.label }}
                    </Link>
                </nav>
                <h1 class="sr-only">{{ props.title }}</h1>
                <button
                    type="button"
                    class="ml-auto flex h-8 w-8 items-center justify-center gap-2 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] text-[13px] text-[var(--esc-panel-text-tertiary)] hover:border-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)] sm:w-64 sm:justify-start sm:px-2.5"
                    :aria-label="t('agent_panel.nav.search')"
                    aria-haspopup="dialog"
                    data-testid="esc-palette-trigger"
                    @click="paletteOpen = true"
                >
                    <PanelIcon name="search" class="h-4 w-4 shrink-0" />
                    <span class="flex-1 text-left max-sm:hidden">{{ t('agent_panel.nav.search_placeholder') }}</span>
                    <kbd
                        class="rounded border border-[var(--esc-panel-border-input)] px-1 font-sans text-[11px] text-[var(--esc-panel-text-tertiary)] max-sm:hidden"
                        >{{ paletteHint }}</kbd
                    >
                </button>
                <div class="relative">
                    <button
                        type="button"
                        class="relative flex h-8 w-8 items-center justify-center rounded-full bg-[var(--esc-panel-active)] text-[12px] font-semibold text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        aria-haspopup="menu"
                        :aria-expanded="topbarStatusOpen ? 'true' : 'false'"
                        :aria-label="`${userName}, ${currentStatus.label}`"
                        :title="`${userName}, ${currentStatus.label}`"
                        data-testid="esc-topbar-user"
                        @click="topbarStatusOpen = !topbarStatusOpen"
                    >
                        <span aria-hidden="true">{{ userInitial }}</span>
                        <span
                            class="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-[var(--esc-panel-header-bg,var(--esc-panel-bg))]"
                            :style="{ background: currentStatus.color }"
                            aria-hidden="true"
                        ></span>
                    </button>
                    <PanelMenu
                        v-model:open="topbarStatusOpen"
                        :items="statusItems"
                        :label="t('agent_panel.status.label')"
                        align="right"
                        width="w-44"
                        @select="setStatus"
                    />
                </div>
            </header>

            <main
                ref="contentRoot"
                role="main"
                :class="['min-h-0 min-w-0 flex-1', fullBleed ? 'overflow-hidden' : 'overflow-y-auto p-4 sm:p-6']"
            >
                <slot v-if="fullBleed" />
                <div v-else class="mx-auto max-w-7xl">
                    <slot />
                </div>
            </main>
        </div>

        <CommandPalette
            v-model:open="paletteOpen"
            :commands="paletteCommands"
            @open-ticket="openTicket"
            @search="searchTickets"
        />
        <SaveViewDialog
            v-if="canSaveViews"
            :show="showSaveView"
            :filters="currentFilters"
            @close="showSaveView = false"
            @saved="onViewSaved"
        />
        <ActiveChatsPanel v-if="chatEnabled && userId" :chats="activeChats" :agent-id="userId" />
    </div>
</template>
