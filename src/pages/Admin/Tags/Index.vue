<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, router } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({ tags: Array });

const showForm = ref(false);
const editingTag = ref(null);

const form = useForm({ name: '', color: '#06b6d4' });

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
            <button @click="showForm = !showForm"
                    :class="showForm
                        ? 'rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.06]'
                        : 'rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400'">
                {{ showForm ? 'Cancel' : 'Add Tag' }}
            </button>
        </div>
        <form v-if="showForm" @submit.prevent="createTag" class="mb-6 flex items-end gap-3 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-4">
            <div>
                <label class="block text-sm font-medium text-neutral-300">Name</label>
                <input v-model="form.name" type="text" required class="mt-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" />
            </div>
            <div>
                <label class="block text-sm font-medium text-neutral-300">Color</label>
                <input v-model="form.color" type="color" class="mt-1 h-10 w-16 rounded-lg border border-white/10 bg-neutral-950" />
            </div>
            <button type="submit" :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50">
                Create
            </button>
        </form>
        <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
            <table class="min-w-full divide-y divide-white/[0.06]">
                <thead>
                    <tr class="bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Color</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Name</th>
                        <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Tickets</th>
                        <th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-if="!tags?.length">
                        <td colspan="4" class="px-4 py-12 text-center">
                            <svg class="mx-auto mb-3 h-8 w-8 text-neutral-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z" /></svg>
                            <p class="text-sm text-neutral-500">No tags yet</p>
                            <p class="mt-1 text-xs text-neutral-600">Create tags to categorize and filter tickets</p>
                        </td>
                    </tr>
                    <tr v-for="tag in tags" :key="tag.id" class="transition-colors hover:bg-white/[0.03]">
                        <td class="px-4 py-3">
                            <span class="inline-block h-4 w-4 rounded-full ring-1 ring-white/10" :style="{ backgroundColor: tag.color }"></span>
                        </td>
                        <td class="px-4 py-3 text-sm font-medium text-neutral-200">
                            <template v-if="editingTag === tag.id">
                                <form @submit.prevent="updateTag(tag.id)" class="flex items-center gap-2">
                                    <input v-model="form.name" type="text" required class="rounded-lg border border-white/10 bg-neutral-950 px-2 py-1 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" />
                                    <input v-model="form.color" type="color" class="h-8 w-10 rounded border border-white/10 bg-neutral-950" />
                                    <button type="submit" class="text-sm text-neutral-300 hover:text-white">Save</button>
                                    <button type="button" @click="editingTag = null" class="text-sm text-neutral-400 hover:text-neutral-300">Cancel</button>
                                </form>
                            </template>
                            <template v-else>{{ tag.name }}</template>
                        </td>
                        <td class="px-4 py-3 text-sm text-neutral-400">{{ tag.tickets_count }}</td>
                        <td class="px-4 py-3 text-right text-sm">
                            <button @click="startEdit(tag)" class="text-neutral-300 hover:text-white">Edit</button>
                            <button @click="destroy(tag.id)" class="ml-3 text-rose-400 hover:text-rose-300">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </EscalatedLayout>
</template>
