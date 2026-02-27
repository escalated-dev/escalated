<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    field: { type: Object, default: null },
    contexts: { type: Array, default: () => ['ticket', 'user', 'organization'] },
});

const form = useForm({
    name: props.field?.name || '',
    type: props.field?.type || 'text',
    context: props.field?.context || 'ticket',
    options: props.field?.options || [],
    required: props.field?.required ?? false,
    placeholder: props.field?.placeholder || '',
    description: props.field?.description || '',
    position: props.field?.position ?? 0,
    active: props.field?.active ?? true,
});

const newOption = ref('');

const showOptionsEditor = computed(() => ['select', 'multi_select'].includes(form.type));

function addOption() {
    const val = newOption.value.trim();
    if (val && !form.options.includes(val)) {
        form.options.push(val);
        newOption.value = '';
    }
}

function removeOption(index) {
    form.options.splice(index, 1);
}

function submit() {
    if (props.field) {
        form.put(route('escalated.admin.custom-fields.update', props.field.id));
    } else {
        form.post(route('escalated.admin.custom-fields.store'));
    }
}

const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select' },
    { value: 'multi_select', label: 'Multi-Select' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' },
];
</script>

<template>
    <EscalatedLayout :title="field ? 'Edit Custom Field' : 'New Custom Field'">
        <form
            class="mx-auto max-w-lg space-y-5 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6"
            @submit.prevent="submit"
        >
            <div>
                <label class="block text-sm font-medium text-neutral-300">Name</label>
                <input
                    v-model="form.name"
                    type="text"
                    required
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
                <div v-if="form.errors.name" class="mt-1 text-sm text-rose-400">{{ form.errors.name }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-neutral-300">Type</label>
                <select
                    v-model="form.type"
                    required
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                >
                    <option v-for="ft in fieldTypes" :key="ft.value" :value="ft.value">{{ ft.label }}</option>
                </select>
                <div v-if="form.errors.type" class="mt-1 text-sm text-rose-400">{{ form.errors.type }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-neutral-300">Context</label>
                <select
                    v-model="form.context"
                    required
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                >
                    <option v-for="ctx in contexts" :key="ctx" :value="ctx">
                        {{ ctx.charAt(0).toUpperCase() + ctx.slice(1) }}
                    </option>
                </select>
                <div v-if="form.errors.context" class="mt-1 text-sm text-rose-400">{{ form.errors.context }}</div>
            </div>

            <!-- Options editor for select/multi_select -->
            <div v-if="showOptionsEditor">
                <label class="block text-sm font-medium text-neutral-300">Options</label>
                <div class="mt-1 space-y-2">
                    <div v-for="(opt, idx) in form.options" :key="idx" class="flex items-center gap-2">
                        <span
                            class="flex-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200"
                            >{{ opt }}</span
                        >
                        <button
                            type="button"
                            class="text-rose-400 hover:text-rose-300 text-sm"
                            @click="removeOption(idx)"
                        >
                            Remove
                        </button>
                    </div>
                    <div class="flex items-center gap-2">
                        <input
                            v-model="newOption"
                            type="text"
                            placeholder="Add option..."
                            class="flex-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                            @keydown.enter.prevent="addOption"
                        />
                        <button
                            type="button"
                            class="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.06]"
                            @click="addOption"
                        >
                            Add
                        </button>
                    </div>
                </div>
                <div v-if="form.errors.options" class="mt-1 text-sm text-rose-400">{{ form.errors.options }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-neutral-300">Placeholder</label>
                <input
                    v-model="form.placeholder"
                    type="text"
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
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
                    v-model="form.required"
                    type="checkbox"
                    class="rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-white/10"
                />
                <span class="text-sm text-neutral-300">Required</span>
            </label>

            <label class="flex items-center gap-2">
                <input
                    v-model="form.active"
                    type="checkbox"
                    class="rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-white/10"
                />
                <span class="text-sm text-neutral-300">Active</span>
            </label>

            <div class="flex justify-end">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50"
                >
                    {{ field ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
