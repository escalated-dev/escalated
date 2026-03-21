<script setup>
import { ref, inject, computed } from 'vue';

const props = defineProps({
    title: { type: String, required: true },
    icon: { type: String, default: '' },
    defaultOpen: { type: Boolean, default: true },
});

const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const isOpen = ref(props.defaultOpen);
</script>

<template>
    <div :class="['border-b last:border-b-0', escDark ? 'border-white/[0.06]' : 'border-gray-200']">
        <button
            type="button"
            :aria-expanded="isOpen"
            :class="[
                'flex w-full items-center gap-2 px-4 py-3 text-left transition-colors',
                escDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50',
            ]"
            @click="isOpen = !isOpen"
        >
            <svg
                v-if="icon"
                :class="['h-4 w-4 shrink-0', escDark ? 'text-neutral-500' : 'text-gray-400']"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
            </svg>
            <span
                :class="[
                    'flex-1 text-xs font-semibold uppercase tracking-wider',
                    escDark ? 'text-neutral-400' : 'text-gray-500',
                ]"
            >
                {{ title }}
            </span>
            <svg
                :class="[
                    'h-4 w-4 transition-transform',
                    escDark ? 'text-neutral-600' : 'text-gray-400',
                    isOpen ? 'rotate-180' : '',
                ]"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </button>
        <div v-show="isOpen" class="px-4 pb-4">
            <slot />
        </div>
    </div>
</template>
