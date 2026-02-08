<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
    dueAt: { type: String, default: null },
    breached: { type: Boolean, default: false },
    label: { type: String, default: 'Due' },
});

const dark = inject('esc-dark', computed(() => false));

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

const statusClass = computed(() => {
    if (props.breached || timeRemaining.value?.overdue) {
        return dark ? 'border-rose-500/20 bg-rose-500/10 text-rose-400' : 'border-red-300 bg-red-50 text-red-700';
    }
    const due = new Date(props.dueAt);
    const hoursLeft = (due - new Date()) / 3600000;
    if (hoursLeft < 2) {
        return dark ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' : 'border-yellow-300 bg-yellow-50 text-yellow-700';
    }
    return dark ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-green-300 bg-green-50 text-green-700';
});
</script>

<template>
    <div v-if="dueAt" :class="['rounded-lg border px-3 py-2 text-sm', statusClass]">
        <div class="font-medium">{{ label }}</div>
        <div class="text-xs">
            <span v-if="breached">SLA Breached</span>
            <span v-else>{{ timeRemaining?.text }}</span>
        </div>
    </div>
</template>
