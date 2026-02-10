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

function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) => i < rating ? 'filled' : 'empty');
}
</script>

<template>
    <aside class="space-y-4">
        <div :class="cardClass">
            <h3 :class="['mb-3 text-sm font-semibold', escDark ? 'text-white' : 'text-gray-900']">Details</h3>
            <dl class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <dt :class="escDark ? 'text-neutral-500' : 'text-gray-500'">Status</dt>
                    <dd><StatusBadge :status="ticket.status" /></dd>
                </div>
                <div class="flex justify-between">
                    <dt :class="escDark ? 'text-neutral-500' : 'text-gray-500'">Priority</dt>
                    <dd><PriorityBadge :priority="ticket.priority" /></dd>
                </div>
                <div class="flex justify-between">
                    <dt :class="escDark ? 'text-neutral-500' : 'text-gray-500'">Reference</dt>
                    <dd :class="['font-mono text-xs', escDark ? 'text-white' : '']">{{ ticket.reference }}</dd>
                </div>
                <div v-if="ticket.department" class="flex justify-between">
                    <dt :class="escDark ? 'text-neutral-500' : 'text-gray-500'">Department</dt>
                    <dd :class="escDark ? 'text-neutral-300' : ''">{{ ticket.department.name }}</dd>
                </div>
                <div class="flex justify-between">
                    <dt :class="escDark ? 'text-neutral-500' : 'text-gray-500'">Created</dt>
                    <dd :class="escDark ? 'text-neutral-300' : ''">{{ new Date(ticket.created_at).toLocaleDateString() }}</dd>
                </div>
            </dl>
        </div>

        <!-- Satisfaction Rating (read-only) -->
        <div v-if="ticket.satisfaction_rating" :class="cardClass">
            <h3 :class="['mb-3 text-sm font-semibold', escDark ? 'text-white' : 'text-gray-900']">Customer Satisfaction</h3>
            <div class="flex items-center gap-1">
                <svg v-for="(star, i) in renderStars(ticket.satisfaction_rating.rating)" :key="i"
                     class="h-5 w-5" :class="star === 'filled' ? 'text-amber-400' : (escDark ? 'text-neutral-700' : 'text-gray-300')"
                     fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span :class="['ml-2 text-sm font-medium', escDark ? 'text-neutral-300' : 'text-gray-700']">
                    {{ ticket.satisfaction_rating.rating }}/5
                </span>
            </div>
            <p v-if="ticket.satisfaction_rating.comment" :class="['mt-2 text-xs italic', escDark ? 'text-neutral-500' : 'text-gray-500']">
                "{{ ticket.satisfaction_rating.comment }}"
            </p>
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
            <h3 :class="['mb-3 text-sm font-semibold', escDark ? 'text-white' : 'text-gray-900']">Activity</h3>
            <ActivityTimeline :activities="activities" />
        </div>
    </aside>
</template>
