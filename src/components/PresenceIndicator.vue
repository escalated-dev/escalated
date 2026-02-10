<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    ticketReference: { type: String, required: true },
    routePrefix: { type: String, required: true },
});

const escDark = inject('esc-dark', computed(() => false));
const viewers = ref([]);
const hovering = ref(false);
let intervalId = null;

async function fetchPresence() {
    try {
        const response = await fetch(route(`${props.routePrefix}.tickets.presence`, props.ticketReference), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
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
    const names = viewers.value.map(v => v.name);
    return 'Also viewing: ' + names.join(', ');
});

const maxVisible = 4;
const visibleViewers = computed(() => viewers.value.slice(0, maxVisible));
const overflowCount = computed(() => Math.max(0, viewers.value.length - maxVisible));

function getInitial(viewer) {
    return (viewer.name || '?').charAt(0).toUpperCase();
}

const colors = [
    'bg-cyan-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-blue-500', 'bg-pink-500', 'bg-teal-500',
];

function getColor(index) {
    return colors[index % colors.length];
}

onMounted(() => {
    fetchPresence();
    intervalId = setInterval(fetchPresence, 30000);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
});
</script>

<template>
    <div v-if="viewers.length > 0" class="relative" @mouseenter="hovering = true" @mouseleave="hovering = false">
        <!-- Avatar stack -->
        <div class="flex -space-x-2">
            <div v-for="(viewer, index) in visibleViewers" :key="viewer.id || index"
                 :class="['flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ring-2',
                          getColor(index),
                          escDark ? 'ring-neutral-900' : 'ring-white']">
                {{ getInitial(viewer) }}
            </div>
            <div v-if="overflowCount > 0"
                 :class="['flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-2',
                          escDark
                              ? 'bg-white/[0.08] text-neutral-300 ring-neutral-900'
                              : 'bg-gray-200 text-gray-600 ring-white']">
                +{{ overflowCount }}
            </div>
        </div>

        <!-- Tooltip -->
        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition duration-75 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
            <div v-if="hovering"
                 :class="['absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg',
                          escDark
                              ? 'border border-white/[0.06] bg-neutral-800 text-neutral-200'
                              : 'bg-gray-900 text-white']">
                {{ tooltipText }}
                <div :class="['absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45',
                              escDark ? 'bg-neutral-800' : 'bg-gray-900']"></div>
            </div>
        </Transition>
    </div>
</template>
