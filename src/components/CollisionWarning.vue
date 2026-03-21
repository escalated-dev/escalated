<script setup>
import { inject, computed } from 'vue';

defineProps({
    typers: { type: Array, default: () => [] },
});

const escDark = inject(
    'esc-dark',
    computed(() => false),
);

function typersText(typers) {
    const names = typers.map((t) => t.name);
    if (names.length === 1) return `${names[0]} is typing a reply...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing replies...`;
    return `${names[0]} and ${names.length - 1} others are typing replies...`;
}
</script>

<template>
    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
    >
        <div
            v-if="typers.length > 0"
            role="alert"
            aria-live="assertive"
            :class="[
                'flex items-center gap-2 rounded-lg px-3 py-2 ring-1',
                escDark ? 'bg-amber-500/10 ring-amber-500/20' : 'bg-amber-50 ring-amber-200',
            ]"
        >
            <!-- Pulsing indicator -->
            <span class="relative flex h-2.5 w-2.5">
                <span
                    class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"
                ></span>
                <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            </span>

            <!-- Avatars -->
            <div class="flex -space-x-1.5">
                <div
                    v-for="typer in typers.slice(0, 3)"
                    :key="typer.name"
                    :class="[
                        'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ring-1',
                        escDark
                            ? 'bg-amber-500/30 text-amber-300 ring-amber-500/40'
                            : 'bg-amber-100 text-amber-700 ring-amber-300',
                    ]"
                >
                    {{ (typer.name || '?').charAt(0).toUpperCase() }}
                </div>
            </div>

            <span :class="['text-xs font-medium', escDark ? 'text-amber-400' : 'text-amber-700']">
                {{ typersText(typers) }}
            </span>
        </div>
    </Transition>
</template>
