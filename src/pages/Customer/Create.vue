<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import FileDropzone from '../../components/FileDropzone.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    departments: Array,
    priorities: Array,
});

const form = useForm({
    subject: '',
    description: '',
    priority: 'medium',
    department_id: '',
    attachments: [],
});

function submit() {
    form.post(route('escalated.customer.tickets.store'));
}
</script>

<template>
    <EscalatedLayout title="Create Ticket">
        <form @submit.prevent="submit" class="mx-auto max-w-2xl space-y-6 rounded-lg border border-gray-200 bg-white p-6">
            <div>
                <label class="block text-sm font-medium text-gray-700">Subject</label>
                <input v-model="form.subject" type="text" required
                       class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <div v-if="form.errors.subject" class="mt-1 text-sm text-red-600">{{ form.errors.subject }}</div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea v-model="form.description" rows="6" required
                          class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
                <div v-if="form.errors.description" class="mt-1 text-sm text-red-600">{{ form.errors.description }}</div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Priority</label>
                    <select v-model="form.priority" class="mt-1 w-full rounded-lg border-gray-300 shadow-sm">
                        <option v-for="p in priorities" :key="p" :value="p" class="capitalize">{{ p }}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Department</label>
                    <select v-model="form.department_id" class="mt-1 w-full rounded-lg border-gray-300 shadow-sm">
                        <option value="">None</option>
                        <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                <FileDropzone v-model="form.attachments" />
            </div>
            <div class="flex justify-end">
                <button type="submit" :disabled="form.processing"
                        class="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                    {{ form.processing ? 'Creating...' : 'Create Ticket' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
