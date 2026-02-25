<script setup>
import { ref } from 'vue';

const props = defineProps({
    title: { type: String, required: true },
    icon: { type: String, default: '' },
    defaultOpen: { type: Boolean, default: true },
});

const isOpen = ref(props.defaultOpen);
</script>

<template>
    <div class="border-b border-white/[0.06] last:border-b-0">
        <button
            type="button"
            class="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
            @click="isOpen = !isOpen"
        >
            <svg
                v-if="icon"
                class="h-4 w-4 shrink-0 text-neutral-500"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
            </svg>
            <span class="flex-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {{ title }}
            </span>
            <svg
                :class="['h-4 w-4 text-neutral-600 transition-transform', isOpen ? 'rotate-180' : '']"
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
