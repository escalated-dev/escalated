<script setup>
import { inject, computed, ref } from 'vue';
import { router, useForm } from '@inertiajs/vue3';

const props = defineProps({
    ticket: { type: Object, required: true },
    routePrefix: { type: String, default: 'escalated.admin' },
});

const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const showMenu = ref(false);
const showCustom = ref(false);
const customDatetime = ref('');

const snoozeForm = useForm({ snoozed_until: '' });

function snoozeUntil(datetime) {
    snoozeForm.snoozed_until = datetime;
    snoozeForm.post(route(`${props.routePrefix}.tickets.snooze`, props.ticket.reference), {
        preserveScroll: true,
        onSuccess: () => {
            showMenu.value = false;
            showCustom.value = false;
        },
    });
}

function snoozePreset(hours) {
    const dt = new Date(Date.now() + hours * 3600 * 1000);
    snoozeUntil(dt.toISOString());
}

function snoozeTomorrow9am() {
    const dt = new Date();
    dt.setDate(dt.getDate() + 1);
    dt.setHours(9, 0, 0, 0);
    snoozeUntil(dt.toISOString());
}

function snoozeNextMonday9am() {
    const dt = new Date();
    const day = dt.getDay();
    const daysUntilMonday = day === 0 ? 1 : 8 - day;
    dt.setDate(dt.getDate() + daysUntilMonday);
    dt.setHours(9, 0, 0, 0);
    snoozeUntil(dt.toISOString());
}

function snoozeCustom() {
    if (customDatetime.value) {
        snoozeUntil(new Date(customDatetime.value).toISOString());
    }
}

function unsnooze() {
    router.post(route(`${props.routePrefix}.tickets.unsnooze`, props.ticket.reference), {}, { preserveScroll: true });
}

function formatSnoozedUntil(dateStr) {
    if (!dateStr) return '';
    const dt = new Date(dateStr);
    return dt.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

// Close menu on outside click
function onClickOutside(e) {
    if (!e.target.closest('[data-snooze-menu]')) {
        showMenu.value = false;
        showCustom.value = false;
    }
}

import { watch } from 'vue';
watch(showMenu, (val) => {
    if (val) {
        document.addEventListener('click', onClickOutside, true);
    } else {
        document.removeEventListener('click', onClickOutside, true);
    }
});
</script>

<template>
    <!-- Snoozed banner -->
    <div
        v-if="ticket.is_snoozed || (ticket.snoozed_until && new Date(ticket.snoozed_until) > new Date())"
        :class="[
            'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium',
            escDark
                ? 'border border-amber-500/20 bg-amber-500/10 text-amber-300'
                : 'border border-amber-200 bg-amber-50 text-amber-800',
        ]"
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z"
                clip-rule="evenodd"
            />
        </svg>
        <span>Snoozed until {{ formatSnoozedUntil(ticket.snoozed_until) }}</span>
        <button
            :class="[
                'ml-auto rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                escDark
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-amber-200 text-amber-900 hover:bg-amber-300',
            ]"
            @click="unsnooze"
        >
            Unsnooze
        </button>
    </div>

    <!-- Snooze button with dropdown -->
    <div
        v-if="!ticket.is_snoozed && !(ticket.snoozed_until && new Date(ticket.snoozed_until) > new Date())"
        class="relative"
        data-snooze-menu
    >
        <button
            :class="[
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                escDark
                    ? 'border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-surface)]'
                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            ]"
            @click.stop="showMenu = !showMenu"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.828a1 1 0 101.415-1.414L11 9.586V6z"
                    clip-rule="evenodd"
                />
            </svg>
            Snooze
        </button>
        <div
            v-if="showMenu"
            :class="[
                'absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border py-1 shadow-xl',
                escDark ? 'border-white/[0.08] bg-neutral-800' : 'border-gray-200 bg-white',
            ]"
        >
            <button
                v-if="!showCustom"
                :class="[
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                    escDark ? 'text-neutral-300 hover:bg-white/[0.06]' : 'text-gray-700 hover:bg-gray-50',
                ]"
                @click="snoozePreset(1)"
            >
                1 hour
            </button>
            <button
                v-if="!showCustom"
                :class="[
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                    escDark ? 'text-neutral-300 hover:bg-white/[0.06]' : 'text-gray-700 hover:bg-gray-50',
                ]"
                @click="snoozePreset(4)"
            >
                4 hours
            </button>
            <button
                v-if="!showCustom"
                :class="[
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                    escDark ? 'text-neutral-300 hover:bg-white/[0.06]' : 'text-gray-700 hover:bg-gray-50',
                ]"
                @click="snoozeTomorrow9am"
            >
                Tomorrow 9am
            </button>
            <button
                v-if="!showCustom"
                :class="[
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                    escDark ? 'text-neutral-300 hover:bg-white/[0.06]' : 'text-gray-700 hover:bg-gray-50',
                ]"
                @click="snoozeNextMonday9am"
            >
                Next Monday 9am
            </button>
            <div
                v-if="!showCustom"
                :class="['my-1 border-t', escDark ? 'border-white/[0.06]' : 'border-gray-100']"
            ></div>
            <button
                v-if="!showCustom"
                :class="[
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                    escDark ? 'text-neutral-300 hover:bg-white/[0.06]' : 'text-gray-700 hover:bg-gray-50',
                ]"
                @click.stop="showCustom = true"
            >
                Custom date/time...
            </button>
            <div v-if="showCustom" class="px-3 py-2 space-y-2">
                <input
                    v-model="customDatetime"
                    type="datetime-local"
                    :class="[
                        'w-full rounded-md border px-2 py-1.5 text-sm',
                        escDark
                            ? 'border-white/10 bg-neutral-900 text-neutral-200'
                            : 'border-gray-300 bg-white text-gray-900',
                    ]"
                />
                <div class="flex gap-2">
                    <button
                        :class="[
                            'flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                            escDark
                                ? 'bg-white/[0.06] text-neutral-300 hover:bg-white/[0.1]'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                        ]"
                        @click.stop="showCustom = false"
                    >
                        Back
                    </button>
                    <button
                        :class="[
                            'flex-1 rounded-md px-2 py-1 text-xs font-medium text-white transition-colors',
                            escDark ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-indigo-600 hover:bg-indigo-500',
                        ]"
                        :disabled="!customDatetime"
                        @click="snoozeCustom"
                    >
                        Snooze
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
