<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import WorkflowTriggerSelector from '../../../components/WorkflowTriggerSelector.vue';
import WorkflowConditionBuilder from '../../../components/WorkflowConditionBuilder.vue';
import WorkflowActionList from '../../../components/WorkflowActionList.vue';
import { useForm } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    workflow: { type: Object, default: null },
});

const form = useForm({
    name: props.workflow?.name || '',
    description: props.workflow?.description || '',
    trigger: props.workflow?.trigger || '',
    conditions: props.workflow?.conditions || { match: 'all', conditions: [] },
    actions: props.workflow?.actions || [],
    active: props.workflow?.active ?? true,
});

const expandedStep = ref(props.workflow ? null : 1);

function toggleStep(step) {
    expandedStep.value = expandedStep.value === step ? null : step;
}

function submit() {
    if (props.workflow) {
        form.put(route('escalated.admin.workflows.update', props.workflow.id));
    } else {
        form.post(route('escalated.admin.workflows.store'));
    }
}

const isValid = computed(() => {
    return form.name && form.trigger && form.actions.length > 0;
});

const stepBorderColors = {
    1: 'border-l-blue-500',
    2: 'border-l-amber-500',
    3: 'border-l-emerald-500',
};

const stepDotColors = {
    1: 'bg-blue-500',
    2: 'bg-amber-500',
    3: 'bg-emerald-500',
};

const stepLabels = {
    1: 'Trigger Event',
    2: 'Conditions',
    3: 'Actions',
};

const stepDescriptions = {
    1: 'When this happens...',
    2: 'Only if these conditions are met...',
    3: 'Then do this...',
};

function stepHasData(step) {
    switch (step) {
        case 1:
            return !!form.trigger;
        case 2:
            return form.conditions?.conditions?.length > 0;
        case 3:
            return form.actions?.length > 0;
        default:
            return false;
    }
}
</script>

<template>
    <EscalatedLayout :title="workflow ? 'Edit Workflow' : 'Create Workflow'">
        <form class="mx-auto max-w-3xl space-y-6" @submit.prevent="submit">
            <!-- Header -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Workflow Name</label
                        >
                        <input
                            v-model="form.name"
                            type="text"
                            required
                            placeholder="e.g. Auto-assign urgent tickets"
                            class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                        <p v-if="form.errors.name" class="mt-1 text-xs text-rose-400">{{ form.errors.name }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Description</label
                        >
                        <textarea
                            v-model="form.description"
                            rows="2"
                            placeholder="What does this workflow do?"
                            class="mt-1 w-full resize-y rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                    </div>
                    <div>
                        <label class="flex items-center gap-2 text-sm text-[var(--esc-panel-text-secondary)]">
                            <input
                                v-model="form.active"
                                type="checkbox"
                                class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-cyan-500 focus:ring-cyan-500/20"
                            />
                            Active
                        </label>
                    </div>
                </div>
            </div>

            <!-- Steps -->
            <div class="relative space-y-4">
                <!-- Vertical connector line -->
                <div class="absolute top-0 bottom-0 left-6 w-px bg-[var(--esc-panel-border)]" />

                <!-- Step 1: Trigger -->
                <div
                    v-for="step in [1, 2, 3]"
                    :key="step"
                    class="relative rounded-xl border border-[var(--esc-panel-border)] border-l-4 bg-[var(--esc-panel-surface)] transition-all"
                    :class="stepBorderColors[step]"
                >
                    <!-- Step dot -->
                    <div
                        class="absolute -left-[11px] top-4 flex h-5 w-5 items-center justify-center rounded-full"
                        :class="stepDotColors[step]"
                    >
                        <span v-if="stepHasData(step)" class="text-[10px] font-bold text-white">
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </span>
                        <span v-else class="text-[10px] font-bold text-white">{{ step }}</span>
                    </div>

                    <!-- Step header -->
                    <button
                        type="button"
                        class="flex w-full items-center gap-3 px-6 py-4 text-left"
                        @click="toggleStep(step)"
                    >
                        <div class="flex-1">
                            <h3 class="text-sm font-semibold text-[var(--esc-panel-text-secondary)]">
                                {{ stepLabels[step] }}
                                <span
                                    v-if="step === 2"
                                    class="ml-1 text-xs font-normal text-[var(--esc-panel-text-muted)]"
                                    >(optional)</span
                                >
                            </h3>
                            <p class="text-xs text-[var(--esc-panel-text-muted)]">{{ stepDescriptions[step] }}</p>
                        </div>
                        <svg
                            class="h-4 w-4 text-[var(--esc-panel-text-muted)] transition-transform"
                            :class="expandedStep === step ? 'rotate-180' : ''"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>

                    <!-- Step content -->
                    <div v-if="expandedStep === step" class="border-t border-[var(--esc-panel-border)] px-6 py-4">
                        <!-- Trigger selector -->
                        <WorkflowTriggerSelector v-if="step === 1" v-model="form.trigger" />

                        <!-- Condition builder -->
                        <WorkflowConditionBuilder v-if="step === 2" v-model="form.conditions" />

                        <!-- Action list -->
                        <WorkflowActionList v-if="step === 3" v-model="form.actions" />
                    </div>
                </div>
            </div>

            <!-- Footer buttons -->
            <div class="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    :disabled="form.processing || !isValid"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ form.processing ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow' }}
                </button>
                <a
                    :href="route('escalated.admin.workflows.index')"
                    class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-4 py-2.5 text-sm font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]"
                >
                    Cancel
                </a>
            </div>
        </form>
    </EscalatedLayout>
</template>
