<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    status: { type: Object, default: null },
    categories: { type: Array, default: () => ['new', 'open', 'pending', 'on_hold', 'solved'] },
});

const categoryLabels = {
    new: 'New',
    open: 'Open',
    pending: 'Pending',
    on_hold: 'On-Hold',
    solved: 'Solved',
};

const form = useForm({
    label: props.status?.label || '',
    category: props.status?.category || 'open',
    color: props.status?.color || '#6b7280',
    description: props.status?.description || '',
    position: props.status?.position ?? 0,
    is_default: props.status?.is_default ?? false,
});

function submit() {
    if (props.status) {
        form.put(route('escalated.admin.statuses.update', props.status.id));
    } else {
        form.post(route('escalated.admin.statuses.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="status ? 'Edit Status' : 'New Status'">
        <form
            class="mx-auto max-w-lg space-y-5 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6"
            @submit.prevent="submit"
        >
            <div>
                <label class="block text-sm font-medium text-neutral-300">Label</label>
                <input
                    v-model="form.label"
                    type="text"
                    required
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
                <div v-if="form.errors.label" class="mt-1 text-sm text-rose-400">{{ form.errors.label }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-neutral-300">Category</label>
                <select
                    v-model="form.category"
                    required
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                >
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ categoryLabels[cat] || cat }}</option>
                </select>
                <div v-if="form.errors.category" class="mt-1 text-sm text-rose-400">{{ form.errors.category }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-neutral-300">Color</label>
                <input
                    v-model="form.color"
                    type="color"
                    class="mt-1 h-10 w-16 rounded-lg border border-white/10 bg-neutral-950"
                />
                <div v-if="form.errors.color" class="mt-1 text-sm text-rose-400">{{ form.errors.color }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-neutral-300">Description</label>
                <textarea
                    v-model="form.description"
                    rows="2"
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                ></textarea>
            </div>

            <div>
                <label class="block text-sm font-medium text-neutral-300">Position</label>
                <input
                    v-model.number="form.position"
                    type="number"
                    min="0"
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
            </div>

            <label class="flex items-center gap-2">
                <input
                    v-model="form.is_default"
                    type="checkbox"
                    class="rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-white/10"
                />
                <span class="text-sm text-neutral-300">Default status for this category</span>
            </label>

            <div class="flex justify-end">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50"
                >
                    {{ status ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
