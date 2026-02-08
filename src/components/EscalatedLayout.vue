<script setup>
import { computed, inject } from 'vue';
import { usePage, Link } from '@inertiajs/vue3';

const props = defineProps({
    title: { type: String, default: 'Support' },
});

const page = usePage();
const hostLayout = inject('escalated-layout', null);

const isAgent = computed(() => page.props.escalated?.is_agent);
const isAdmin = computed(() => page.props.escalated?.is_admin);
const prefix = computed(() => {
    const p = page.props.escalated?.prefix || 'support';
    return p.startsWith('/') ? p : `/${p}`;
});

const currentUrl = computed(() => page.url);
const isAdminSection = computed(() => currentUrl.value?.includes('/admin'));
const isAgentSection = computed(() => currentUrl.value?.includes('/agent'));

const adminLinks = computed(() => [
    { href: `${prefix.value}/admin/reports`, label: 'Reports', icon: 'chart' },
    { href: `${prefix.value}/admin/departments`, label: 'Departments', icon: 'grid' },
    { href: `${prefix.value}/admin/sla-policies`, label: 'SLA Policies', icon: 'clock' },
    { href: `${prefix.value}/admin/escalation-rules`, label: 'Escalation Rules', icon: 'arrow' },
    { href: `${prefix.value}/admin/tags`, label: 'Tags', icon: 'tag' },
    { href: `${prefix.value}/admin/canned-responses`, label: 'Canned Responses', icon: 'message' },
]);

const agentLinks = computed(() => [
    { href: `${prefix.value}/agent`, label: 'Dashboard' },
    { href: `${prefix.value}/agent/tickets`, label: 'Tickets' },
]);

const userName = computed(() => page.props.auth?.user?.name || 'User');
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

function isActive(href) {
    if (!currentUrl.value) return false;
    return currentUrl.value === href || currentUrl.value.startsWith(href + '/');
}
</script>

<template>
    <!-- MODE 1: Admin standalone — dark sidebar layout (always standalone, ignores host layout) -->
    <div v-if="isAdminSection" class="esc-root flex min-h-screen bg-gray-950">
        <!-- Sidebar -->
        <aside class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-gray-900">
            <!-- Logo -->
            <div class="flex h-16 items-center gap-3 px-6">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 via-cyan-500 to-violet-500">
                    <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                </div>
                <span class="text-lg font-bold text-white">Escalated</span>
                <span class="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">Admin</span>
            </div>

            <!-- Nav -->
            <nav class="mt-2 flex-1 space-y-1 px-3">
                <Link v-for="link in adminLinks" :key="link.href" :href="link.href"
                      :class="['group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                               isActive(link.href)
                                   ? 'bg-gradient-to-r from-orange-500/20 via-cyan-500/20 to-violet-500/20 text-white ring-1 ring-white/10'
                                   : 'text-gray-400 hover:bg-white/5 hover:text-white']">
                    {{ link.label }}
                </Link>
            </nav>

            <!-- Bottom -->
            <div class="border-t border-white/10 p-4">
                <Link v-if="isAgent" :href="`${prefix}/agent`"
                      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                    Agent Panel
                </Link>
                <Link :href="prefix"
                      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                    Back to App
                </Link>
            </div>
        </aside>

        <!-- Main content -->
        <div class="flex flex-1 flex-col pl-64">
            <!-- Top bar -->
            <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-gray-900/80 px-6 backdrop-blur-xl">
                <h1 class="text-lg font-semibold text-white">{{ title }}</h1>
                <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-xs font-bold text-white">
                        {{ userInitial }}
                    </div>
                    <span class="text-sm text-gray-300">{{ userName }}</span>
                </div>
            </header>

            <!-- Page content -->
            <main class="flex-1 p-4">
                <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5">
                    <slot />
                </div>
            </main>
        </div>
    </div>

    <!-- MODE 2: Agent standalone — dark top-nav layout (always standalone, ignores host layout) -->
    <div v-else-if="isAgentSection" class="esc-root min-h-screen bg-gray-950">
        <!-- Top nav -->
        <nav class="sticky top-0 z-30 border-b border-white/10 bg-gray-900">
            <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <!-- Left: branding -->
                <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 via-cyan-500 to-violet-500">
                        <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                    </div>
                    <span class="text-lg font-bold text-white">Escalated</span>
                </div>

                <!-- Center: nav links -->
                <div class="flex items-center gap-1">
                    <Link v-for="link in agentLinks" :key="link.href" :href="link.href"
                          :class="['rounded-lg px-4 py-2 text-sm font-medium transition-all',
                                   isActive(link.href)
                                       ? 'bg-gradient-to-r from-orange-500/20 via-cyan-500/20 to-violet-500/20 text-white ring-1 ring-white/10'
                                       : 'text-gray-400 hover:bg-white/5 hover:text-white']">
                        {{ link.label }}
                    </Link>
                </div>

                <!-- Right: user + back -->
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-xs font-bold text-white">
                            {{ userInitial }}
                        </div>
                        <span class="text-sm text-gray-300">{{ userName }}</span>
                    </div>
                    <div class="h-5 w-px bg-white/10"></div>
                    <Link v-if="isAdmin" :href="`${prefix}/admin/reports`"
                          class="text-sm text-gray-400 transition-colors hover:text-white">
                        Admin
                    </Link>
                    <Link :href="prefix"
                          class="text-sm text-gray-400 transition-colors hover:text-white">
                        Back to App
                    </Link>
                </div>
            </div>
            <!-- Rainbow accent line -->
            <div class="h-px bg-gradient-to-r from-orange-500 via-cyan-500 to-violet-500"></div>
        </nav>

        <!-- Page content -->
        <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5">
                <slot />
            </div>
        </main>
    </div>

    <!-- MODE 3: Customer pages — use host app layout if provided -->
    <component :is="hostLayout" v-else-if="hostLayout">
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="esc-heading text-xl font-semibold leading-tight text-gray-800">{{ title }}</h2>
                <nav class="flex items-center gap-4 text-sm">
                    <Link :href="prefix" class="text-gray-600 hover:text-gray-900">My Tickets</Link>
                    <Link v-if="isAgent" :href="`${prefix}/agent`" class="text-gray-600 hover:text-gray-900">Agent Panel</Link>
                    <Link v-if="isAdmin" :href="`${prefix}/admin/reports`" class="text-gray-600 hover:text-gray-900">Admin</Link>
                </nav>
            </div>
        </template>

        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <slot />
        </div>
    </component>

    <!-- MODE 4: Customer standalone fallback (no host layout) -->
    <div v-else class="esc-root min-h-screen bg-gray-50">
        <nav class="border-b border-gray-200 bg-white">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="flex h-14 items-center justify-between">
                    <div class="flex items-center gap-6">
                        <span class="text-lg font-bold text-gray-900">{{ title }}</span>
                        <div class="flex items-center gap-4 text-sm">
                            <Link :href="prefix" class="text-gray-600 hover:text-gray-900">My Tickets</Link>
                            <Link v-if="isAgent" :href="`${prefix}/agent`" class="text-gray-600 hover:text-gray-900">Agent Panel</Link>
                            <Link v-if="isAdmin" :href="`${prefix}/admin/reports`" class="text-gray-600 hover:text-gray-900">Admin</Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
        <main class="flex-1">
            <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <slot />
            </div>
        </main>
    </div>
</template>
