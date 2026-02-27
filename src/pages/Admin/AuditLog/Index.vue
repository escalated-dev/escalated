<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import AuditLogEntry from '../../../components/AuditLogEntry.vue';
import { router } from '@inertiajs/vue3';
import { ref, watch } from 'vue';

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
        <div class="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-4">
            <div>
                <label class="block text-xs font-medium text-neutral-400">User</label>
                <select
                    v-model="filterForm.user_id"
                    class="mt-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                >
                    <option value="">All Users</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-neutral-400">Action</label>
                <select
                    v-model="filterForm.action"
                    class="mt-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                >
                    <option value="">All Actions</option>
                    <option v-for="a in actions" :key="a" :value="a">{{ a }}</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-neutral-400">Resource Type</label>
                <select
                    v-model="filterForm.auditable_type"
                    class="mt-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                >
                    <option value="">All Types</option>
                    <option v-for="t in resourceTypes" :key="t" :value="t">{{ t.split('\\').pop() }}</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-medium text-neutral-400">From</label>
                <input
                    v-model="filterForm.date_from"
                    type="date"
                    class="mt-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
            </div>
            <div>
                <label class="block text-xs font-medium text-neutral-400">To</label>
                <input
                    v-model="filterForm.date_to"
                    type="date"
                    class="mt-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
            </div>
            <button
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
                @click="applyFilters"
            >
                Filter
            </button>
            <button
                class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.06]"
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
            <div v-else class="rounded-xl border border-white/[0.06] bg-neutral-900/60 px-4 py-12 text-center">
                <svg
                    class="mx-auto mb-3 h-8 w-8 text-neutral-700"
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
                <p class="text-sm text-neutral-500">No audit log entries found</p>
                <p class="mt-1 text-xs text-neutral-600">Activity will appear here as changes are made</p>
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
                            ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white'
                            : 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]',
                    ]"
                    @click="router.get(link.url, {}, { preserveState: true })"
                    v-html="link.label"
                ></button>
                <span v-else class="rounded-lg px-3 py-1.5 text-sm text-neutral-500" v-html="link.label"></span>
            </template>
        </div>
    </EscalatedLayout>
</template>
