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
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Object Details</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Name</label>
                        <input
                            v-model="form.name"
                            type="text"
                            placeholder="e.g. Product, Contract"
                            class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            @input="autoSlug"
                        />
                        <div v-if="form.errors.name" class="mt-1 text-sm text-rose-400">{{ form.errors.name }}</div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Slug</label>
                        <input
                            v-model="form.slug"
                            type="text"
                            :readonly="isEdit"
                            class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm font-mono text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            :class="{ 'bg-[var(--esc-panel-surface)] text-[var(--esc-panel-text-muted)]': isEdit }"
                        />
                        <div v-if="form.errors.slug" class="mt-1 text-sm text-rose-400">{{ form.errors.slug }}</div>
                    </div>
                </div>
            </div>

            <!-- Fields Schema -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <div class="mb-5 flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-[var(--esc-panel-text)]">Fields</h3>
                    <button
                        type="button"
                        class="rounded-lg border border-[var(--esc-panel-border-input)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-tertiary)] hover:border-[var(--esc-panel-border-input)] hover:text-[var(--esc-panel-text-secondary)]"
                        @click="addField"
                    >
                        + Add Field
                    </button>
                </div>

                <div v-if="form.fields_schema.length" class="space-y-3">
                    <div
                        v-for="(field, idx) in form.fields_schema"
                        :key="idx"
                        class="rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] p-4"
                    >
                        <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
                            <div class="sm:col-span-2">
                                <label class="block text-xs font-medium text-[var(--esc-panel-text-tertiary)]"
                                    >Field Name</label
                                >
                                <input
                                    v-model="field.name"
                                    type="text"
                                    placeholder="e.g. serial_number"
                                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                />
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-[var(--esc-panel-text-tertiary)]"
                                    >Type</label
                                >
                                <select
                                    v-model="field.type"
                                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
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
                                        class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] text-cyan-500 focus:ring-[var(--esc-panel-border-input)]"
                                    />
                                    <span class="text-xs text-[var(--esc-panel-text-tertiary)]">Required</span>
                                </label>
                                <button
                                    type="button"
                                    class="ml-auto rounded p-1 text-[var(--esc-panel-text-muted)] hover:bg-red-500/10 hover:text-red-400"
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
                            <label class="block text-xs font-medium text-[var(--esc-panel-text-tertiary)]"
                                >Options (comma-separated)</label
                            >
                            <input
                                :value="(field.options || []).join(', ')"
                                type="text"
                                placeholder="Option1, Option2, Option3"
                                class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
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

                <div
                    v-else
                    class="rounded-lg border border-dashed border-[var(--esc-panel-border)] px-4 py-6 text-center"
                >
                    <p class="text-sm text-[var(--esc-panel-text-muted)]">
                        No fields defined yet. Click "Add Field" to start.
                    </p>
                </div>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-end gap-3">
                <span v-if="form.recentlySuccessful" class="text-sm text-emerald-400">Saved.</span>
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ form.processing ? 'Saving...' : isEdit ? 'Update Object' : 'Create Object' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
