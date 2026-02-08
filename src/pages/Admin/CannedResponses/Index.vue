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
            <button @click="showForm = !showForm"
                    :class="showForm
                        ? 'rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06]'
                        : 'rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-violet-400'">
                {{ showForm ? 'Cancel' : 'Add Response' }}
            </button>
        </div>
        <form v-if="showForm" @submit.prevent="create" class="mb-6 space-y-3 rounded-xl border border-white/[0.06] bg-gray-900/60 p-5">
            <input v-model="form.title" type="text" placeholder="Title" required
                   class="w-full rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
            <textarea v-model="form.body" rows="4" placeholder="Response body..." required
                      class="w-full rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"></textarea>
            <div class="flex items-center gap-3">
                <input v-model="form.category" type="text" placeholder="Category (optional)"
                       class="rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" />
                <label class="flex items-center gap-2">
                    <input v-model="form.is_shared" type="checkbox" class="rounded border-white/20 bg-gray-900 text-cyan-500 focus:ring-cyan-500/30" />
                    <span class="text-sm text-gray-300">Shared</span>
                </label>
                <button type="submit" :disabled="form.processing"
                        class="ml-auto rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50">
                    Create
                </button>
            </div>
        </form>
        <div class="space-y-3">
            <div v-for="resp in responses" :key="resp.id" class="rounded-xl border border-white/[0.06] bg-gray-900/60 p-4 transition-colors hover:bg-gray-900/80">
                <div class="mb-2 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="font-medium text-gray-200">{{ resp.title }}</span>
                        <span v-if="resp.category" class="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-gray-400 ring-1 ring-white/[0.06]">{{ resp.category }}</span>
                    </div>
                    <button @click="destroy(resp.id)" class="text-sm text-rose-400 hover:text-rose-300">Delete</button>
                </div>
                <p class="text-sm text-gray-400">{{ resp.body }}</p>
            </div>
        </div>
    </EscalatedLayout>
</template>
