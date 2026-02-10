<script setup>
import { ref, computed, inject } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    macros: { type: Array, default: () => [] },
    action: { type: String, required: true },
});

const escDark = inject('esc-dark', computed(() => false));
const open = ref(false);
const processing = ref(false);

function applyMacro(macroId) {
    if (processing.value) return;
    processing.value = true;
    router.post(props.action, { macro_id: macroId }, {
        preserveScroll: true,
        onFinish: () => {
            processing.value = false;
            open.value = false;
        },
    });
}

function toggle() {
    open.value = !open.value;
}

function close() {
    open.value = false;
}
</script>

<template>
    <div class="relative">
        <!-- Trigger button -->
        <button @click="toggle"
                :class="['inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                         escDark
                             ? 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'
                             : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50']"
                :disabled="processing">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Apply Macro
            <svg :class="['h-4 w-4 transition-transform', open && 'rotate-180']" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </button>

        <!-- Backdrop -->
        <div v-if="open" class="fixed inset-0 z-30" @click="close"></div>

        <!-- Dropdown -->
        <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="scale-95 opacity-0" enter-to-class="scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in" leave-from-class="scale-100 opacity-100" leave-to-class="scale-95 opacity-0">
            <div v-if="open"
                 :class="['absolute right-0 z-40 mt-1 w-64 overflow-hidden rounded-xl border shadow-xl',
                          escDark ? 'border-white/[0.06] bg-neutral-900' : 'border-gray-200 bg-white']">
                <div :class="['px-3 py-2 text-xs font-semibold uppercase tracking-wider',
                              escDark ? 'text-neutral-500' : 'text-gray-500']">
                    Macros
                </div>
                <div class="max-h-64 overflow-y-auto">
                    <div v-if="!macros.length"
                         :class="['px-3 py-4 text-center text-sm', escDark ? 'text-neutral-500' : 'text-gray-400']">
                        No macros available
                    </div>
                    <button v-for="macro in macros" :key="macro.id"
                            @click="applyMacro(macro.id)"
                            :disabled="processing"
                            :class="['flex w-full flex-col px-3 py-2.5 text-left transition-colors',
                                     escDark
                                         ? 'hover:bg-white/[0.04] disabled:opacity-50'
                                         : 'hover:bg-gray-50 disabled:opacity-50']">
                        <span :class="['text-sm font-medium', escDark ? 'text-neutral-200' : 'text-gray-900']">
                            {{ macro.name }}
                        </span>
                        <span v-if="macro.description"
                              :class="['mt-0.5 text-xs', escDark ? 'text-neutral-500' : 'text-gray-500']">
                            {{ macro.description }}
                        </span>
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>
