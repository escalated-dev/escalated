<script setup>
import { ref, computed, inject } from 'vue';
import { router } from '@inertiajs/vue3';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { useI18n } from '../composables/useI18n';

const props = defineProps({
    notes: { type: Array, default: () => [] },
    ticketReference: { type: String, required: true },
    routePrefix: { type: String, required: true },
});

const escDark = inject('esc-dark', computed(() => false));
const { t } = useI18n();
const processingId = ref(null);

function unpinNote(note) {
    if (processingId.value) return;
    processingId.value = note.id;
    router.post(route(`${props.routePrefix}.tickets.pin`, [props.ticketReference, note.id]), {}, {
        preserveScroll: true,
        onFinish: () => {
            processingId.value = null;
        },
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
</script>

<template>
    <div v-if="notes.length > 0"
         :class="['rounded-xl border p-4',
                  escDark
                      ? 'border-amber-500/20 bg-amber-500/[0.06]'
                      : 'border-amber-300 bg-amber-50']">
        <!-- Header -->
        <div class="mb-3 flex items-center gap-2">
            <svg :class="['h-4 w-4', escDark ? 'text-amber-400' : 'text-amber-600']"
                 fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
            </svg>
            <span :class="['text-xs font-semibold uppercase tracking-wider',
                           escDark ? 'text-amber-400' : 'text-amber-700']">
                {{ t('pinned_notes.title') }}
            </span>
        </div>

        <!-- Notes list -->
        <div class="space-y-3">
            <div v-for="note in notes" :key="note.id"
                 :class="['rounded-lg border p-3',
                          escDark
                              ? 'border-amber-500/10 bg-amber-500/[0.04]'
                              : 'border-amber-200 bg-white']">
                <!-- Note body -->
                <div :class="['prose prose-sm max-w-none', escDark ? 'prose-invert text-neutral-200' : 'text-gray-800']" v-html="sanitizeHtml(note.body)"></div>

                <!-- Meta row -->
                <div class="mt-2 flex items-center justify-between">
                    <div :class="['flex items-center gap-2 text-xs',
                                  escDark ? 'text-neutral-500' : 'text-gray-500']">
                        <span class="font-medium">{{ note.author?.name || 'Unknown' }}</span>
                        <span>&middot;</span>
                        <span>{{ formatDate(note.created_at) }}</span>
                    </div>
                    <button @click="unpinNote(note)"
                            :disabled="processingId === note.id"
                            :class="['rounded-md px-2 py-1 text-xs font-medium transition-colors',
                                     escDark
                                         ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                                         : 'text-amber-600 hover:bg-amber-100 hover:text-amber-700',
                                     processingId === note.id && 'opacity-50 cursor-not-allowed']">
                        {{ t('pinned_notes.unpin') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
