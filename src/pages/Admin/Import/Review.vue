<script setup>
import { ref } from 'vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    platform: String,
    field_mappings: { type: Object, default: () => ({}) },
    entity_types: { type: Array, default: () => [] },
});

const form = useForm({
    field_mappings: props.field_mappings,
});

const submitting = ref(false);

function startImport() {
    submitting.value = true;
    form.post(route('escalated.admin.import.start', props.platform));
}
</script>

<template>
    <div class="mx-auto max-w-lg space-y-6">
        <div>
            <h2 class="text-lg font-semibold text-[var(--esc-panel-text)]">Review Import</h2>
            <p class="mt-1 text-sm text-[var(--esc-panel-text-secondary)]">
                Review your import settings before starting.
            </p>
        </div>

        <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6 space-y-4">
            <div>
                <span class="text-sm font-medium text-[var(--esc-panel-text)]">Platform:</span>
                <span class="ml-2 text-sm text-[var(--esc-panel-text-secondary)] capitalize">{{ platform }}</span>
            </div>

            <div>
                <span class="text-sm font-medium text-[var(--esc-panel-text)]">Entity types to import:</span>
                <ul class="mt-1 ml-4 list-disc text-sm text-[var(--esc-panel-text-secondary)]">
                    <li v-for="type in entity_types" :key="type" class="capitalize">{{ type }}</li>
                </ul>
            </div>

            <div>
                <span class="text-sm font-medium text-[var(--esc-panel-text)]">Field mappings configured:</span>
                <span class="ml-2 text-sm text-[var(--esc-panel-text-secondary)]">
                    {{ Object.keys(field_mappings).length }} entity types
                </span>
            </div>
        </div>

        <div class="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p class="text-sm text-yellow-200">
                This will create records in your Escalated instance. The import is resumable if interrupted.
                Notifications and automations are suppressed during import.
            </p>
        </div>

        <div class="flex justify-end gap-3">
            <button
                class="rounded-lg border border-[var(--esc-panel-border)] px-4 py-2 text-sm font-medium text-[var(--esc-panel-text)] hover:bg-[var(--esc-panel-hover)]"
                @click="$inertia.visit(route('escalated.admin.import.index'))"
            >
                Cancel
            </button>
            <button
                :disabled="submitting"
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
                @click="startImport"
            >
                {{ submitting ? 'Starting...' : 'Start Import' }}
            </button>
        </div>
    </div>
</template>
