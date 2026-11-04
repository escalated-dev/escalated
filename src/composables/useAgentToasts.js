import { ref } from 'vue';

/**
 * Short confirmations and errors for the agent panel, shown by AgentToasts
 * in the shell. Success toasts leave after four seconds; errors stay until
 * dismissed. One shared queue for the page, at most three at a time.
 */
const toasts = ref([]);
let nextId = 1;
const timers = new Map();

export function dismissToast(id) {
    clearTimeout(timers.get(id));
    timers.delete(id);
    toasts.value = toasts.value.filter((item) => item.id !== id);
}

export function toast(message, tone = 'success') {
    const text = String(message || '').trim();
    if (!text) return null;
    const last = toasts.value[toasts.value.length - 1];
    if (last && last.message === text && last.tone === tone) return last.id;
    const id = nextId++;
    toasts.value = [...toasts.value, { id, message: text, tone }].slice(-3);
    if (tone !== 'error') timers.set(id, setTimeout(() => dismissToast(id), 4000));
    return id;
}

export function clearToasts() {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
    toasts.value = [];
}

export function useAgentToasts() {
    return { toasts, toast, dismiss: dismissToast };
}
