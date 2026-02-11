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
    { href: `${prefix.value}/admin/tickets`, label: 'Tickets', icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z' },
    { href: `${prefix.value}/admin/departments`, label: 'Departments', icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z' },
    { href: `${prefix.value}/admin/sla-policies`, label: 'SLA Policies', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { href: `${prefix.value}/admin/escalation-rules`, label: 'Escalation Rules', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12' },
    { href: `${prefix.value}/admin/tags`, label: 'Tags', icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z' },
    { href: `${prefix.value}/admin/canned-responses`, label: 'Canned Responses', icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z' },
    { href: `${prefix.value}/admin/macros`, label: 'Macros', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
    { href: `${prefix.value}/admin/plugins`, label: 'Plugins', icon: 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S10.5 3.089 10.5 4.125c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z' },
    { href: `${prefix.value}/admin/settings`, label: 'Settings', icon: 'M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.781.93l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
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
    <div v-if="isAdminSection" class="flex min-h-screen bg-black" style="color-scheme: dark">
        <!-- Sidebar -->
        <aside class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/[0.06] bg-neutral-950">
            <!-- Logo -->
            <div class="flex h-16 items-center gap-3 px-5">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <defs><linearGradient id="esc-rainbow-admin" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f97316"/><stop offset="30%" stop-color="#eab308"/><stop offset="50%" stop-color="#22c55e"/><stop offset="70%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
                        <g transform="translate(12,12) scale(1.35) translate(-12,-12)"><polyline points="17 11 12 6 7 11" stroke="url(#esc-rainbow-admin)"/><polyline points="17 18 12 13 7 18" stroke="url(#esc-rainbow-admin)"/></g>
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
    <div v-else-if="isAgentSection" class="min-h-screen bg-black" style="color-scheme: dark">
        <!-- Top nav -->
        <nav class="sticky top-0 z-30 border-b border-white/[0.06] bg-neutral-950/95 backdrop-blur-xl">
            <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <!-- Left: branding -->
                <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <defs><linearGradient id="esc-rainbow-agent" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f97316"/><stop offset="30%" stop-color="#eab308"/><stop offset="50%" stop-color="#22c55e"/><stop offset="70%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
                            <g transform="translate(12,12) scale(1.35) translate(-12,-12)"><polyline points="17 11 12 6 7 11" stroke="url(#esc-rainbow-agent)"/><polyline points="17 18 12 13 7 18" stroke="url(#esc-rainbow-agent)"/></g>
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
