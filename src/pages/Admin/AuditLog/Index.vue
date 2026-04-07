<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import AuditLogEntry from '../../../components/AuditLogEntry.vue';
import { router } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    logs: Object,
    filters: Object,
    users: Array,
    actions: Array,
    resourceTypes: Array,
});

const filterForm = ref({
    user_id: props.filters?.user_id || '',
    action: props.filters?.action || '',
    auditable_type: props.filters?.auditable_type || '',
    date_from: props.filters?.date_from || '',
    date_to: props.filters?.date_to || '',
});

function applyFilters() {
    const params = {};
    for (const [key, value] of Object.entries(filterForm.value)) {
        if (value) params[key] = value;
    }
    router.get(route('escalated.admin.audit-log'), params, { preserveState: true });
}

function clearFilters() {
    filterForm.value = { user_id: '', action: '', auditable_type: '', date_from: '', date_to: '' };
    router.get(route('escalated.admin.audit-log'), {}, { preserveState: true });
}
</script>

<template>
    <EscalatedLayout title="Audit Log">
        <!-- Filters -->
        <div
            class="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-4"
        >
            <div>
                <label class="block text-xs font-medium text-[var(--esc-panel-text-tertiary)]">User</label>
                <select
                    v-model="filterForm.user_id"
                    class="mt-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                >
                    <option value="">All Users</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-[var(--esc-panel-text-tertiary)]">Action</label>
                <select
                    v-model="filterForm.action"
                    class="mt-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                >
                    <option value="">All Actions</option>
                    <option v-for="a in actions" :key="a" :value="a">{{ a }}</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-[var(--esc-panel-text-tertiary)]">Resource Type</label>
                <select
                    v-model="filterForm.auditable_type"
                    class="mt-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                >
                    <option value="">All Types</option>
                    <option v-for="t in resourceTypes" :key="t" :value="t">{{ t.split('\\').pop() }}</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-[var(--esc-panel-text-tertiary)]">From</label>
                <input
                    v-model="filterForm.date_from"
                    type="date"
                    class="mt-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
            </div>
            <div>
                <label class="block text-xs font-medium text-[var(--esc-panel-text-tertiary)]">To</label>
                <input
                    v-model="filterForm.date_to"
                    type="date"
                    class="mt-1 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
            </div>
            <button
                class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)]"
                @click="applyFilters"
            >
                Filter
            </button>
            <button
                class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-4 py-1.5 text-sm font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]"
                @click="clearFilters"
            >
                Clear
            </button>
        </div>

        <!-- Log entries -->
        <div class="space-y-2">
            <template v-if="logs?.data?.length">
                <AuditLogEntry v-for="log in logs.data" :key="log.id" :log="log" />
            </template>
            <div
                v-else
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
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                </svg>
                <p class="text-sm text-[var(--esc-panel-text-muted)]">No audit log entries found</p>
                <p class="mt-1 text-xs text-[var(--esc-panel-text-muted)]">
                    Activity will appear here as changes are made
                </p>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="logs?.links?.length > 3" class="mt-6 flex justify-center gap-1">
            <template v-for="link in logs.links" :key="link.label">
                <button
                    v-if="link.url"
                    :class="[
                        'rounded-lg px-3 py-1.5 text-sm transition-colors',
                        link.active
                            ? 'bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] text-white'
                            : 'border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)]',
                    ]"
                    @click="router.get(link.url, {}, { preserveState: true })"
                    v-html="link.label"
                ></button>
                <span
                    v-else
                    class="rounded-lg px-3 py-1.5 text-sm text-[var(--esc-panel-text-muted)]"
                    v-html="link.label"
                ></span>
            </template>
        </div>
    </EscalatedLayout>
</template>
