<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, router } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({ responses: Array });

const showForm = ref(false);
const form = useForm({ title: '', body: '', category: '', is_shared: true });

function create() {
    form.post(route('escalated.admin.canned-responses.store'), {
        onSuccess: () => { form.reset(); showForm.value = false; },
    });
}

function destroy(id) {
    if (confirm('Delete this canned response?')) {
        router.delete(route('escalated.admin.canned-responses.destroy', id));
    }
}
</script>

<template>
    <EscalatedLayout title="Canned Responses">
        <div class="mb-4 flex justify-end">
            <button @click="showForm = !showForm" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                {{ showForm ? 'Cancel' : 'Add Response' }}
            </button>
        </div>
        <form v-if="showForm" @submit.prevent="create" class="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            <input v-model="form.title" type="text" placeholder="Title" required class="w-full rounded-lg border-gray-300 shadow-sm" />
            <textarea v-model="form.body" rows="4" placeholder="Response body..." required class="w-full rounded-lg border-gray-300 shadow-sm"></textarea>
            <div class="flex gap-3">
                <input v-model="form.category" type="text" placeholder="Category (optional)" class="rounded-lg border-gray-300 shadow-sm" />
                <label class="flex items-center gap-2">
                    <input v-model="form.is_shared" type="checkbox" class="rounded border-gray-300" />
                    <span class="text-sm text-gray-700">Shared</span>
                </label>
                <button type="submit" :disabled="form.processing" class="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Create</button>
            </div>
        </form>
        <div class="space-y-3">
            <div v-for="resp in responses" :key="resp.id" class="rounded-lg border border-gray-200 bg-white p-4">
                <div class="mb-2 flex items-center justify-between">
                    <div>
                        <span class="font-medium text-gray-900">{{ resp.title }}</span>
                        <span v-if="resp.category" class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{{ resp.category }}</span>
                    </div>
                    <div>
                        <button @click="destroy(resp.id)" class="text-sm text-red-600 hover:text-red-900">Delete</button>
                    </div>
                </div>
                <p class="text-sm text-gray-600">{{ resp.body }}</p>
            </div>
        </div>
    </EscalatedLayout>
</template>
