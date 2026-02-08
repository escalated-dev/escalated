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
                        ? 'rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.06]'
                        : 'rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400'">
                {{ showForm ? 'Cancel' : 'Add Response' }}
            </button>
        </div>
        <form v-if="showForm" @submit.prevent="create" class="mb-6 space-y-3 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
            <input v-model="form.title" type="text" placeholder="Title" required
                   class="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-gray-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" />
            <textarea v-model="form.body" rows="4" placeholder="Response body..." required
                      class="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-gray-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"></textarea>
            <div class="flex items-center gap-3">
                <input v-model="form.category" type="text" placeholder="Category (optional)"
                       class="rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-gray-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" />
                <label class="flex items-center gap-2">
                    <input v-model="form.is_shared" type="checkbox" class="rounded border-white/20 bg-neutral-900 text-white focus:ring-white/10" />
                    <span class="text-sm text-neutral-300">Shared</span>
                </label>
                <button type="submit" :disabled="form.processing"
                        class="ml-auto rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50">
                    Create
                </button>
            </div>
        </form>
        <div class="space-y-3">
            <div v-if="!responses?.length" class="rounded-xl border border-white/[0.06] bg-neutral-900/60 px-4 py-12 text-center">
                <svg class="mx-auto mb-3 h-8 w-8 text-neutral-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                <p class="text-sm text-neutral-500">No canned responses yet</p>
                <p class="mt-1 text-xs text-neutral-600">Create reusable templates for common replies</p>
            </div>
            <div v-for="resp in responses" :key="resp.id" class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-4 transition-colors hover:bg-gray-900/80">
                <div class="mb-2 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="font-medium text-neutral-200">{{ resp.title }}</span>
                        <span v-if="resp.category" class="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-neutral-400 ring-1 ring-white/[0.06]">{{ resp.category }}</span>
                    </div>
                    <button @click="destroy(resp.id)" class="text-sm text-rose-400 hover:text-rose-300">Delete</button>
                </div>
                <p class="text-sm text-neutral-400">{{ resp.body }}</p>
            </div>
        </div>
    </EscalatedLayout>
</template>
