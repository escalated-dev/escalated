<script setup>
import { computed, inject, unref } from 'vue';
import { slaOutcome } from '../utils/sla';
import { useI18n } from '../composables/useI18n';

const props = defineProps({
    dueAt: { type: String, default: null },
    breached: { type: Boolean, default: false },
    label: { type: String, default: 'Due' },
    /**
     * When the clock stopped: `first_response_at` for a first-response SLA,
     * `resolved_at` or `closed_at` for resolution. A stopped clock shows Met
     * or Missed instead of counting down.
     */
    stoppedAt: { type: String, default: null },
});

// The layout provides a computed ref; the ref object itself is always truthy.
const dark = inject(
    'esc-dark',
    computed(() => false),
);
const isDark = computed(() => unref(dark) === true);
const { t } = useI18n();

const outcome = computed(() => slaOutcome(props.dueAt, props.stoppedAt, props.breached));

const timeRemaining = computed(() => {
    if (!props.dueAt) return null;
    const now = new Date();
    const due = new Date(props.dueAt);
    const diff = due - now;
    if (diff <= 0) return { text: 'Overdue', overdue: true };

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return { text: `${days}d ${hours % 24}h`, overdue: false };
    }
    return { text: `${hours}h ${minutes}m`, overdue: false };
});

const BAD = {
    dark: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
    light: 'border-red-300 bg-red-50 text-red-700',
};
const WARN = {
    dark: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    light: 'border-yellow-300 bg-yellow-50 text-yellow-700',
};
const GOOD = {
    dark: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    light: 'border-green-300 bg-green-50 text-green-700',
};

const statusClass = computed(() => {
    const tone = isDark.value ? 'dark' : 'light';
    if (outcome.value === 'met') return GOOD[tone];
    if (outcome.value === 'missed') return BAD[tone];
    if (props.breached || timeRemaining.value?.overdue) return BAD[tone];
    const hoursLeft = (new Date(props.dueAt) - new Date()) / 3600000;
    if (hoursLeft < 2) return WARN[tone];
    return GOOD[tone];
});
</script>

<template>
    <div
        v-if="dueAt"
        role="timer"
        aria-live="polite"
        aria-label="SLA timer"
        :class="['rounded-lg border px-3 py-2 text-sm', statusClass]"
        :data-sla-outcome="outcome || undefined"
    >
        <div class="font-medium">{{ label }}</div>
        <div class="text-xs">
            <span v-if="outcome === 'met'">{{ t('sla.met') }}</span>
            <span v-else-if="outcome === 'missed'">{{ t('sla.missed') }}</span>
            <span v-else-if="breached">SLA Breached</span>
            <span v-else>{{ timeRemaining?.text }}</span>
        </div>
    </div>
</template>
