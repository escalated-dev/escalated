<script setup>
import { computed } from 'vue';
import VariableTokenInput from './VariableTokenInput.vue';

const props = defineProps({
    actionType: { type: String, required: true },
    modelValue: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);

const headersPlaceholder = '{"Authorization": "Bearer ..."}';
const config = computed(() => props.modelValue || {});

function update(key, value) {
    emit('update:modelValue', { ...config.value, [key]: value });
}

const statusOptions = [
    'open',
    'in_progress',
    'waiting_on_customer',
    'waiting_on_agent',
    'escalated',
    'resolved',
    'closed',
];
const priorityOptions = ['low', 'medium', 'high', 'urgent', 'critical'];
const assignModes = [
    { value: 'specific', label: 'Specific agent' },
    { value: 'least_busy', label: 'Least busy agent' },
    { value: 'round_robin', label: 'Round robin' },
];
const delayUnits = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
];
const webhookMethods = ['POST', 'PUT', 'PATCH'];

const inputClass =
    'w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]';
const selectClass =
    'rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none';
const labelClass = 'block text-xs font-medium text-[var(--esc-panel-text-muted)] mb-1';
</script>

<template>
    <div class="space-y-3 pt-2">
        <!-- Assign Agent -->
        <template v-if="actionType === 'assign_agent'">
            <div>
                <label :class="labelClass">Assignment mode</label>
                <select
                    :class="selectClass"
                    :value="config.mode || 'specific'"
                    @change="update('mode', $event.target.value)"
                >
                    <option v-for="m in assignModes" :key="m.value" :value="m.value">{{ m.label }}</option>
                </select>
            </div>
            <div v-if="(config.mode || 'specific') === 'specific'">
                <label :class="labelClass">Agent</label>
                <input
                    :class="inputClass"
                    :value="config.agent || ''"
                    placeholder="Agent ID or email"
                    @input="update('agent', $event.target.value)"
                />
            </div>
        </template>

        <!-- Change Status -->
        <template v-else-if="actionType === 'change_status'">
            <div>
                <label :class="labelClass">New status</label>
                <select
                    :class="selectClass"
                    :value="config.status || ''"
                    @change="update('status', $event.target.value)"
                >
                    <option value="">Select status...</option>
                    <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
                </select>
            </div>
        </template>

        <!-- Change Priority -->
        <template v-else-if="actionType === 'change_priority'">
            <div>
                <label :class="labelClass">New priority</label>
                <select
                    :class="selectClass"
                    :value="config.priority || ''"
                    @change="update('priority', $event.target.value)"
                >
                    <option value="">Select priority...</option>
                    <option v-for="p in priorityOptions" :key="p" :value="p">{{ p }}</option>
                </select>
            </div>
        </template>

        <!-- Add / Remove Tag -->
        <template v-else-if="actionType === 'add_tag' || actionType === 'remove_tag'">
            <div>
                <label :class="labelClass">Tag name</label>
                <input
                    :class="inputClass"
                    :value="config.tag || ''"
                    placeholder="Enter tag name"
                    @input="update('tag', $event.target.value)"
                />
            </div>
        </template>

        <!-- Move Department -->
        <template v-else-if="actionType === 'move_department'">
            <div>
                <label :class="labelClass">Department</label>
                <input
                    :class="inputClass"
                    :value="config.department || ''"
                    placeholder="Department name or ID"
                    @input="update('department', $event.target.value)"
                />
            </div>
        </template>

        <!-- Add Internal Note -->
        <template v-else-if="actionType === 'add_note'">
            <div>
                <label :class="labelClass">Note content</label>
                <VariableTokenInput
                    :model-value="config.body || ''"
                    :multiline="true"
                    placeholder="Write the note..."
                    @update:model-value="update('body', $event)"
                />
            </div>
        </template>

        <!-- Send Email -->
        <template v-else-if="actionType === 'send_email'">
            <div>
                <label :class="labelClass">To</label>
                <VariableTokenInput
                    :model-value="config.to || ''"
                    placeholder="Recipient email or variable"
                    @update:model-value="update('to', $event)"
                />
            </div>
            <div>
                <label :class="labelClass">Subject</label>
                <VariableTokenInput
                    :model-value="config.subject || ''"
                    placeholder="Email subject"
                    @update:model-value="update('subject', $event)"
                />
            </div>
            <div>
                <label :class="labelClass">Body</label>
                <VariableTokenInput
                    :model-value="config.body || ''"
                    :multiline="true"
                    placeholder="Email body..."
                    @update:model-value="update('body', $event)"
                />
            </div>
        </template>

        <!-- Send Webhook -->
        <template v-else-if="actionType === 'send_webhook'">
            <div>
                <label :class="labelClass">URL</label>
                <input
                    :class="inputClass"
                    :value="config.url || ''"
                    placeholder="https://..."
                    @input="update('url', $event.target.value)"
                />
            </div>
            <div>
                <label :class="labelClass">Method</label>
                <select
                    :class="selectClass"
                    :value="config.method || 'POST'"
                    @change="update('method', $event.target.value)"
                >
                    <option v-for="m in webhookMethods" :key="m" :value="m">{{ m }}</option>
                </select>
            </div>
            <div>
                <label :class="labelClass">Headers (JSON)</label>
                <input
                    :class="inputClass"
                    :value="config.headers || ''"
                    :placeholder="headersPlaceholder"
                    @input="update('headers', $event.target.value)"
                />
            </div>
            <div>
                <label :class="labelClass">Body template</label>
                <VariableTokenInput
                    :model-value="config.body || ''"
                    :multiline="true"
                    placeholder="JSON body with variables..."
                    @update:model-value="update('body', $event)"
                />
            </div>
        </template>

        <!-- Delay -->
        <template v-else-if="actionType === 'delay'">
            <div class="flex items-center gap-3">
                <div class="flex-1">
                    <label :class="labelClass">Duration</label>
                    <input
                        type="number"
                        min="1"
                        :class="inputClass"
                        :value="config.duration || 1"
                        @input="update('duration', parseInt($event.target.value) || 1)"
                    />
                </div>
                <div class="flex-1">
                    <label :class="labelClass">Unit</label>
                    <select
                        :class="selectClass + ' w-full'"
                        :value="config.unit || 'hours'"
                        @change="update('unit', $event.target.value)"
                    >
                        <option v-for="u in delayUnits" :key="u.value" :value="u.value">{{ u.label }}</option>
                    </select>
                </div>
            </div>
            <div class="rounded-lg bg-orange-500/10 px-3 py-2 text-xs text-orange-400">
                Wait {{ config.duration || 1 }} {{ config.unit || 'hours' }}, then continue...
            </div>
        </template>

        <!-- Apply Macro -->
        <template v-else-if="actionType === 'apply_macro'">
            <div>
                <label :class="labelClass">Macro</label>
                <input
                    :class="inputClass"
                    :value="config.macro || ''"
                    placeholder="Macro name or ID"
                    @input="update('macro', $event.target.value)"
                />
            </div>
        </template>

        <!-- Snooze -->
        <template v-else-if="actionType === 'snooze'">
            <div class="flex items-center gap-3">
                <div class="flex-1">
                    <label :class="labelClass">Duration</label>
                    <input
                        type="number"
                        min="1"
                        :class="inputClass"
                        :value="config.duration || 1"
                        @input="update('duration', parseInt($event.target.value) || 1)"
                    />
                </div>
                <div class="flex-1">
                    <label :class="labelClass">Unit</label>
                    <select
                        :class="selectClass + ' w-full'"
                        :value="config.unit || 'hours'"
                        @change="update('unit', $event.target.value)"
                    >
                        <option v-for="u in delayUnits" :key="u.value" :value="u.value">{{ u.label }}</option>
                    </select>
                </div>
            </div>
        </template>

        <!-- Close Ticket (no config needed) -->
        <template v-else-if="actionType === 'close_ticket'">
            <p class="text-xs text-[var(--esc-panel-text-muted)]">
                This action closes the ticket immediately. No configuration needed.
            </p>
        </template>
    </div>
</template>
