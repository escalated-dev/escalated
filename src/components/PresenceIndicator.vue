<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    ticketReference: { type: String, required: true },
    routePrefix: { type: String, required: true },
    pollInterval: { type: Number, default: 30000 },
    showLabel: { type: Boolean, default: false },
});

const effectiveInterval = computed(() => Math.max(props.pollInterval, 5000));

const escDark = inject(
    'esc-dark',
    computed(() => false),
);
const viewers = ref([]);
const hovering = ref(false);
let intervalId = null;

async function fetchPresence() {
    try {
        const response = await fetch(route(`${props.routePrefix}.tickets.presence`, props.ticketReference), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
        });
        if (response.ok) {
            const data = await response.json();
            viewers.value = data.viewers || data || [];
        }
    } catch {
        // silently ignore network errors
    }
}

const tooltipText = computed(() => {
    if (!viewers.value.length) return '';
    const names = viewers.value.map((v) => v.name);
    return 'Also viewing: ' + names.join(', ');
});

const maxVisible = 4;
const visibleViewers = computed(() => viewers.value.slice(0, maxVisible));
const overflowCount = computed(() => Math.max(0, viewers.value.length - maxVisible));

function getInitial(viewer) {
    return (viewer.name || '?').charAt(0).toUpperCase();
}

const colors = [
    'bg-cyan-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-rose-500',
    'bg-blue-500',
    'bg-pink-500',
    'bg-teal-500',
];

function getColor(index) {
    return colors[index % colors.length];
}

onMounted(() => {
    fetchPresence();
    intervalId = setInterval(fetchPresence, effectiveInterval.value);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
});
</script>

<template>
    <div
        v-if="viewers.length > 0"
        class="relative flex items-center"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
    >
        <!-- Avatar stack -->
        <TransitionGroup
            tag="div"
            class="flex -space-x-2"
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-75 -ml-7"
            enter-to-class="opacity-100 scale-100 ml-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-75 -ml-7"
        >
            <div
                v-for="(viewer, index) in visibleViewers"
                :key="viewer.id || viewer.name"
                :aria-label="viewer.name"
                :class="[
                    'relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ring-2',
                    getColor(index),
                    escDark ? 'ring-neutral-900' : 'ring-white',
                ]"
            >
                {{ getInitial(viewer) }}
                <!-- Pulsing live indicator on first avatar -->
                <span v-if="index === 0" class="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                    <span
                        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
                    ></span>
                    <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
            </div>
            <div
                v-if="overflowCount > 0"
                :key="'overflow'"
                :class="[
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-2',
                    escDark
                        ? 'bg-white/[0.08] text-neutral-300 ring-neutral-900'
                        : 'bg-gray-200 text-gray-600 ring-white',
                ]"
            >
                +{{ overflowCount }}
            </div>
        </TransitionGroup>

        <!-- Viewer count label -->
        <span
            v-if="showLabel"
            aria-live="polite"
            :class="['ml-2 text-xs font-medium', escDark ? 'text-neutral-400' : 'text-gray-500']"
        >
            {{ viewers.length }} viewing
        </span>

        <!-- Tooltip -->
        <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
        >
            <div
                v-if="hovering"
                :class="[
                    'absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg',
                    escDark ? 'border border-white/[0.06] bg-neutral-800 text-neutral-200' : 'bg-gray-900 text-white',
                ]"
            >
                {{ tooltipText }}
                <div
                    :class="[
                        'absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45',
                        escDark ? 'bg-neutral-800' : 'bg-gray-900',
                    ]"
                ></div>
            </div>
        </Transition>
    </div>
</template>
