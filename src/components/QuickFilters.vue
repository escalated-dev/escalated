<script setup>
import { ref, computed, inject } from 'vue';

const props = defineProps({
    currentUserId: { type: [Number, String], default: null },
});

const emit = defineEmits(['filter']);
const escDark = inject(
    'esc-dark',
    computed(() => false),
);
const activeChip = ref(null);

const chips = computed(() => {
    const list = [
        { key: 'my_tickets', label: 'My Tickets', filter: { assigned_to: props.currentUserId } },
        { key: 'unassigned', label: 'Unassigned', filter: { unassigned: true } },
        { key: 'urgent', label: 'Urgent+', filter: { priority: 'urgent' } },
        { key: 'sla_breaching', label: 'SLA Breaching', filter: { sla_breached: true } },
        { key: 'following', label: 'Following', filter: { following: true } },
    ];
    if (props.currentUserId) return list;
    return list.filter((c) => c.key !== 'my_tickets');
});

function toggle(chip) {
    if (activeChip.value === chip.key) {
        activeChip.value = null;
        emit('filter', {});
    } else {
        activeChip.value = chip.key;
        emit('filter', chip.filter);
    }
}
</script>

<template>
    <div class="flex flex-wrap items-center gap-2">
        <button
            v-for="chip in chips"
            :key="chip.key"
            :class="[
                'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                activeChip === chip.key
                    ? escDark
                        ? 'bg-gradient-to-r from-[var(--esc-panel-accent)]/20 to-[var(--esc-panel-accent-secondary)]/20 text-[var(--esc-panel-text)] ring-1 ring-[var(--esc-panel-accent)]/30'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 ring-1 ring-blue-200'
                    : escDark
                      ? 'bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-tertiary)] ring-1 ring-[var(--esc-panel-border)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]'
                      : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100',
            ]"
            @click="toggle(chip)"
        >
            {{ chip.label }}
        </button>
    </div>
</template>
