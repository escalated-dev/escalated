<script setup>
import { inject, computed } from 'vue';
import StatusBadge from './StatusBadge.vue';
import PriorityBadge from './PriorityBadge.vue';
import SlaTimer from './SlaTimer.vue';
import AssigneeSelect from './AssigneeSelect.vue';
import TagSelect from './TagSelect.vue';
import ActivityTimeline from './ActivityTimeline.vue';

defineProps({
    ticket: { type: Object, required: true },
    agents: { type: Array, default: () => [] },
    tags: { type: Array, default: () => [] },
    activities: { type: Array, default: () => [] },
    editable: { type: Boolean, default: false },
});

const emit = defineEmits(['assign', 'tags', 'priority', 'department', 'status']);
const escDark = inject('esc-dark', computed(() => false));

const cardClass = computed(() => escDark.value
    ? 'rounded-xl border border-white/[0.06] bg-neutral-900/60 p-4'
    : 'rounded-lg border border-gray-200 bg-white p-4'
);
</script>

<template>
    <aside class="space-y-4">
        <div :class="cardClass">
            <h3 :class="['mb-3 text-sm font-semibold', escDark.value ? 'text-white' : 'text-gray-900']">Details</h3>
            <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt :class="escDark.value ? 'text-neutral-500' : 'text-gray-500'">Status</dt>
                    <dd><StatusBadge :status="ticket.status" /></dd>
                </div>
                <div class="flex justify-between">
                    <dt :class="escDark.value ? 'text-neutral-500' : 'text-gray-500'">Priority</dt>
                    <dd><PriorityBadge :priority="ticket.priority" /></dd>
                </div>
                <div class="flex justify-between">
                    <dt :class="escDark.value ? 'text-neutral-500' : 'text-gray-500'">Reference</dt>
                    <dd :class="['font-mono text-xs', escDark.value ? 'text-white' : '']">{{ ticket.reference }}</dd>
                </div>
                <div v-if="ticket.department" class="flex justify-between">
                    <dt :class="escDark.value ? 'text-neutral-500' : 'text-gray-500'">Department</dt>
                    <dd :class="escDark.value ? 'text-neutral-300' : ''">{{ ticket.department.name }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt :class="escDark.value ? 'text-neutral-500' : 'text-gray-500'">Created</dt>
                    <dd :class="escDark.value ? 'text-neutral-300' : ''">{{ new Date(ticket.created_at).toLocaleDateString() }}</dd>
                </div>
            </dl>
        </div>

        <div v-if="ticket.first_response_due_at || ticket.resolution_due_at" class="space-y-2">
            <SlaTimer v-if="ticket.first_response_due_at" :due-at="ticket.first_response_due_at"
                      :breached="ticket.sla_first_response_breached" label="First Response" />
            <SlaTimer v-if="ticket.resolution_due_at" :due-at="ticket.resolution_due_at"
                      :breached="ticket.sla_resolution_breached" label="Resolution" />
        </div>

        <div v-if="editable && agents.length" :class="cardClass">
            <AssigneeSelect :agents="agents" :model-value="ticket.assigned_to"
                            @update:model-value="emit('assign', $event)" />
        </div>

        <div v-if="editable && tags.length" :class="cardClass">
            <TagSelect :tags="tags" :model-value="(ticket.tags || []).map(t => t.id)"
                       @update:model-value="emit('tags', $event)" />
        </div>

        <div v-if="activities.length" :class="cardClass">
            <h3 :class="['mb-3 text-sm font-semibold', escDark.value ? 'text-white' : 'text-gray-900']">Activity</h3>
            <ActivityTimeline :activities="activities" />
        </div>
    </aside>
</template>
