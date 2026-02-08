<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
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
        <form @submit.prevent="submit" class="mx-auto max-w-lg space-y-5 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
            <div>
                <label class="block text-sm font-medium text-neutral-300">Name</label>
                <input v-model="form.name" type="text" required class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" />
            </div>
            <div>
                <label class="block text-sm font-medium text-neutral-300">Trigger Type</label>
                <select v-model="form.trigger_type" class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10">
                    <option value="time_based">Time Based</option>
                    <option value="sla_breach">SLA Breach</option>
                    <option value="priority_based">Priority Based</option>
                </select>
            </div>
            <div>
                <div class="mb-2 flex items-center justify-between">
                    <label class="text-sm font-medium text-neutral-300">Conditions</label>
                    <button type="button" @click="addCondition" class="text-sm text-neutral-300 hover:text-white">+ Add</button>
                </div>
                <div v-for="(cond, idx) in form.conditions" :key="idx" class="mb-2 flex gap-2">
                    <select v-model="cond.field" class="w-1/2 rounded-lg border border-white/10 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10">
                        <option value="status">Status</option>
                        <option value="priority">Priority</option>
                        <option value="assigned">Assignment</option>
                        <option value="age_hours">Age (hours)</option>
                        <option value="no_response_hours">No Response (hours)</option>
                        <option value="sla_breached">SLA Breached</option>
                    </select>
                    <input v-model="cond.value" class="w-1/2 rounded-lg border border-white/10 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-200 placeholder-gray-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" placeholder="Value" />
                    <button type="button" @click="removeCondition(idx)" class="text-rose-400 hover:text-rose-300">&times;</button>
                </div>
            </div>
            <div>
                <div class="mb-2 flex items-center justify-between">
                    <label class="text-sm font-medium text-neutral-300">Actions</label>
                    <button type="button" @click="addAction" class="text-sm text-neutral-300 hover:text-white">+ Add</button>
                </div>
                <div v-for="(action, idx) in form.actions" :key="idx" class="mb-2 flex gap-2">
                    <select v-model="action.type" class="w-1/2 rounded-lg border border-white/10 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10">
                        <option value="escalate">Escalate</option>
                        <option value="change_priority">Change Priority</option>
                        <option value="assign_to">Assign To</option>
                        <option value="change_department">Change Department</option>
                    </select>
                    <input v-model="action.value" class="w-1/2 rounded-lg border border-white/10 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-200 placeholder-gray-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" placeholder="Value" />
                    <button type="button" @click="removeAction(idx)" class="text-rose-400 hover:text-rose-300">&times;</button>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-neutral-300">Order</label>
                <input v-model.number="form.order" type="number" min="0" class="mt-1 w-24 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" />
            </div>
            <label class="flex items-center gap-2">
                <input v-model="form.is_active" type="checkbox" class="rounded border-white/20 bg-neutral-900 text-white focus:ring-white/10" />
                <span class="text-sm text-neutral-300">Active</span>
            </label>
            <div class="flex justify-end">
                <button type="submit" :disabled="form.processing"
                        class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50">
                    {{ rule ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
