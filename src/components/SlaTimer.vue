<script setup>
import { computed } from 'vue';

const props = defineProps({
    dueAt: { type: String, default: null },
    breached: { type: Boolean, default: false },
    label: { type: String, default: 'Due' },
});

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
    if (props.breached || timeRemaining.value?.overdue) return 'border-red-300 bg-red-50 text-red-700';
    const due = new Date(props.dueAt);
    const hoursLeft = (due - new Date()) / 3600000;
    if (hoursLeft < 2) return 'border-yellow-300 bg-yellow-50 text-yellow-700';
    return 'border-green-300 bg-green-50 text-green-700';
});
</script>

<template>
    <div v-if="dueAt" :class="['rounded-md border px-3 py-2 text-sm', statusClass]">
        <div class="font-medium">{{ label }}</div>
        <div class="text-xs">
            <span v-if="breached">⚠ SLA Breached</span>
            <span v-else>{{ timeRemaining?.text }}</span>
        </div>
    </div>
</template>
