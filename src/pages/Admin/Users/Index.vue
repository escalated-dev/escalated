<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import EscalatedLayout from '../../../components/EscalatedLayout.vue';

const props = defineProps({
    users: Object,
    filters: { type: Object, default: () => ({}) },
    currentUserId: { type: [Number, String], default: null },
    // Sent by a backend that cannot list the host app's users yet (e.g. no
    // user-list hook configured). Server-worded; shown as given, not translated.
    notice: { type: String, default: null },
});

const search = ref(props.filters?.search ?? '');

function applySearch() {
    router.get(
        route('escalated.admin.users.index'),
        { search: search.value },
        { preserveState: true, preserveScroll: true },
    );
}

function toggleRole(user, role) {
    const value = role === 'admin' ? !user.is_admin : !user.is_agent;
    router.patch(route('escalated.admin.users.role', user.id), { role, value }, { preserveScroll: true });
}

function isSelf(user) {
    return props.currentUserId !== null && String(user.id) === String(props.currentUserId);
}
</script>

<template>
    <EscalatedLayout title="Users">
        <div class="mb-4 flex items-center justify-between gap-4">
            <form class="flex-1 max-w-sm" @submit.prevent="applySearch">
                <input
                    v-model="search"
                    type="search"
                    placeholder="Search by name or email"
                    class="w-full rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] px-3 py-2 text-sm text-[var(--esc-panel-text)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-accent)]"
                />
            </form>
        </div>

        <div
            v-if="notice"
            role="status"
            class="mb-4 flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm text-blue-300"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mt-0.5 h-5 w-5 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
            >
                <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                />
            </svg>
            <p>{{ notice }}</p>
        </div>

        <div class="esc-table-scroll rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)]">
            <table class="min-w-full divide-y divide-[var(--esc-panel-border)]">
                <thead>
                    <tr class="bg-[var(--esc-panel-hover)]">
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            User
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Email
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Admin
                        </th>
                        <th
                            class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--esc-panel-text-muted)]"
                        >
                            Agent
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[var(--esc-panel-border)]">
                    <tr v-if="!users?.data?.length && !notice">
                        <td colspan="4" class="px-4 py-12 text-center text-sm text-[var(--esc-panel-text-muted)]">
                            No users found.
                        </td>
                    </tr>
                    <tr v-for="user in users?.data || []" :key="user.id" class="hover:bg-[var(--esc-panel-hover)]">
                        <td class="whitespace-nowrap px-4 py-3 text-sm text-[var(--esc-panel-text)]">
                            <span>{{ user.name || '—' }}</span>
                            <span
                                v-if="isSelf(user)"
                                class="ml-2 rounded-full bg-[var(--esc-panel-accent)]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--esc-panel-accent)]"
                            >
                                You
                            </span>
                        </td>
                        <td class="whitespace-nowrap px-4 py-3 text-sm text-[var(--esc-panel-text-muted)]">
                            {{ user.email }}
                        </td>
                        <td class="px-4 py-3">
                            <button
                                type="button"
                                :disabled="isSelf(user) && user.is_admin"
                                :title="isSelf(user) && user.is_admin ? 'You cannot remove your own admin role.' : ''"
                                class="inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                :class="user.is_admin ? 'bg-indigo-600' : 'bg-gray-300'"
                                @click="toggleRole(user, 'admin')"
                            >
                                <span
                                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                    :class="user.is_admin ? 'translate-x-6' : 'translate-x-1'"
                                />
                            </button>
                        </td>
                        <td class="px-4 py-3">
                            <button
                                type="button"
                                class="inline-flex h-6 w-11 items-center rounded-full transition-colors"
                                :class="user.is_agent ? 'bg-indigo-600' : 'bg-gray-300'"
                                @click="toggleRole(user, 'agent')"
                            >
                                <span
                                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                                    :class="user.is_agent ? 'translate-x-6' : 'translate-x-1'"
                                />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="users?.links?.length > 3" class="mt-4 flex items-center justify-end gap-1">
            <template v-for="(link, idx) in users.links" :key="idx">
                <button
                    v-if="link.url"
                    type="button"
                    class="rounded-md px-3 py-1 text-sm"
                    :class="
                        link.active
                            ? 'bg-[var(--esc-panel-accent)] text-white'
                            : 'text-[var(--esc-panel-text-muted)] hover:bg-[var(--esc-panel-hover)]'
                    "
                    @click="router.get(link.url, {}, { preserveState: true, preserveScroll: true })"
                    v-html="link.label"
                />
                <span
                    v-else
                    class="rounded-md px-3 py-1 text-sm text-[var(--esc-panel-text-muted)]/40"
                    v-html="link.label"
                />
            </template>
        </div>
    </EscalatedLayout>
</template>
