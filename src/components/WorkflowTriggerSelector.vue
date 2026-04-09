<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const triggers = [
    {
        value: 'ticket_created',
        label: 'Ticket Created',
        description: 'When a new ticket is submitted',
        icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
        value: 'ticket_updated',
        label: 'Ticket Updated',
        description: 'When any ticket field is modified',
        icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182',
    },
    {
        value: 'reply_added',
        label: 'Reply Added',
        description: 'When a reply is posted on a ticket',
        icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
    },
    {
        value: 'status_changed',
        label: 'Status Changed',
        description: 'When the ticket status is updated',
        icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
        value: 'ticket_assigned',
        label: 'Ticket Assigned',
        description: 'When a ticket is assigned to an agent',
        icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    },
    {
        value: 'ticket_escalated',
        label: 'Ticket Escalated',
        description: 'When a ticket is escalated',
        icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12',
    },
    {
        value: 'sla_breached',
        label: 'SLA Breached',
        description: 'When an SLA target is breached',
        icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    },
    {
        value: 'sla_warning',
        label: 'SLA Warning',
        description: 'When an SLA target is approaching',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
        value: 'chat_started',
        label: 'Chat Started',
        description: 'When a live chat session begins',
        icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155',
    },
    {
        value: 'chat_ended',
        label: 'Chat Ended',
        description: 'When a live chat session ends',
        icon: 'M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
];

const selected = computed(() => props.modelValue);

function select(value) {
    emit('update:modelValue', value);
}
</script>

<template>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <button
            v-for="trigger in triggers"
            :key="trigger.value"
            type="button"
            class="group relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all"
            :class="
                selected === trigger.value
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                    : 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] hover:border-[var(--esc-panel-text-muted)] hover:bg-[var(--esc-panel-hover)]'
            "
            @click="select(trigger.value)"
        >
            <div
                class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg"
                :class="
                    selected === trigger.value
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-muted)] group-hover:text-[var(--esc-panel-text-secondary)]'
                "
            >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="trigger.icon" />
                </svg>
            </div>
            <span
                class="text-xs font-semibold"
                :class="selected === trigger.value ? 'text-blue-400' : 'text-[var(--esc-panel-text-secondary)]'"
            >
                {{ trigger.label }}
            </span>
            <span class="mt-1 text-[10px] leading-tight text-[var(--esc-panel-text-muted)]">
                {{ trigger.description }}
            </span>
            <div
                v-if="selected === trigger.value"
                class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white"
            >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
        </button>
    </div>
</template>
