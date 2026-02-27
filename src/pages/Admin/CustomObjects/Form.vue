<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    object: { type: Object, default: null },
});

const isEdit = !!props.object;

const form = useForm({
    name: props.object?.name || '',
    slug: props.object?.slug || '',
    fields_schema: props.object?.fields_schema || [],
});

const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'select', label: 'Select' },
    { value: 'date', label: 'Date' },
    { value: 'lookup', label: 'Lookup' },
];

function addField() {
    form.fields_schema.push({
        name: '',
        type: 'text',
        required: false,
        options: [],
    });
}

function removeField(index) {
    form.fields_schema.splice(index, 1);
}

function autoSlug() {
    if (!isEdit) {
        form.slug = form.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_|_$)/g, '');
    }
}

function submit() {
    if (isEdit) {
        form.put(route('escalated.admin.custom-objects.update', props.object.id));
    } else {
        form.post(route('escalated.admin.custom-objects.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="isEdit ? 'Edit Custom Object' : 'New Custom Object'">
        <form class="mx-auto max-w-2xl space-y-6" @submit.prevent="submit">
            <!-- Basic Info -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-5 text-sm font-semibold text-white">Object Details</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Name</label>
                        <input
                            v-model="form.name"
                            type="text"
                            placeholder="e.g. Product, Contract"
                            class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                            @input="autoSlug"
                        />
                        <div v-if="form.errors.name" class="mt-1 text-sm text-rose-400">{{ form.errors.name }}</div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Slug</label>
                        <input
                            v-model="form.slug"
                            type="text"
                            :readonly="isEdit"
                            class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm font-mono text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                            :class="{ 'bg-neutral-900/50 text-neutral-500': isEdit }"
                        />
                        <div v-if="form.errors.slug" class="mt-1 text-sm text-rose-400">{{ form.errors.slug }}</div>
                    </div>
                </div>
            </div>

            <!-- Fields Schema -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <div class="mb-5 flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-white">Fields</h3>
                    <button
                        type="button"
                        class="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-neutral-400 hover:border-white/20 hover:text-neutral-200"
                        @click="addField"
                    >
                        + Add Field
                    </button>
                </div>

                <div v-if="form.fields_schema.length" class="space-y-3">
                    <div
                        v-for="(field, idx) in form.fields_schema"
                        :key="idx"
                        class="rounded-lg border border-white/[0.06] bg-neutral-950 p-4"
                    >
                        <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
                            <div class="sm:col-span-2">
                                <label class="block text-xs font-medium text-neutral-400">Field Name</label>
                                <input
                                    v-model="field.name"
                                    type="text"
                                    placeholder="e.g. serial_number"
                                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                                />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-neutral-400">Type</label>
                                <select
                                    v-model="field.type"
                                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                                >
                                    <option v-for="ft in fieldTypes" :key="ft.value" :value="ft.value">
                                        {{ ft.label }}
                                    </option>
                                </select>
                            </div>
                            <div class="flex items-end gap-2">
                                <label class="flex items-center gap-2 py-2">
                                    <input
                                        v-model="field.required"
                                        type="checkbox"
                                        class="rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-white/10"
                                    />
                                    <span class="text-xs text-neutral-400">Required</span>
                                </label>
                                <button
                                    type="button"
                                    class="ml-auto rounded p-1 text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
                                    @click="removeField(idx)"
                                >
                                    <svg
                                        class="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        viewBox="0 0 24 24"
                                    >
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <!-- Options for select type -->
                        <div v-if="field.type === 'select'" class="mt-3">
                            <label class="block text-xs font-medium text-neutral-400">Options (comma-separated)</label>
                            <input
                                :value="(field.options || []).join(', ')"
                                type="text"
                                placeholder="Option1, Option2, Option3"
                                class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                                @input="
                                    field.options = $event.target.value
                                        .split(',')
                                        .map((s) => s.trim())
                                        .filter(Boolean)
                                "
                            />
                        </div>
                    </div>
                </div>

                <div v-else class="rounded-lg border border-dashed border-white/[0.08] px-4 py-6 text-center">
                    <p class="text-sm text-neutral-500">No fields defined yet. Click "Add Field" to start.</p>
                </div>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-end gap-3">
                <span v-if="form.recentlySuccessful" class="text-sm text-emerald-400">Saved.</span>
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50"
                >
                    {{ form.processing ? 'Saving...' : isEdit ? 'Update Object' : 'Create Object' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
