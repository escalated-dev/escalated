<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import FileDropzone from '../../components/FileDropzone.vue';
import { useForm, Link } from '@inertiajs/vue3';

const props = defineProps({
    departments: Array,
    priorities: Array,
});

const form = useForm({
    guest_name: '',
    guest_email: '',
    subject: '',
    description: '',
    priority: 'medium',
    department_id: '',
    attachments: [],
});

function submit() {
    form.post(route('escalated.guest.tickets.store'));
}
</script>

<template>
    <EscalatedLayout title="Submit a Ticket">
        <div class="mx-auto max-w-2xl">
            <div class="mb-6 text-center">
                <h1 class="text-xl font-semibold text-gray-900">Submit a Support Ticket</h1>
                <p class="mt-1 text-sm text-gray-500">No account needed. We'll give you a link to track your ticket.</p>
                <Link :href="route('login')" class="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-700">
                    Already have an account? Sign in
                </Link>
            </div>

            <form @submit.prevent="submit" class="space-y-5 rounded-lg border border-gray-200 bg-white p-6">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Your Name</label>
                        <input v-model="form.guest_name" type="text" required
                               class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        <div v-if="form.errors.guest_name" class="mt-1 text-sm text-red-600">{{ form.errors.guest_name }}</div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email Address</label>
                        <input v-model="form.guest_email" type="email" required
                               class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        <div v-if="form.errors.guest_email" class="mt-1 text-sm text-red-600">{{ form.errors.guest_email }}</div>
                    </div>
                </div>

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
                            <option value="">General</option>
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
                        {{ form.processing ? 'Submitting...' : 'Submit Ticket' }}
                    </button>
                </div>
            </form>
        </div>
    </EscalatedLayout>
</template>
