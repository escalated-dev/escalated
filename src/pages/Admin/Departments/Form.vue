<script setup>
import EscalatedLayout from '../../../../Components/Escalated/EscalatedLayout.vue';
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
        <form @submit.prevent="submit" class="mx-auto max-w-lg space-y-4 rounded-lg border border-gray-200 bg-white p-6">
            <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input v-model="form.name" type="text" required class="mt-1 w-full rounded-lg border-gray-300 shadow-sm" />
                <div v-if="form.errors.name" class="mt-1 text-sm text-red-600">{{ form.errors.name }}</div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Slug</label>
                <input v-model="form.slug" type="text" class="mt-1 w-full rounded-lg border-gray-300 shadow-sm" placeholder="Auto-generated if empty" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea v-model="form.description" rows="3" class="mt-1 w-full rounded-lg border-gray-300 shadow-sm"></textarea>
            </div>
            <label class="flex items-center gap-2">
                <input v-model="form.is_active" type="checkbox" class="rounded border-gray-300" />
                <span class="text-sm text-gray-700">Active</span>
            </label>
            <div class="flex justify-end">
                <button type="submit" :disabled="form.processing" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                    {{ department ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
