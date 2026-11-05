<script setup>
import { Link } from '@inertiajs/vue3';
import { useEscalatedNavigation } from '../composables/useEscalatedNavigation';
import { navIconPath } from '../utils/adminNavIcons';
import PluginBadge from './PluginBadge.vue';

/**
 * Escalated's admin menu as a list of links, for a host's own sidebar
 * (ADR 2026-11-05-embeddable-admin). It reads `escalated.navigation`, so it
 * renders nothing on a backend that does not share it.
 *
 *     <EscalatedNavigation />
 *     <EscalatedNavigation link-class="..." active-class="..." />
 *     <EscalatedNavigation v-slot="{ item }">{{ item.label }}</EscalatedNavigation>
 *
 * Styling is deliberately light (the panel tokens with fallbacks); pass
 * classes or use the slot to match the host.
 */
defineProps({
    label: { type: String, default: 'Support administration' },
    showIcons: { type: Boolean, default: true },
    linkClass: { type: String, default: '' },
    activeClass: { type: String, default: '' },
});

const { items } = useEscalatedNavigation();
</script>

<template>
    <nav v-if="items.length" :aria-label="label" data-testid="esc-navigation">
        <ul class="space-y-0.5">
            <li v-for="item in items" :key="item.key">
                <Link
                    :href="item.url"
                    :aria-current="item.active ? 'page' : undefined"
                    :data-esc-nav-key="item.key"
                    :class="[
                        linkClass ||
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                        item.active
                            ? activeClass ||
                              'bg-[var(--esc-panel-active,#eff6ff)] text-[var(--esc-panel-active-text,var(--esc-panel-text,#111827))]'
                            : linkClass
                              ? ''
                              : 'text-[var(--esc-panel-text-muted,#6b7280)] hover:bg-[var(--esc-panel-hover,rgba(0,0,0,0.04))] hover:text-[var(--esc-panel-text,#111827)]',
                    ]"
                >
                    <slot :item="item">
                        <svg
                            v-if="showIcons && navIconPath(item.icon)"
                            class="h-[18px] w-[18px] shrink-0"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.5"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" :d="navIconPath(item.icon)" />
                        </svg>
                        <span class="truncate">{{ item.label }}</span>
                        <PluginBadge :value="item.badge" />
                    </slot>
                </Link>
            </li>
        </ul>
    </nav>
</template>
