<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({ department: { type: Object, default: null } });

const form = useForm({
    name: props.department?.name || '',
    slug: props.department?.slug || '',
    description: props.department?.description || '',
    is_active: props.department?.is_active ?? true,
});

function submit() {
    if (props.department) {
        form.put(route('escalated.admin.departments.update', props.department.id));
    } else {
        form.post(route('escalated.admin.departments.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="department ? 'Edit Department' : 'New Department'">
        <form @submit.prevent="submit" class="mx-auto max-w-lg space-y-5 rounded-xl border border-white/[0.06] bg-gray-900/60 p-6">
            <div>
                <label class="block text-sm font-medium text-gray-300">Name</label>
                <input v-model="form.name" type="text" required class="mt-1 w-full rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
                <div v-if="form.errors.name" class="mt-1 text-sm text-rose-400">{{ form.errors.name }}</div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-300">Slug</label>
                <input v-model="form.slug" type="text" placeholder="Auto-generated if empty" class="mt-1 w-full rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-300">Description</label>
                <textarea v-model="form.description" rows="3" class="mt-1 w-full rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"></textarea>
            </div>
            <label class="flex items-center gap-2">
                <input v-model="form.is_active" type="checkbox" class="rounded border-white/20 bg-gray-900 text-cyan-500 focus:ring-cyan-500/30" />
                <span class="text-sm text-gray-300">Active</span>
            </label>
            <div class="flex justify-end">
                <button type="submit" :disabled="form.processing"
                        class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50">
                    {{ department ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
