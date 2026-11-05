<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { router, usePage } from '@inertiajs/vue3';
import { useI18n } from '../composables/useI18n';
import { useRealtime } from '../composables/useRealtime';
import { notificationRoutes, syncNotificationCount, useNotifications } from '../composables/useNotifications';
import { absoluteTime, relativeTime } from '../utils/agentTicket';
import PanelIcon from './PanelIcon.vue';

/**
 * The bell in the agent top bar: the unread count and, on click, the agent's
 * notifications newest first, a page at a time. AgentShell renders it only
 * when the backend shares `escalated.notifications` and has the
 * `escalated.agent.notifications.index` route (ADR 2026-11-05-agent-panel-data).
 */
const props = defineProps({
    /** The signed-in agent, for `notification.created` on `escalated.agents.{id}`. */
    userId: { type: [Number, String], default: null },
});

const page = usePage();
const { t } = useI18n();
const {
    unreadCount,
    items,
    loading,
    failed,
    unreadOnly,
    hasMore,
    loaded,
    load,
    loadMore,
    markRead,
    markAllRead,
    receive,
    setUnreadOnly,
} = useNotifications();

// The shared count arrives with every page.
watch(
    () => page.props.escalated?.notifications,
    (shared) => syncNotificationCount(shared),
    { immediate: true },
);

const canMarkAll = computed(() => !!notificationRoutes().readAll);
const badge = computed(() => (unreadCount.value > 99 ? '99+' : String(unreadCount.value)));
const label = computed(() =>
    unreadCount.value
        ? t('agent_panel.notifications.label_unread', { count: unreadCount.value })
        : t('agent_panel.notifications.title'),
);

// --- Popover ---------------------------------------------------------------------
const open = ref(false);
const rootRef = ref(null);
const triggerRef = ref(null);
const panelRef = ref(null);

function close(returnFocus = false) {
    open.value = false;
    if (returnFocus) triggerRef.value?.focus();
}

function toggle() {
    open.value = !open.value;
}

function onOutside(event) {
    if (rootRef.value && !rootRef.value.contains(event.target)) close();
}

watch(open, async (isOpen) => {
    if (typeof document === 'undefined') return;
    if (isOpen) {
        document.addEventListener('mousedown', onOutside, true);
        load();
        await nextTick();
        panelRef.value?.focus();
    } else {
        document.removeEventListener('mousedown', onOutside, true);
    }
});

onBeforeUnmount(() => {
    if (typeof document !== 'undefined') document.removeEventListener('mousedown', onOutside, true);
});

// --- Items --------------------------------------------------------------------------
const TYPE_ICONS = {
    ticket_assigned: { icon: 'user' },
    ticket_reply: { icon: 'envelope' },
    mention: { icon: 'chat' },
    sla_warning: { icon: 'clock', tone: 'var(--esc-sla-warn)' },
    sla_breached: { icon: 'warning', tone: 'var(--esc-sla-breach)' },
    chat_transferred: { icon: 'chat' },
    new_ticket: { icon: 'ticket' },
    ticket_escalated: { icon: 'flag' },
    status_changed: { icon: 'refresh' },
};

function typeIcon(item) {
    return TYPE_ICONS[item.type] || { icon: 'bell' };
}

const now = ref(Date.now());
watch(open, (isOpen) => {
    if (isOpen) now.value = Date.now();
});

function isSameOrigin(url) {
    try {
        return new URL(url, window.location.href).origin === window.location.origin;
    } catch {
        return false;
    }
}

function openItem(item) {
    markRead(item);
    if (!item.url) return;
    close();
    if (isSameOrigin(item.url)) router.visit(item.url);
    else window.location.href = item.url;
}

async function onMarkAll() {
    await markAllRead();
}

// --- Realtime ---------------------------------------------------------------------------
const { listenScoped } = useRealtime({
    channelPrefix: () => page.props.escalated?.broadcasting?.channel_prefix,
});
if (typeof listenScoped === 'function') {
    listenScoped(() => (props.userId == null ? null : `agents.${props.userId}`), {
        '.notification.created': (payload) => receive(payload?.notification || payload),
    });
}
</script>

<template>
    <div ref="rootRef" class="relative" @keydown.esc.stop="close(true)">
        <button
            ref="triggerRef"
            type="button"
            class="relative flex h-8 w-8 items-center justify-center rounded-[var(--esc-radius,6px)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
            aria-haspopup="dialog"
            :aria-expanded="open ? 'true' : 'false'"
            :aria-label="label"
            :title="label"
            data-testid="esc-notifications-bell"
            @click="toggle"
        >
            <PanelIcon name="bell" class="h-5 w-5" />
            <span
                v-if="unreadCount > 0"
                class="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--esc-panel-primary-bg,var(--esc-panel-accent))] px-1 text-[10px] font-semibold tabular-nums text-[var(--esc-panel-primary-text,#fff)]"
                aria-hidden="true"
                data-testid="esc-notifications-count"
                >{{ badge }}</span
            >
        </button>

        <div
            v-if="open"
            ref="panelRef"
            role="dialog"
            :aria-label="t('agent_panel.notifications.title')"
            tabindex="-1"
            class="absolute right-0 top-full z-40 mt-1 flex max-h-[min(32rem,calc(100dvh-4rem))] w-[min(23rem,calc(100vw-1.5rem))] flex-col rounded-[var(--esc-radius-lg,8px)] border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-sidebar-bg)] shadow-xl focus:outline-none"
            data-testid="esc-notifications"
        >
            <div class="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--esc-panel-border)] pl-3.5 pr-2">
                <h2 class="flex-1 text-[13px] font-semibold text-[var(--esc-panel-text)]">
                    {{ t('agent_panel.notifications.title') }}
                </h2>
                <button
                    type="button"
                    :aria-pressed="unreadOnly ? 'true' : 'false'"
                    :class="[
                        'h-6 rounded-[var(--esc-radius,6px)] px-2 text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]',
                        unreadOnly
                            ? 'bg-[var(--esc-panel-active)] text-[var(--esc-panel-text)]'
                            : 'text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)]',
                    ]"
                    data-testid="esc-notifications-unread-only"
                    @click="setUnreadOnly(!unreadOnly)"
                >
                    {{ t('agent_panel.notifications.unread_only') }}
                </button>
                <button
                    v-if="canMarkAll"
                    type="button"
                    class="h-6 rounded-[var(--esc-radius,6px)] px-2 text-[12px] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="unreadCount === 0"
                    data-testid="esc-notifications-read-all"
                    @click="onMarkAll"
                >
                    {{ t('agent_panel.notifications.mark_all_read') }}
                </button>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto" :aria-busy="loading ? 'true' : undefined">
                <ul v-if="items.length" data-testid="esc-notifications-list">
                    <li
                        v-for="item in items"
                        :key="item.id"
                        class="border-b border-[var(--esc-panel-border)] last:border-b-0"
                    >
                        <button
                            type="button"
                            class="relative flex w-full gap-2.5 py-2.5 pl-4 pr-3.5 text-left hover:bg-[var(--esc-panel-hover)] focus-visible:bg-[var(--esc-panel-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--esc-panel-accent)]"
                            :data-unread="item.read_at ? undefined : 'true'"
                            data-testid="esc-notification"
                            @click="openItem(item)"
                        >
                            <span
                                v-if="!item.read_at"
                                class="absolute left-1.5 top-[17px] h-1.5 w-1.5 rounded-full bg-[var(--esc-panel-accent)]"
                                ><span class="sr-only">{{ t('agent_panel.notifications.unread') }}</span></span
                            >
                            <PanelIcon
                                :name="typeIcon(item).icon"
                                class="mt-0.5 h-4 w-4 shrink-0"
                                :style="{ color: typeIcon(item).tone || 'var(--esc-panel-text-tertiary)' }"
                            />
                            <span class="min-w-0 flex-1">
                                <span
                                    :class="[
                                        'block text-[13px] leading-5',
                                        item.read_at
                                            ? 'text-[var(--esc-panel-text-secondary)]'
                                            : 'font-medium text-[var(--esc-panel-text)]',
                                    ]"
                                    >{{ item.title }}</span
                                >
                                <span
                                    v-if="item.body"
                                    class="block truncate text-[12px] leading-4 text-[var(--esc-panel-text-tertiary)]"
                                    >{{ item.body }}</span
                                >
                            </span>
                            <time
                                class="shrink-0 text-[12px] leading-5 tabular-nums text-[var(--esc-panel-text-tertiary)]"
                                :datetime="item.created_at"
                                :title="absoluteTime(item.created_at)"
                                >{{ relativeTime(item.created_at, t, now) }}</time
                            >
                        </button>
                    </li>
                </ul>
                <p
                    v-else-if="failed"
                    class="px-4 py-8 text-center text-[13px] text-[var(--esc-panel-text-tertiary)]"
                    data-testid="esc-notifications-failed"
                >
                    {{ t('agent_panel.notifications.failed') }}
                    <button
                        type="button"
                        class="ml-1 rounded underline underline-offset-2 hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                        @click="load()"
                    >
                        {{ t('agent_panel.notifications.retry') }}
                    </button>
                </p>
                <p
                    v-else-if="loaded && !loading"
                    class="px-4 py-8 text-center text-[13px] text-[var(--esc-panel-text-tertiary)]"
                    data-testid="esc-notifications-empty"
                >
                    {{
                        unreadOnly ? t('agent_panel.notifications.empty_unread') : t('agent_panel.notifications.empty')
                    }}
                </p>
                <p v-else-if="loading" class="px-4 py-8 text-center text-[13px] text-[var(--esc-panel-text-tertiary)]">
                    {{ t('agent_panel.notifications.loading') }}
                </p>
                <div v-if="hasMore" class="border-t border-[var(--esc-panel-border)] p-1.5">
                    <button
                        type="button"
                        class="h-7 w-full rounded-[var(--esc-radius,6px)] text-[12px] text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)] disabled:opacity-50"
                        :disabled="loading"
                        data-testid="esc-notifications-more"
                        @click="loadMore"
                    >
                        {{
                            loading ? t('agent_panel.notifications.loading') : t('agent_panel.notifications.show_more')
                        }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
