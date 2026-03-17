<script setup>
import { useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    platform: String,
    display_name: String,
    entity_types: { type: Array, default: () => [] },
    mappings: { type: Object, default: () => ({}) },
    credentials: { type: Object, default: () => ({}) },
});

const activeEntity = ref(props.entity_types[0] || '');
const fieldMappings = ref({});
const skippedEntities = ref({});

// Initialize mappings from defaults
props.entity_types.forEach((type) => {
    fieldMappings.value[type] = { ...(props.mappings[type]?.defaults || {}) };
    skippedEntities.value[type] = false;
});

const form = useForm({
    credentials: props.credentials,
    field_mappings: {},
    entity_types: [],
});

function proceed() {
    form.field_mappings = fieldMappings.value;
    form.entity_types = props.entity_types.filter((t) => !skippedEntities.value[t]);
    form.post(route('escalated.admin.import.review', props.platform));
}
</script>

<template>
    <div class="space-y-6">
        <div>
            <h2 class="text-lg font-semibold text-[var(--esc-panel-text)]">Field Mapping</h2>
            <p class="mt-1 text-sm text-[var(--esc-panel-text-secondary)]">
                Configure how {{ display_name }} fields map to Escalated. Defaults are pre-filled.
            </p>
        </div>

        <!-- Entity type tabs -->
        <div
            class="flex gap-1 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] p-1"
        >
            <button
                v-for="type in entity_types"
                :key="type"
                :class="[
                    'rounded-md px-3 py-1.5 text-sm font-medium transition',
                    activeEntity === type
                        ? 'bg-[var(--esc-panel-surface)] text-[var(--esc-panel-text)]'
                        : 'text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]',
                ]"
                @click="activeEntity = type"
            >
                {{ type }}
            </button>
        </div>

        <!-- Active entity mapping -->
        <div v-for="type in entity_types" v-show="activeEntity === type" :key="type">
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <!-- Skip toggle -->
                <label class="mb-4 flex items-center gap-2">
                    <input
                        v-model="skippedEntities[type]"
                        type="checkbox"
                        class="rounded border-[var(--esc-panel-border)]"
                    />
                    <span class="text-sm text-[var(--esc-panel-text-secondary)]">Skip importing {{ type }}</span>
                </label>

                <div v-if="!skippedEntities[type]" class="space-y-3">
                    <div
                        v-for="(sourceFields, idx) in mappings[type]?.source_fields || []"
                        :key="idx"
                        class="flex items-center gap-4"
                    >
                        <span class="w-1/3 text-sm text-[var(--esc-panel-text)]">{{
                            sourceFields.label || sourceFields.name
                        }}</span>
                        <span class="text-[var(--esc-panel-text-muted)]">&rarr;</span>
                        <select
                            v-model="fieldMappings[type][sourceFields.name]"
                            class="w-1/3 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)]"
                        >
                            <option value="">Skip field</option>
                            <option v-for="opt in sourceFields.escalated_options || []" :key="opt" :value="opt">
                                {{ opt }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-end">
            <button
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-6 py-2 text-sm font-medium text-white"
                @click="proceed"
            >
                Next: Review
            </button>
        </div>
    </div>
</template>
