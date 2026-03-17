<script setup>
import { computed, inject, provide } from 'vue';
import { usePage, Link } from '@inertiajs/vue3';
import { usePluginExtensions } from '../composables/usePluginExtensions';

const props = defineProps({
    title: { type: String, default: 'Support' },
});

const page = usePage();
const hostLayout = inject('escalated-layout', null);
const panelConfig = inject('escalated-panel', { appName: 'Escalated', logo: null, mode: 'dark' });

const isAgent = computed(() => page.props.escalated?.is_agent);
const isAdmin = computed(() => page.props.escalated?.is_admin);
const prefix = computed(() => {
    const p = page.props.escalated?.prefix || 'support';
    return p.startsWith('/') ? p : `/${p}`;
});

const currentUrl = computed(() => page.url);
const isAdminSection = computed(() => currentUrl.value?.includes('/admin'));
const isAgentSection = computed(() => currentUrl.value?.includes('/agent'));
const isPanel = computed(() => isAdminSection.value || isAgentSection.value);
const isDark = computed(() => isPanel.value && panelConfig.mode !== 'light');
const showPoweredBy = computed(() => page.props.escalated?.show_powered_by !== false);

provide('esc-dark', isDark);

const { menuItems: pluginMenuItems } = usePluginExtensions();

const adminLinks = computed(() => {
    const p = prefix.value;
    const coreLinks = [
        {
            href: `${p}/admin/reports`,
            label: 'Reports',
            icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
            position: 10,
        },
        {
            href: `${p}/admin/tickets`,
            label: 'Tickets',
            icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z',
            position: 20,
        },
        {
            href: `${p}/admin/departments`,
            label: 'Departments',
            icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z',
            position: 30,
        },
        {
            href: `${p}/admin/sla-policies`,
            label: 'SLA Policies',
            icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
            position: 40,
        },
        {
            href: `${p}/admin/knowledge-base/articles`,
            label: 'Knowledge Base',
            icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
            position: 45,
        },
        {
            href: `${p}/admin/escalation-rules`,
            label: 'Escalation Rules',
            icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12',
            position: 50,
        },
        {
            href: `${p}/admin/automations`,
            label: 'Automations',
            icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182',
            position: 52,
        },
        {
            href: `${p}/admin/webhooks`,
            label: 'Webhooks',
            icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
            position: 54,
        },
        {
            href: `${p}/admin/tags`,
            label: 'Tags',
            icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z',
            position: 60,
        },
        {
            href: `${p}/admin/custom-fields`,
            label: 'Custom Fields',
            icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z',
            position: 62,
        },
        {
            href: `${p}/admin/statuses`,
            label: 'Statuses',
            icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            position: 64,
        },
        {
            href: `${p}/admin/canned-responses`,
            label: 'Canned Responses',
            icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
            position: 70,
        },
        {
            href: `${p}/admin/macros`,
            label: 'Macros',
            icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
            position: 80,
        },
        {
            href: `${p}/admin/skills`,
            label: 'Skills',
            icon: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342',
            position: 82,
        },
        {
            href: `${p}/admin/roles`,
            label: 'Roles',
            icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
            position: 84,
        },
        {
            href: `${p}/admin/capacity`,
            label: 'Capacity',
            icon: 'M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5',
            position: 85,
        },
        {
            href: `${p}/admin/business-hours`,
            label: 'Business Hours',
            icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
            position: 86,
        },
        {
            href: `${p}/admin/audit-log`,
            label: 'Audit Log',
            icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
            position: 88,
        },
        {
            href: `${p}/admin/api-tokens`,
            label: 'API Tokens',
            icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z',
            position: 90,
        },
        {
            href: `${p}/admin/custom-objects`,
            label: 'Custom Objects',
            icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
            position: 92,
        },
        {
            href: `${p}/admin/plugins`,
            label: 'Plugins',
            icon: 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z',
            position: 95,
        },
        {
            href: `${p}/admin/import`,
            label: 'Import',
            icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5',
            position: 97,
        },
        {
            href: `${p}/admin/settings`,
            label: 'Settings',
            icon: 'M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.781.93l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
            position: 100,
        },
    ];

    // Merge core admin links with plugin-provided menu items
    const pluginLinks = pluginMenuItems.value.map((item) => ({
        href: item.route,
        label: item.label,
        icon: item.icon,
        position: item.position || 100,
        badge: item.badge || null,
        submenu: item.submenu || [],
    }));

    return [...coreLinks, ...pluginLinks].sort((a, b) => (a.position || 100) - (b.position || 100));
});

const agentLinks = computed(() => [
    {
        href: `${prefix.value}/agent`,
        label: 'Dashboard',
        icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
    },
    {
        href: `${prefix.value}/agent/tickets`,
        label: 'Tickets',
        icon: 'M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z',
    },
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
    <div
        v-if="isAdminSection"
        class="flex min-h-screen bg-[var(--esc-panel-bg)]"
        :style="{ colorScheme: panelConfig.mode === 'light' ? 'light' : 'dark' }"
    >
        <!-- Sidebar -->
        <aside
            class="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[var(--esc-panel-border)] bg-[var(--esc-panel-sidebar-bg)]"
        >
            <!-- Logo -->
            <div class="flex h-16 items-center gap-3 px-5">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--esc-panel-border-input)]">
                    <img v-if="typeof panelConfig.logo === 'string'" :src="panelConfig.logo" class="h-5 w-5" alt="" />
                    <component :is="panelConfig.logo" v-else-if="panelConfig.logo" class="h-5 w-5" />
                    <svg
                        v-else
                        class="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <defs>
                            <linearGradient id="esc-rainbow-admin" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#f97316" />
                                <stop offset="30%" stop-color="#eab308" />
                                <stop offset="50%" stop-color="#22c55e" />
                                <stop offset="70%" stop-color="#3b82f6" />
                                <stop offset="100%" stop-color="#8b5cf6" />
                            </linearGradient>
                        </defs>
                        <g transform="translate(12,12) scale(1.35) translate(-12,-12)">
                            <polyline points="17 11 12 6 7 11" stroke="url(#esc-rainbow-admin)" />
                            <polyline points="17 18 12 13 7 18" stroke="url(#esc-rainbow-admin)" />
                        </g>
                    </svg>
                </div>
                <div>
                    <span class="text-sm font-bold text-[var(--esc-panel-text)] tracking-wide">{{
                        panelConfig.appName
                    }}</span>
                    <span
                        class="ml-1.5 rounded bg-[var(--esc-panel-active)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--esc-panel-text-muted)]"
                        >ADMIN</span
                    >
                </div>
            </div>

            <!-- Nav -->
            <nav class="mt-1 flex-1 space-y-0.5 overflow-y-auto px-3">
                <Link
                    v-for="link in adminLinks"
                    :key="link.href"
                    :href="link.href"
                    :class="[
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all',
                        isActive(link.href)
                            ? 'bg-[var(--esc-panel-active)] text-[var(--esc-panel-text)]'
                            : 'text-[var(--esc-panel-text-muted)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]',
                    ]"
                >
                    <svg
                        :class="[
                            'h-[18px] w-[18px] shrink-0',
                            isActive(link.href)
                                ? 'text-[var(--esc-panel-text)]'
                                : 'text-[var(--esc-panel-text-muted)] group-hover:text-[var(--esc-panel-text-tertiary)]',
                        ]"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        viewBox="0 0 24 24"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
                    </svg>
                    {{ link.label }}
                    <span
                        v-if="link.badge"
                        class="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--esc-panel-accent)]/20 px-1.5 text-[10px] font-semibold text-[var(--esc-panel-accent)]"
                    >
                        {{ link.badge }}
                    </span>
                </Link>
            </nav>

            <!-- Bottom section -->
            <div class="border-t border-[var(--esc-panel-border)] p-3">
                <Link
                    v-if="isAgent"
                    :href="`${prefix}/agent`"
                    class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--esc-panel-text-muted)] transition-colors hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                        />
                    </svg>
                    Agent Panel
                </Link>
                <Link
                    :href="prefix"
                    class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-[var(--esc-panel-text-muted)] transition-colors hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]"
                >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                        />
                    </svg>
                    Back to App
                </Link>

                <!-- User -->
                <div class="mt-2 flex items-center gap-3 rounded-lg bg-[var(--esc-panel-hover)] px-3 py-2.5">
                    <div
                        class="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--esc-panel-active)] text-xs font-semibold text-[var(--esc-panel-text-tertiary)]"
                    >
                        {{ userInitial }}
                    </div>
                    <span class="text-sm text-[var(--esc-panel-text-tertiary)]">{{ userName }}</span>
                </div>
            </div>

            <!-- Powered by -->
            <div v-if="showPoweredBy" class="px-4 pb-3">
                <a
                    href="https://escalated.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-[var(--esc-panel-text-muted)] opacity-60 transition-opacity hover:opacity-100"
                >
                    <img
                        :src="
                            isDark
                                ? 'https://escalated.dev/brand/logo-icon-dark.svg'
                                : 'https://escalated.dev/brand/logo-icon-white.svg'
                        "
                        alt=""
                        class="h-3.5 w-3.5"
                    />
                    Powered by Escalated
                </a>
            </div>
        </aside>

        <!-- Main content -->
        <div class="flex flex-1 flex-col pl-64">
            <!-- Top bar -->
            <header
                class="sticky top-0 z-20 flex h-14 items-center border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-topbar-bg)] px-6 backdrop-blur-xl"
            >
                <h1 class="text-sm font-semibold text-[var(--esc-panel-text)]">{{ title }}</h1>
            </header>

            <!-- Page content -->
            <main class="flex-1 p-6">
                <slot />
            </main>
        </div>
    </div>

    <!-- MODE 2: Agent — dark top-nav layout -->
    <div
        v-else-if="isAgentSection"
        class="min-h-screen bg-[var(--esc-panel-bg)]"
        :style="{ colorScheme: panelConfig.mode === 'light' ? 'light' : 'dark' }"
    >
        <!-- Top nav -->
        <nav
            class="sticky top-0 z-30 border-b border-[var(--esc-panel-border)] bg-[var(--esc-panel-sidebar-bg)] backdrop-blur-xl"
        >
            <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <!-- Left: branding -->
                <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--esc-panel-border-input)]">
                        <img
                            v-if="typeof panelConfig.logo === 'string'"
                            :src="panelConfig.logo"
                            class="h-4 w-4"
                            alt=""
                        />
                        <component :is="panelConfig.logo" v-else-if="panelConfig.logo" class="h-4 w-4" />
                        <svg
                            v-else
                            class="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <defs>
                                <linearGradient id="esc-rainbow-agent" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#f97316" />
                                    <stop offset="30%" stop-color="#eab308" />
                                    <stop offset="50%" stop-color="#22c55e" />
                                    <stop offset="70%" stop-color="#3b82f6" />
                                    <stop offset="100%" stop-color="#8b5cf6" />
                                </linearGradient>
                            </defs>
                            <g transform="translate(12,12) scale(1.35) translate(-12,-12)">
                                <polyline points="17 11 12 6 7 11" stroke="url(#esc-rainbow-agent)" />
                                <polyline points="17 18 12 13 7 18" stroke="url(#esc-rainbow-agent)" />
                            </g>
                        </svg>
                    </div>
                    <span class="text-sm font-bold text-[var(--esc-panel-text)] tracking-wide">{{
                        panelConfig.appName
                    }}</span>
                </div>

                <!-- Center: nav links -->
                <div class="flex items-center gap-1">
                    <Link
                        v-for="link in agentLinks"
                        :key="link.href"
                        :href="link.href"
                        :class="[
                            'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all',
                            isActive(link.href)
                                ? 'bg-[var(--esc-panel-active)] text-[var(--esc-panel-text)]'
                                : 'text-[var(--esc-panel-text-muted)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]',
                        ]"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
                        </svg>
                        {{ link.label }}
                    </Link>
                </div>

                <!-- Right: user + links -->
                <div class="flex items-center gap-3">
                    <Link
                        v-if="isAdmin"
                        :href="`${prefix}/admin/reports`"
                        class="text-[13px] text-[var(--esc-panel-text-muted)] transition-colors hover:text-[var(--esc-panel-text)]"
                    >
                        Admin
                    </Link>
                    <Link
                        :href="prefix"
                        class="text-[13px] text-[var(--esc-panel-text-muted)] transition-colors hover:text-[var(--esc-panel-text)]"
                    >
                        Back to App
                    </Link>
                    <div class="ml-1 h-5 w-px bg-[var(--esc-panel-active)]"></div>
                    <div class="flex items-center gap-2">
                        <div
                            class="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--esc-panel-active)] text-[10px] font-semibold text-[var(--esc-panel-text-tertiary)]"
                        >
                            {{ userInitial }}
                        </div>
                        <span class="text-[13px] text-[var(--esc-panel-text-tertiary)]">{{ userName }}</span>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Page content -->
        <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <slot />
        </main>

        <!-- Powered by -->
        <footer v-if="showPoweredBy" class="border-t border-[var(--esc-panel-border)] py-3 text-center">
            <a
                href="https://escalated.dev"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-[11px] text-[var(--esc-panel-text-muted)] opacity-60 transition-opacity hover:opacity-100"
            >
                <img
                    :src="
                        isDark
                            ? 'https://escalated.dev/brand/logo-icon-dark.svg'
                            : 'https://escalated.dev/brand/logo-icon-white.svg'
                    "
                    alt=""
                    class="h-3.5 w-3.5"
                />
                Powered by Escalated
            </a>
        </footer>
    </div>

    <!-- MODE 3: Customer pages — use host app layout if provided -->
    <component :is="hostLayout" v-else-if="hostLayout">
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold leading-tight text-gray-800">{{ title }}</h2>
                <nav class="flex items-center gap-4 text-sm">
                    <Link :href="prefix" class="text-gray-600 hover:text-gray-900">My Tickets</Link>
                    <Link v-if="isAgent" :href="`${prefix}/agent`" class="text-gray-600 hover:text-gray-900">
                        Agent Panel
                    </Link>
                    <Link v-if="isAdmin" :href="`${prefix}/admin/reports`" class="text-gray-600 hover:text-gray-900">
                        Admin
                    </Link>
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
                            <Link v-if="isAgent" :href="`${prefix}/agent`" class="text-gray-600 hover:text-gray-900">
                                Agent Panel
                            </Link>
                            <Link
                                v-if="isAdmin"
                                :href="`${prefix}/admin/reports`"
                                class="text-gray-600 hover:text-gray-900"
                            >
                                Admin
                            </Link>
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

        <!-- Powered by -->
        <footer v-if="showPoweredBy" class="border-t border-gray-200 py-3 text-center">
            <a
                href="https://escalated.dev"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-[11px] text-gray-400 transition-colors hover:text-gray-600"
            >
                <img src="https://escalated.dev/brand/logo-icon-white.svg" alt="" class="h-3.5 w-3.5" />
                Powered by Escalated
            </a>
        </footer>
    </div>
</template>
