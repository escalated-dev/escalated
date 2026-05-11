<script setup>
import { computed } from 'vue';
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import SkillTagManager from '../../../components/SkillTagManager.vue';
import { Link, useForm } from '@inertiajs/vue3';

const props = defineProps({
    skill: { type: Object, default: null },
    availableAgents: { type: Array, default: () => [] },
    availableTags: { type: Array, default: () => [] },
    availableDepartments: { type: Array, default: () => [] },
});

const form = useForm({
    name: props.skill?.name || '',
    routing_tag_ids: props.skill?.routing_tag_ids || [],
    routing_department_ids: props.skill?.routing_department_ids || [],
    agents: props.skill?.agents?.length ? props.skill.agents.map((agent) => ({ ...agent })) : [],
});

const unassignedAgents = computed(() =>
    props.availableAgents.filter((agent) => !form.agents.some((entry) => entry.user_id === agent.id)),
);

function submit() {
    if (props.skill) {
        form.put(route('escalated.admin.skills.update', props.skill.id));
    } else {
        form.post(route('escalated.admin.skills.store'));
    }
}

function addAgent() {
    const nextAgent = unassignedAgents.value[0];
    if (!nextAgent) {
        return;
    }

    form.agents.push({ user_id: nextAgent.id, proficiency: 3 });
}

function removeAgent(index) {
    form.agents.splice(index, 1);
}
</script>

<template>
    <EscalatedLayout :title="skill ? 'Edit Skill' : 'Create Skill'">
        <form
            class="mx-auto max-w-4xl space-y-5 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            @submit.prevent="submit"
        >
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Name</label>
                <input
                    v-model="form.name"
                    type="text"
                    required
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
                <p v-if="form.errors.name" class="mt-1 text-xs text-rose-400">{{ form.errors.name }}</p>
            </div>

            <div class="grid gap-5 lg:grid-cols-2">
                <div
                    class="space-y-3 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] p-4"
                >
                    <div>
                        <h2 class="text-sm font-semibold text-[var(--esc-panel-text-secondary)]">Routing Rules</h2>
                        <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                            Match tickets by tag or department to require this skill during auto-assignment.
                        </p>
                    </div>
                    <div>
                        <label
                            class="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--esc-panel-text-muted)]"
                        >
                            Required Tags
                        </label>
                        <SkillTagManager
                            v-model="form.routing_tag_ids"
                            :items="availableTags"
                            add-label="Add Tag"
                            empty-label="No ticket tags mapped"
                        />
                        <p v-if="form.errors.routing_tag_ids" class="mt-1 text-xs text-rose-400">
                            {{ form.errors.routing_tag_ids }}
                        </p>
                    </div>
                    <div>
                        <label
                            class="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--esc-panel-text-muted)]"
                        >
                            Departments
                        </label>
                        <SkillTagManager
                            v-model="form.routing_department_ids"
                            :items="availableDepartments"
                            add-label="Add Department"
                            empty-label="No departments mapped"
                        />
                        <p v-if="form.errors.routing_department_ids" class="mt-1 text-xs text-rose-400">
                            {{ form.errors.routing_department_ids }}
                        </p>
                    </div>
                </div>

                <div
                    class="space-y-3 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] p-4"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <h2 class="text-sm font-semibold text-[var(--esc-panel-text-secondary)]">
                                Agent Proficiency
                            </h2>
                            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                                Assign eligible agents and tune their proficiency from 1 to 5.
                            </p>
                        </div>
                        <button
                            v-if="unassignedAgents.length"
                            type="button"
                            class="rounded-lg border border-dashed border-[var(--esc-panel-border-input)] px-3 py-1.5 text-xs font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]"
                            @click="addAgent"
                        >
                            Add Agent
                        </button>
                    </div>

                    <div v-if="form.agents.length" class="space-y-3">
                        <div
                            v-for="(agent, index) in form.agents"
                            :key="`${agent.user_id}-${index}`"
                            class="grid gap-3 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-3 md:grid-cols-[minmax(0,1fr)_110px_auto]"
                        >
                            <div>
                                <label
                                    class="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--esc-panel-text-muted)]"
                                >
                                    Agent
                                </label>
                                <select
                                    v-model="agent.user_id"
                                    class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                >
                                    <option
                                        v-for="option in [
                                            ...unassignedAgents,
                                            availableAgents.find((entry) => entry.id === agent.user_id),
                                        ].filter(Boolean)"
                                        :key="option.id"
                                        :value="option.id"
                                    >
                                        {{ option.name }} / {{ option.email }}
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label
                                    class="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--esc-panel-text-muted)]"
                                >
                                    Proficiency
                                </label>
                                <select
                                    v-model="agent.proficiency"
                                    class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                                >
                                    <option :value="1">1</option>
                                    <option :value="2">2</option>
                                    <option :value="3">3</option>
                                    <option :value="4">4</option>
                                    <option :value="5">5</option>
                                </select>
                            </div>
                            <div class="flex items-end">
                                <button
                                    type="button"
                                    class="rounded-lg px-3 py-2 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10"
                                    @click="removeAgent(index)"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        v-else
                        class="rounded-lg border border-dashed border-[var(--esc-panel-border)] px-4 py-6 text-center text-sm text-[var(--esc-panel-text-muted)]"
                    >
                        No agents assigned yet.
                    </div>
                </div>
            </div>

            <div class="flex gap-3">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ skill ? 'Update' : 'Create' }}
                </button>
                <Link
                    :href="route('escalated.admin.skills.index')"
                    class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-4 py-2 text-sm font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]"
                >
                    Cancel
                </Link>
            </div>
        </form>
    </EscalatedLayout>
</template>
