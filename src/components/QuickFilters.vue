<script setup>
import { ref, computed, inject } from 'vue';

const props = defineProps({
    currentUserId: { type: [Number, String], default: null },
});

const emit = defineEmits(['filter']);
const escDark = inject('esc-dark', computed(() => false));
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
    return list.filter(c => c.key !== 'my_tickets');
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
        <button v-for="chip in chips" :key="chip.key" @click="toggle(chip)"
                :class="['rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                         activeChip === chip.key
                             ? (escDark
                                 ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white ring-1 ring-cyan-500/30'
                                 : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 ring-1 ring-blue-200')
                             : (escDark
                                 ? 'bg-white/[0.04] text-neutral-400 ring-1 ring-white/[0.06] hover:bg-white/[0.06] hover:text-neutral-300'
                                 : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100')]">
            {{ chip.label }}
        </button>
    </div>
</template>
