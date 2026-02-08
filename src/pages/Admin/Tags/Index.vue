<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, router } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({ tags: Array });

const showForm = ref(false);
const editingTag = ref(null);

const form = useForm({ name: '', color: '#6B7280' });

function createTag() {
    form.post(route('escalated.admin.tags.store'), {
        onSuccess: () => { form.reset(); showForm.value = false; },
    });
}

function startEdit(tag) {
    editingTag.value = tag.id;
    form.name = tag.name;
    form.color = tag.color;
}

function updateTag(id) {
    form.put(route('escalated.admin.tags.update', id), {
        onSuccess: () => { editingTag.value = null; form.reset(); },
    });
}

function destroy(id) {
    if (confirm('Delete this tag?')) {
        router.delete(route('escalated.admin.tags.destroy', id));
    }
}
</script>

<template>
    <EscalatedLayout title="Tags">
        <div class="mb-4 flex justify-end">
            <button @click="showForm = !showForm" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                {{ showForm ? 'Cancel' : 'Add Tag' }}
            </button>
        </div>
        <form v-if="showForm" @submit.prevent="createTag" class="mb-6 flex items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Name</label>
                <input v-model="form.name" type="text" required class="mt-1 rounded-lg border-gray-300 shadow-sm" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Color</label>
                <input v-model="form.color" type="color" class="mt-1 h-10 w-16 rounded border-gray-300" />
            </div>
            <button type="submit" :disabled="form.processing" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Create</button>
        </form>
        <div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Color</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tickets</th>
                        <th class="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-for="tag in tags" :key="tag.id">
                        <td class="px-4 py-3"><span class="inline-block h-4 w-4 rounded-full" :style="{ backgroundColor: tag.color }"></span></td>
                        <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ tag.name }}</td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ tag.tickets_count }}</td>
                        <td class="px-4 py-3 text-right text-sm">
                            <button @click="startEdit(tag)" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                            <button @click="destroy(tag.id)" class="ml-3 text-red-600 hover:text-red-900">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
