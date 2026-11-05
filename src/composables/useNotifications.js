import { computed, ref } from 'vue';
import { requestJson, routeOr } from '../utils/agentApi';

/**
 * The agent's in-app notifications (ADR 2026-11-05-agent-panel-data).
 *
 * Available when the backend shares `escalated.notifications` and has the
 * route `escalated.agent.notifications.index`; otherwise the bell is not
 * shown. The unread count starts from the shared prop and follows every
 * answer from the backend. Items load when the popover opens, newest first,
 * a page at a time.
 */
const unreadCount = ref(0);
const items = ref([]);
const page = ref(0);
const lastPage = ref(0);
const loading = ref(false);
const failed = ref(false);
const unreadOnly = ref(false);
let request = 0;

function setCount(value) {
    if (typeof value === 'number' && value >= 0) unreadCount.value = value;
}

export function notificationRoutes() {
    return {
        index: routeOr('escalated.agent.notifications.index'),
        readAll: routeOr('escalated.agent.notifications.read-all'),
        read: (id) => routeOr('escalated.agent.notifications.read', id),
    };
}

/** Take the count the backend shares on each page. */
export function syncNotificationCount(shared) {
    if (shared && typeof shared === 'object') setCount(shared.unread_count);
}

async function load(next = 1) {
    const url = notificationRoutes().index;
    if (!url) return;
    const mine = ++request;
    loading.value = true;
    failed.value = false;
    try {
        const data = await requestJson(url, {
            params: { page: next, unread: unreadOnly.value ? 1 : undefined },
        });
        if (mine !== request) return;
        const rows = Array.isArray(data?.data) ? data.data : [];
        items.value =
            next === 1 ? rows : [...items.value, ...rows.filter((row) => !items.value.some((i) => i.id === row.id))];
        page.value = data?.meta?.current_page ?? next;
        lastPage.value = data?.meta?.last_page ?? next;
        setCount(data?.unread_count);
    } catch {
        if (mine === request) failed.value = true;
    } finally {
        if (mine === request) loading.value = false;
    }
}

async function markRead(item) {
    if (!item || item.read_at) return;
    const url = notificationRoutes().read(item.id);
    if (!url) return;
    const readAt = new Date().toISOString();
    item.read_at = readAt;
    setCount(Math.max(0, unreadCount.value - 1));
    try {
        const data = await requestJson(url, { method: 'POST', body: {} });
        setCount(data?.unread_count);
        if (unreadOnly.value) items.value = items.value.filter((i) => i.id !== item.id);
    } catch {
        item.read_at = null;
        setCount(unreadCount.value + 1);
    }
}

async function markAllRead() {
    const url = notificationRoutes().readAll;
    if (!url) return false;
    const before = items.value.map((item) => [item, item.read_at]);
    const now = new Date().toISOString();
    items.value.forEach((item) => {
        if (!item.read_at) item.read_at = now;
    });
    const count = unreadCount.value;
    setCount(0);
    try {
        const data = await requestJson(url, { method: 'POST', body: {} });
        setCount(data?.unread_count);
        if (unreadOnly.value) items.value = [];
        return true;
    } catch {
        before.forEach(([item, readAt]) => (item.read_at = readAt));
        setCount(count);
        return false;
    }
}

/** A notification broadcast on the agent's channel. */
function receive(item) {
    if (!item || item.id === undefined) return;
    if (!items.value.some((i) => i.id === item.id)) {
        if (page.value > 0) items.value = [item, ...items.value];
        if (!item.read_at) setCount(unreadCount.value + 1);
    }
}

function setUnreadOnly(value) {
    unreadOnly.value = !!value;
    items.value = [];
    page.value = 0;
    lastPage.value = 0;
    return load(1);
}

export function resetNotifications() {
    unreadCount.value = 0;
    items.value = [];
    page.value = 0;
    lastPage.value = 0;
    loading.value = false;
    failed.value = false;
    unreadOnly.value = false;
    request++;
}

export function useNotifications() {
    return {
        unreadCount: computed(() => unreadCount.value),
        items: computed(() => items.value),
        loading: computed(() => loading.value),
        failed: computed(() => failed.value),
        unreadOnly: computed(() => unreadOnly.value),
        hasMore: computed(() => page.value > 0 && page.value < lastPage.value),
        loaded: computed(() => page.value > 0),
        load: () => load(1),
        loadMore: () => load(page.value + 1),
        markRead,
        markAllRead,
        receive,
        setUnreadOnly,
    };
}
