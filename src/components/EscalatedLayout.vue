<script setup>
import { computed, inject, provide } from 'vue';
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
const isDark = computed(() => isAdminSection.value || isAgentSection.value);

provide('esc-dark', isDark);

const adminLinks = computed(() => [
    { href: `${prefix.value}/admin/reports`, label: 'Reports', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
    { href: `${prefix.value}/admin/departments`, label: 'Departments', icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z' },
    { href: `${prefix.value}/admin/sla-policies`, label: 'SLA Policies', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { href: `${prefix.value}/admin/escalation-rules`, label: 'Escalation Rules', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12' },
    { href: `${prefix.value}/admin/tags`, label: 'Tags', icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z' },
    { href: `${prefix.value}/admin/canned-responses`, label: 'Canned Responses', icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z' },
]);

const agentLinks = computed(() => [
    { href: `${prefix.value}/agent`, label: 'Dashboard', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25' },
    { href: `${prefix.value}/agent/tickets`, label: 'Tickets', icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z' },
]);

const userName = computed(() => page.props.auth?.user?.name || 'User');
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

function isActive(href) {
    if (!currentUrl.value) return false;
    return currentUrl.value === href || currentUrl.value.startsWith(href + '/');
}
</script>

<template>
    <!-- MODE 1: Admin — dark sidebar layout -->
    <div v-if="isAdminSection" class="flex min-h-screen bg-black">
        <!-- Sidebar -->
        <aside class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/[0.06] bg-neutral-950">
            <!-- Logo -->
            <div class="flex h-16 items-center gap-3 px-5">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-cyan-500 to-violet-500">
                    <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                </div>
                <div>
                    <span class="text-sm font-bold text-white tracking-wide">Escalated</span>
                    <span class="ml-1.5 rounded bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500">ADMIN</span>
                </div>
            </div>

            <!-- Nav -->
            <nav class="mt-1 flex-1 space-y-0.5 overflow-y-auto px-3">
                <Link v-for="link in adminLinks" :key="link.href" :href="link.href"
                      :class="['group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all',
                               isActive(link.href)
                                   ? 'bg-white/[0.08] text-white'
                                   : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300']">
                    <svg :class="['h-[18px] w-[18px] shrink-0', isActive(link.href) ? 'text-white' : 'text-neutral-600 group-hover:text-neutral-400']"
                         fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
                    </svg>
                    {{ link.label }}
                </Link>
            </nav>

            <!-- Bottom section -->
            <div class="border-t border-white/[0.06] p-3">
                <Link v-if="isAgent" :href="`${prefix}/agent`"
                      class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-neutral-500 transition-colors hover:bg-white/[0.04] hover:text-neutral-300">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                    Agent Panel
                </Link>
                <Link :href="prefix"
                      class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-neutral-500 transition-colors hover:bg-white/[0.04] hover:text-neutral-300">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                    Back to App
                </Link>

                <!-- User -->
                <div class="mt-2 flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2.5">
                    <div class="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.08] text-xs font-semibold text-neutral-400">
                        {{ userInitial }}
                    </div>
                    <span class="text-sm text-neutral-400">{{ userName }}</span>
                </div>
            </div>
        </aside>

        <!-- Main content -->
        <div class="flex flex-1 flex-col pl-64">
            <!-- Top bar -->
            <header class="sticky top-0 z-20 flex h-14 items-center border-b border-white/[0.06] bg-black/80 px-6 backdrop-blur-xl">
                <h1 class="text-sm font-semibold text-white">{{ title }}</h1>
            </header>

            <!-- Page content -->
            <main class="flex-1 p-6">
                <slot />
            </main>
        </div>
    </div>

    <!-- MODE 2: Agent — dark top-nav layout -->
    <div v-else-if="isAgentSection" class="min-h-screen bg-black">
        <!-- Top nav -->
        <nav class="sticky top-0 z-30 border-b border-white/[0.06] bg-neutral-950/95 backdrop-blur-xl">
            <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <!-- Left: branding -->
                <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 via-cyan-500 to-violet-500">
                        <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                    </div>
                    <span class="text-sm font-bold text-white tracking-wide">Escalated</span>
                </div>

                <!-- Center: nav links -->
                <div class="flex items-center gap-1">
                    <Link v-for="link in agentLinks" :key="link.href" :href="link.href"
                          :class="['flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all',
                                   isActive(link.href)
                                       ? 'bg-white/[0.08] text-white'
                                       : 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300']">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
                        </svg>
                        {{ link.label }}
                    </Link>
                </div>

                <!-- Right: user + links -->
                <div class="flex items-center gap-3">
                    <Link v-if="isAdmin" :href="`${prefix}/admin/reports`"
                          class="text-[13px] text-neutral-500 transition-colors hover:text-white">
                        Admin
                    </Link>
                    <Link :href="prefix"
                          class="text-[13px] text-neutral-500 transition-colors hover:text-white">
                        Back to App
                    </Link>
                    <div class="ml-1 h-5 w-px bg-white/[0.08]"></div>
                    <div class="flex items-center gap-2">
                        <div class="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.08] text-[10px] font-semibold text-neutral-400">
                            {{ userInitial }}
                        </div>
                        <span class="text-[13px] text-neutral-400">{{ userName }}</span>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Page content -->
        <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <slot />
        </main>
    </div>

    <!-- MODE 3: Customer pages — use host app layout if provided -->
    <component :is="hostLayout" v-else-if="hostLayout">
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold leading-tight text-gray-800">{{ title }}</h2>
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
    <div v-else class="min-h-screen bg-gray-50">
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
