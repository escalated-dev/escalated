<script setup>
import { computed, inject } from 'vue';

const props = defineProps({
    show: { type: Boolean, default: false },
    context: { type: String, default: 'list' },
});

const emit = defineEmits(['update:show']);
const escDark = inject('esc-dark', computed(() => false));

const shortcutGroups = [
    {
        title: 'List View',
        contexts: ['list'],
        shortcuts: [
            { keys: ['j'], description: 'Move down' },
            { keys: ['k'], description: 'Move up' },
            { keys: ['x'], description: 'Toggle select' },
            { keys: ['Enter'], description: 'Open ticket' },
        ],
    },
    {
        title: 'Detail View',
        contexts: ['detail'],
        shortcuts: [
            { keys: ['r'], description: 'Reply' },
            { keys: ['n'], description: 'Internal note' },
            { keys: ['s'], description: 'Change status' },
            { keys: ['p'], description: 'Change priority' },
            { keys: ['f'], description: 'Follow/unfollow' },
        ],
    },
    {
        title: 'Global',
        contexts: ['list', 'detail'],
        shortcuts: [
            { keys: ['?'], description: 'Show this help' },
        ],
    },
];

const filteredGroups = computed(() =>
    shortcutGroups.filter(g => g.contexts.includes(props.context))
);

function closeModal() {
    emit('update:show', false);
}
</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100"
                    leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center" @keydown.escape="closeModal">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>

                <!-- Modal -->
                <div :class="['relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl',
                              escDark ? 'border-white/[0.06] bg-neutral-900' : 'border-gray-200 bg-white']">
                    <!-- Header -->
                    <div :class="['flex items-center justify-between border-b px-6 py-4',
                                  escDark ? 'border-white/[0.06]' : 'border-gray-200']">
                        <div class="flex items-center gap-3">
                            <svg :class="['h-5 w-5', escDark ? 'text-neutral-400' : 'text-gray-500']"
                                 fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            <h2 :class="['text-base font-semibold', escDark ? 'text-white' : 'text-gray-900']">
                                Keyboard Shortcuts
                            </h2>
                        </div>
                        <button @click="closeModal"
                                :class="['rounded-lg p-1.5 transition-colors',
                                         escDark ? 'text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600']">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="max-h-[60vh] overflow-y-auto px-6 py-4">
                        <div v-for="(group, gi) in filteredGroups" :key="gi"
                             :class="['pb-4', gi < filteredGroups.length - 1 && 'mb-4 border-b',
                                      escDark ? 'border-white/[0.06]' : 'border-gray-100']">
                            <h3 :class="['mb-3 text-xs font-semibold uppercase tracking-wider',
                                         escDark ? 'text-neutral-500' : 'text-gray-500']">
                                {{ group.title }}
                            </h3>
                            <div class="space-y-2">
                                <div v-for="(shortcut, si) in group.shortcuts" :key="si"
                                     class="flex items-center justify-between">
                                    <span :class="['text-sm', escDark ? 'text-neutral-300' : 'text-gray-700']">
                                        {{ shortcut.description }}
                                    </span>
                                    <div class="flex items-center gap-1">
                                        <kbd v-for="(key, ki) in shortcut.keys" :key="ki"
                                             :class="['inline-flex min-w-[24px] items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold',
                                                      escDark
                                                          ? 'border-white/10 bg-white/[0.06] text-neutral-300'
                                                          : 'border-gray-300 bg-gray-100 text-gray-700']">
                                            {{ key }}
                                        </kbd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div :class="['border-t px-6 py-3 text-center text-xs',
                                  escDark ? 'border-white/[0.06] text-neutral-600' : 'border-gray-100 text-gray-400']">
                        Press <kbd :class="['mx-1 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                                           escDark ? 'border-white/10 bg-white/[0.06] text-neutral-400' : 'border-gray-300 bg-gray-100 text-gray-600']">Esc</kbd> to close
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
