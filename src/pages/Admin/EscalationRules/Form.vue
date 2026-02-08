<script setup>
import EscalatedLayout from '../../../../Components/Escalated/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({ rule: { type: Object, default: null } });

const form = useForm({
    name: props.rule?.name || '',
    description: props.rule?.description || '',
    trigger_type: props.rule?.trigger_type || 'time_based',
    conditions: props.rule?.conditions || [{ field: '', value: '' }],
    actions: props.rule?.actions || [{ type: '', value: '' }],
    order: props.rule?.order ?? 0,
    is_active: props.rule?.is_active ?? true,
});

function addCondition() { form.conditions.push({ field: '', value: '' }); }
function removeCondition(idx) { form.conditions.splice(idx, 1); }
function addAction() { form.actions.push({ type: '', value: '' }); }
function removeAction(idx) { form.actions.splice(idx, 1); }

function submit() {
    if (props.rule) {
        form.put(route('escalated.admin.escalation-rules.update', props.rule.id));
    } else {
        form.post(route('escalated.admin.escalation-rules.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="rule ? 'Edit Escalation Rule' : 'New Escalation Rule'">
        <form @submit.prevent="submit" class="mx-auto max-w-lg space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input v-model="form.name" type="text" required class="mt-1 w-full rounded-lg border-gray-300 shadow-sm" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Trigger Type</label>
                <select v-model="form.trigger_type" class="mt-1 w-full rounded-lg border-gray-300 shadow-sm">
                    <option value="time_based">Time Based</option>
                    <option value="sla_breach">SLA Breach</option>
                    <option value="priority_based">Priority Based</option>
                </select>
            </div>
            <div>
                <div class="mb-2 flex items-center justify-between">
                    <label class="text-sm font-medium text-gray-700">Conditions</label>
                    <button type="button" @click="addCondition" class="text-sm text-indigo-600">+ Add</button>
                </div>
                <div v-for="(cond, idx) in form.conditions" :key="idx" class="mb-2 flex gap-2">
                    <select v-model="cond.field" class="w-1/2 rounded border-gray-300 text-sm">
                        <option value="status">Status</option>
                        <option value="priority">Priority</option>
                        <option value="assigned">Assignment</option>
                        <option value="age_hours">Age (hours)</option>
                        <option value="no_response_hours">No Response (hours)</option>
                        <option value="sla_breached">SLA Breached</option>
                    </select>
                    <input v-model="cond.value" class="w-1/2 rounded border-gray-300 text-sm" placeholder="Value" />
                    <button type="button" @click="removeCondition(idx)" class="text-red-500">&times;</button>
                </div>
            </div>
            <div>
                <div class="mb-2 flex items-center justify-between">
                    <label class="text-sm font-medium text-gray-700">Actions</label>
                    <button type="button" @click="addAction" class="text-sm text-indigo-600">+ Add</button>
                </div>
                <div v-for="(action, idx) in form.actions" :key="idx" class="mb-2 flex gap-2">
                    <select v-model="action.type" class="w-1/2 rounded border-gray-300 text-sm">
                        <option value="escalate">Escalate</option>
                        <option value="change_priority">Change Priority</option>
                        <option value="assign_to">Assign To</option>
                        <option value="change_department">Change Department</option>
                    </select>
                    <input v-model="action.value" class="w-1/2 rounded border-gray-300 text-sm" placeholder="Value" />
                    <button type="button" @click="removeAction(idx)" class="text-red-500">&times;</button>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Order</label>
                <input v-model.number="form.order" type="number" min="0" class="mt-1 w-24 rounded-lg border-gray-300 shadow-sm" />
            </div>
            <label class="flex items-center gap-2">
                <input v-model="form.is_active" type="checkbox" class="rounded border-gray-300" />
                <span class="text-sm text-gray-700">Active</span>
            </label>
            <div class="flex justify-end">
                <button type="submit" :disabled="form.processing" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                    {{ rule ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
