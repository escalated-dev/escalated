<script setup>
defineProps({
    activities: { type: Array, required: true },
});

const typeLabels = {
    status_changed: 'changed status',
    assigned: 'assigned ticket',
    unassigned: 'unassigned ticket',
    priority_changed: 'changed priority',
    tag_added: 'added tag',
    tag_removed: 'removed tag',
    escalated: 'escalated ticket',
    sla_breached: 'SLA breached',
    replied: 'replied',
    note_added: 'added note',
    department_changed: 'changed department',
    reopened: 'reopened ticket',
    resolved: 'resolved ticket',
    closed: 'closed ticket',
};

function formatDate(date) {
    return new Date(date).toLocaleString();
}

function describeActivity(activity) {
    const label = typeLabels[activity.type] || activity.type;
    const who = activity.causer?.name || 'System';
    const props = activity.properties || {};

    if (activity.type === 'status_changed' && props.to) {
        return `${who} ${label} to ${props.to}`;
    }
    if (activity.type === 'assigned' && props.agent_name) {
        return `${who} assigned to ${props.agent_name}`;
    }
    if (activity.type === 'priority_changed' && props.to) {
        return `${who} ${label} to ${props.to}`;
    }
    if ((activity.type === 'tag_added' || activity.type === 'tag_removed') && props.tag) {
        return `${who} ${label} "${props.tag}"`;
    }
    if (activity.type === 'department_changed' && props.department) {
        return `${who} ${label} to ${props.department}`;
    }
    return `${who} ${label}`;
}
</script>

<template>
    <div class="space-y-3">
        <div v-for="activity in activities" :key="activity.id" class="flex gap-3 text-sm">
            <div class="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-gray-400"></div>
            <div class="flex-1">
                <p class="text-gray-700">{{ describeActivity(activity) }}</p>
                <p class="text-xs text-gray-400">{{ formatDate(activity.created_at) }}</p>
            </div>
        </div>
        <div v-if="!activities?.length" class="py-4 text-center text-sm text-gray-500">No activity yet.</div>
    </div>
</template>
