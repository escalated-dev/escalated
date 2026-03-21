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
const activeTab = ref(null);

const tabs = computed(() => {
    const list = [
        { key: null, label: 'All Tickets', filter: {} },
        { key: 'assigned_to_me', label: 'Assigned to Me', filter: { assigned_to: props.currentUserId } },
        { key: 'unassigned', label: 'Unassigned', filter: { unassigned: true } },
        { key: 'urgent', label: 'Urgent', filter: { priority: 'urgent' } },
        { key: 'sla_breaching', label: 'SLA Breaching', filter: { sla_breached: true } },
        { key: 'following', label: 'Following', filter: { following: true } },
    ];
    if (props.currentUserId) return list;
    return list.filter((t) => t.key !== 'assigned_to_me');
});

function selectTab(tab) {
    activeTab.value = tab.key;
    emit('filter', tab.filter);
}
</script>

<template>
    <div
        :class="['flex items-center gap-0 border-b', escDark ? 'border-white/[0.08]' : 'border-gray-200']"
        role="tablist"
        aria-label="Ticket view tabs"
    >
        <button
            v-for="tab in tabs"
            :key="tab.key"
            role="tab"
            :aria-selected="activeTab === tab.key"
            :class="[
                'relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
                activeTab === tab.key
                    ? escDark
                        ? 'text-cyan-400 focus-visible:ring-cyan-500/40'
                        : 'text-blue-600 focus-visible:ring-blue-500/40'
                    : escDark
                      ? 'text-neutral-500 hover:text-neutral-300 focus-visible:ring-cyan-500/40'
                      : 'text-gray-500 hover:text-gray-700 focus-visible:ring-blue-500/40',
            ]"
            @click="selectTab(tab)"
        >
            {{ tab.label }}
            <span
                v-if="activeTab === tab.key"
                :class="['absolute bottom-0 left-0 right-0 h-0.5 rounded-t', escDark ? 'bg-cyan-400' : 'bg-blue-600']"
            ></span>
        </button>
    </div>
</template>
