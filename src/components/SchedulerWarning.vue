<script setup>
import { computed, inject, unref } from 'vue';

/**
 * Warns admins that the recurring jobs (SLA checks, escalation rules,
 * automations, snooze wake-ups) are not running.
 *
 * The backend sends an optional `scheduler` page prop:
 * `{ healthy, last_run_at, message, commands: [{ command, interval }] }`,
 * with `healthy` false when the SLA check's heartbeat is missing or older
 * than 15 minutes. Nothing renders when the prop is absent, null or healthy.
 */
const props = defineProps({
    scheduler: { type: Object, default: null },
});

const dark = inject(
    'esc-dark',
    computed(() => false),
);
const isDark = computed(() => unref(dark) === true);

const show = computed(() => !!props.scheduler && props.scheduler.healthy === false);
const commands = computed(() =>
    (Array.isArray(props.scheduler?.commands) ? props.scheduler.commands : []).filter((c) => c && c.command),
);
const lastRun = computed(() => {
    const value = props.scheduler?.last_run_at;
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
});
</script>

<template>
    <div
        v-if="show"
        role="alert"
        data-testid="esc-scheduler-warning"
        :class="[
            'mb-6 rounded-lg border px-4 py-3 text-sm',
            isDark
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                : 'border-amber-300 bg-amber-50 text-amber-900',
        ]"
    >
        <p class="font-semibold">Recurring jobs are not running</p>
        <p v-if="scheduler.message" class="mt-1">{{ scheduler.message }}</p>
        <p :class="['mt-1 text-xs', isDark ? 'text-amber-300/80' : 'text-amber-800']">
            {{ lastRun ? `Last SLA check: ${lastRun}.` : 'The SLA check has never run.' }}
        </p>
        <ul v-if="commands.length" class="mt-2 space-y-1" data-testid="esc-scheduler-commands">
            <li v-for="item in commands" :key="item.command" class="flex flex-wrap items-baseline gap-2">
                <code
                    :class="[
                        'rounded px-1.5 py-0.5 font-mono text-xs',
                        isDark ? 'bg-black/40 text-amber-100' : 'bg-white text-amber-900 ring-1 ring-amber-200',
                    ]"
                    >{{ item.command }}</code
                >
                <span v-if="item.interval" class="text-xs">{{ item.interval }}</span>
            </li>
        </ul>
    </div>
</template>
