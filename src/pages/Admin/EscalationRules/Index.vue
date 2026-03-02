<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { Link, router } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({ rules: Array });

const selectedCategory = ref('');
const collapsedCategories = ref({});

function destroy(id) {
    if (confirm('Delete this escalation rule?')) {
        router.delete(route('escalated.admin.escalation-rules.destroy', id));
    }
}

const categories = computed(() => {
    const cats = new Set();
    (props.rules || []).forEach((r) => cats.add(r.category || 'Uncategorized'));
    return Array.from(cats).sort();
});

const filteredRules = computed(() => {
    if (!selectedCategory.value) return props.rules || [];
    return (props.rules || []).filter((r) => (r.category || 'Uncategorized') === selectedCategory.value);
});

const groupedRules = computed(() => {
    const groups = {};
    filteredRules.value.forEach((rule) => {
        const cat = rule.category || 'Uncategorized';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(rule);
    });
    return groups;
});

function toggleCategory(cat) {
    collapsedCategories.value[cat] = !collapsedCategories.value[cat];
}
</script>

<template>
    <EscalatedLayout title="Escalation Rules">
        <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <select
                    v-model="selectedCategory"
                    class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                >
                    <option value="">All Categories</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
            </div>
            <Link
                :href="route('escalated.admin.escalation-rules.create')"
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]"
            >
                Add Rule
            </Link>
        </div>

        <div
            v-if="!rules?.length"
            class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] px-4 py-12 text-center"
        >
            <svg
                class="mx-auto mb-3 h-8 w-8 text-[var(--esc-panel-text-muted)]"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
                />
            </svg>
            <p class="text-sm text-[var(--esc-panel-text-muted)]">No escalation rules yet</p>
            <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                Set up automatic escalation for overdue tickets
            </p>
        </div>

        <!-- Grouped by category -->
        <div v-for="(catRules, category) in groupedRules" :key="category" class="mb-4">
            <button
                class="mb-2 flex w-full items-center gap-2 text-sm font-semibold text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                @click="toggleCategory(category)"
            >
                <svg
                    :class="[
                        'h-4 w-4 text-[var(--esc-panel-text-muted)] transition-transform',
                        !collapsedCategories[category] && 'rotate-90',
                    ]"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                {{ category }}
                <span class="text-xs text-[var(--esc-panel-text-muted)]">({{ catRules.length }})</span>
            </button>

            <div
                v-if="!collapsedCategories[category]"
                class="overflow-hidden rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]"
            >
                <table class="min-w-full divide-y divide-[var(--esc-panel-border)]">
                    <thead>
                        <tr class="bg-[var(--esc-panel-hover)]">
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                            >
                                Order
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                            >
                                Name
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                            >
                                Trigger
                            </th>
                            <th
                                class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                            >
                                Active
                            </th>
                            <th
                                class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[var(--esc-panel-border)]">
                        <tr
                            v-for="rule in catRules"
                            :key="rule.id"
                            class="transition-colors hover:bg-[var(--esc-panel-hover)]"
                        >
                            <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">{{ rule.order }}</td>
                            <td class="px-4 py-3 text-sm font-medium text-[var(--esc-panel-text-secondary)]">
                                {{ rule.name }}
                            </td>
                            <td class="px-4 py-3 text-sm text-[var(--esc-panel-text-tertiary)]">
                                {{ rule.trigger_type }}
                            </td>
                            <td class="px-4 py-3 text-sm">
                                <span
                                    :class="rule.is_active ? 'text-emerald-400' : 'text-[var(--esc-panel-text-muted)]'"
                                    >{{ rule.is_active ? 'Yes' : 'No' }}</span
                                >
                            </td>
                            <td class="px-4 py-3 text-right text-sm">
                                <Link
                                    :href="route('escalated.admin.escalation-rules.edit', rule.id)"
                                    class="text-[var(--esc-panel-text-secondary)] hover:text-[var(--esc-panel-text)]"
                                >
                                    Edit
                                </Link>
                                <button class="ml-3 text-rose-400 hover:text-rose-300" @click="destroy(rule.id)">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </EscalatedLayout>
</template>
