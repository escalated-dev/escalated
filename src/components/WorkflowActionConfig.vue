<script setup>
import { computed } from 'vue';
import VariableTokenInput from './VariableTokenInput.vue';

const props = defineProps({
    actionType: { type: String, required: true },
    // The action's `value`, which the contract keeps scalar. A structured value
    // a backend stored itself (Laravel's `{agent_id, strategy}`, say) is left
    // untouched until someone edits the field.
    modelValue: { type: [String, Number, Object, Array], default: '' },
});

const emit = defineEmits(['update:modelValue']);

const isStructured = computed(() => props.modelValue !== null && typeof props.modelValue === 'object');
const value = computed(() => (isStructured.value ? '' : (props.modelValue ?? '')));

function update(next) {
    emit('update:modelValue', next);
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

const inputClass =
    'w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]';
const selectClass =
    'rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none';
const labelClass = 'block text-xs font-medium text-[var(--esc-panel-text-muted)] mb-1';
</script>

<template>
    <div class="space-y-3 pt-2">
        <p v-if="isStructured" class="text-xs text-[var(--esc-panel-text-muted)]">
            This action was configured outside the builder. Editing it here replaces that configuration.
        </p>

        <!-- Change Status -->
        <template v-if="actionType === 'change_status'">
            <div>
                <label :class="labelClass">New status</label>
                <select :class="selectClass" :value="value" @change="update($event.target.value)">
                    <option value="">Select status...</option>
                    <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
                </select>
            </div>
        </template>

        <!-- Change Priority -->
        <template v-else-if="actionType === 'change_priority'">
            <div>
                <label :class="labelClass">New priority</label>
                <select :class="selectClass" :value="value" @change="update($event.target.value)">
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
                    :value="value"
                    placeholder="Enter tag name"
                    @input="update($event.target.value)"
                />
            </div>
        </template>

        <!-- Set Department -->
        <template v-else-if="actionType === 'set_department' || actionType === 'move_department'">
            <div>
                <label :class="labelClass">Department ID</label>
                <input
                    :class="inputClass"
                    :value="value"
                    placeholder="Department ID"
                    @input="update($event.target.value)"
                />
            </div>
        </template>

        <!-- Assign Agent -->
        <template v-else-if="actionType === 'assign_agent'">
            <div>
                <label :class="labelClass">Agent</label>
                <input
                    :class="inputClass"
                    :value="value"
                    placeholder="Agent user ID"
                    @input="update($event.target.value)"
                />
            </div>
        </template>

        <!-- Add Internal Note -->
        <template v-else-if="actionType === 'add_note' || actionType === 'add_internal_note'">
            <div>
                <label :class="labelClass">Note content</label>
                <VariableTokenInput
                    :model-value="value"
                    :multiline="true"
                    placeholder="Write the note..."
                    @update:model-value="update($event)"
                />
            </div>
        </template>

        <!-- Insert Canned Reply -->
        <template v-else-if="actionType === 'insert_canned_reply'">
            <div>
                <label :class="labelClass">Reply</label>
                <VariableTokenInput
                    :model-value="value"
                    :multiline="true"
                    placeholder="The reply to post on the ticket..."
                    @update:model-value="update($event)"
                />
            </div>
        </template>

        <!-- Add Follower -->
        <template v-else-if="actionType === 'add_follower'">
            <div>
                <label :class="labelClass">Follower</label>
                <input :class="inputClass" :value="value" placeholder="User ID" @input="update($event.target.value)" />
            </div>
        </template>

        <!-- Delay -->
        <template v-else-if="actionType === 'delay'">
            <div>
                <label :class="labelClass">Wait (minutes)</label>
                <input
                    type="number"
                    min="1"
                    :class="inputClass"
                    :value="value || 1"
                    @input="update(parseInt($event.target.value) || 1)"
                />
            </div>
            <div class="rounded-lg bg-orange-500/10 px-3 py-2 text-xs text-orange-400">
                Wait {{ value || 1 }} minutes, then continue...
            </div>
        </template>

        <!-- Send Webhook -->
        <template v-else-if="actionType === 'send_webhook'">
            <div>
                <label :class="labelClass">URL</label>
                <input
                    :class="inputClass"
                    :value="value"
                    placeholder="https://..."
                    @input="update($event.target.value)"
                />
            </div>
        </template>

        <!-- Close Ticket (no value needed) -->
        <template v-else-if="actionType === 'close_ticket'">
            <p class="text-xs text-[var(--esc-panel-text-muted)]">
                This action closes the ticket immediately. No configuration needed.
            </p>
        </template>

        <!-- Anything else the backend lists -->
        <template v-else>
            <div>
                <label :class="labelClass">Value</label>
                <input :class="inputClass" :value="value" @input="update($event.target.value)" />
            </div>
        </template>
    </div>
</template>
