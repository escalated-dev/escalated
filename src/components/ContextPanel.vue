<script setup>
import { inject, computed } from 'vue';

defineProps({
    visible: { type: Boolean, default: false },
});

const emit = defineEmits(['update:visible']);

const escDark = inject(
    'esc-dark',
    computed(() => false),
);

function close() {
    emit('update:visible', false);
}
</script>

<template>
    <transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
    >
        <div
            v-if="visible"
            :class="[
                'fixed inset-y-0 right-0 z-40 w-80 overflow-y-auto border-l shadow-2xl backdrop-blur-sm lg:static lg:block lg:overflow-visible lg:shadow-none',
                escDark ? 'border-white/[0.06] bg-neutral-900/95' : 'border-gray-200 bg-white',
            ]"
        >
            <!-- Header -->
            <div
                :class="[
                    'flex items-center justify-between border-b px-4 py-3',
                    escDark ? 'border-white/[0.06]' : 'border-gray-200',
                ]"
            >
                <h3 :class="['text-sm font-semibold', escDark ? 'text-neutral-200' : 'text-gray-900']">Context</h3>
                <button
                    type="button"
                    :class="[
                        'rounded p-1 lg:hidden',
                        escDark
                            ? 'text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600',
                    ]"
                    @click="close"
                >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Sections -->
            <div>
                <slot />
            </div>
        </div>
    </transition>
</template>
