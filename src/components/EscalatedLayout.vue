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
</script>

<template>
    <component :is="hostLayout" v-if="hostLayout">
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

    <!-- Fallback: standalone layout when no host layout is provided -->
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
        <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <slot />
        </main>
    </div>
</template>
