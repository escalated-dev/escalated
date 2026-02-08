<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({ policy: { type: Object, default: null }, priorities: Array });

const form = useForm({
    name: props.policy?.name || '',
    description: props.policy?.description || '',
    is_default: props.policy?.is_default ?? false,
    first_response_hours: props.policy?.first_response_hours || {},
    resolution_hours: props.policy?.resolution_hours || {},
    business_hours_only: props.policy?.business_hours_only ?? false,
    is_active: props.policy?.is_active ?? true,
});

function submit() {
    if (props.policy) {
        form.put(route('escalated.admin.sla-policies.update', props.policy.id));
    } else {
        form.post(route('escalated.admin.sla-policies.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="policy ? 'Edit SLA Policy' : 'New SLA Policy'">
        <form @submit.prevent="submit" class="mx-auto max-w-lg space-y-5 rounded-xl border border-white/[0.06] bg-gray-900/60 p-6">
            <div>
                <label class="block text-sm font-medium text-gray-300">Name</label>
                <input v-model="form.name" type="text" required class="mt-1 w-full rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-300">Description</label>
                <textarea v-model="form.description" rows="2" class="mt-1 w-full rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"></textarea>
            </div>
            <div>
                <h3 class="mb-2 text-sm font-medium text-gray-300">First Response Hours (by priority)</h3>
                <div class="grid grid-cols-2 gap-3">
                    <div v-for="p in priorities" :key="p">
                        <label class="text-xs capitalize text-gray-400">{{ p }}</label>
                        <input v-model.number="form.first_response_hours[p]" type="number" step="0.5" min="0" class="w-full rounded-lg border border-white/10 bg-gray-950 px-2 py-1.5 text-sm text-gray-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
                    </div>
                </div>
            </div>
            <div>
                <h3 class="mb-2 text-sm font-medium text-gray-300">Resolution Hours (by priority)</h3>
                <div class="grid grid-cols-2 gap-3">
                    <div v-for="p in priorities" :key="p">
                        <label class="text-xs capitalize text-gray-400">{{ p }}</label>
                        <input v-model.number="form.resolution_hours[p]" type="number" step="0.5" min="0" class="w-full rounded-lg border border-white/10 bg-gray-950 px-2 py-1.5 text-sm text-gray-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
                    </div>
                </div>
            </div>
            <label class="flex items-center gap-2">
                <input v-model="form.business_hours_only" type="checkbox" class="rounded border-white/20 bg-gray-900 text-cyan-500 focus:ring-cyan-500/30" />
                <span class="text-sm text-gray-300">Business hours only</span>
            </label>
            <label class="flex items-center gap-2">
                <input v-model="form.is_default" type="checkbox" class="rounded border-white/20 bg-gray-900 text-cyan-500 focus:ring-cyan-500/30" />
                <span class="text-sm text-gray-300">Default policy</span>
            </label>
            <label class="flex items-center gap-2">
                <input v-model="form.is_active" type="checkbox" class="rounded border-white/20 bg-gray-900 text-cyan-500 focus:ring-cyan-500/30" />
                <span class="text-sm text-gray-300">Active</span>
            </label>
            <div class="flex justify-end">
                <button type="submit" :disabled="form.processing"
                        class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50">
                    {{ policy ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
