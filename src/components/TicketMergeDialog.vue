<script setup>
import { ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    ticketReference: { type: String, required: true },
});

const emit = defineEmits(['close']);

const searchTerm = ref('');
const results = ref([]);
const loading = ref(false);
const selectedTicket = ref(null);
const merging = ref(false);
let debounceTimer = null;

watch(searchTerm, (val) => {
    window.clearTimeout(debounceTimer);
    selectedTicket.value = null;
    if (!val || val.length < 2) {
        results.value = [];
        return;
    }
    debounceTimer = window.setTimeout(() => searchTickets(val), 300);
});

async function searchTickets(term) {
    loading.value = true;
    try {
        const response = await fetch(route('escalated.admin.tickets.merge-search', { q: term }), {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
        });
        if (response.ok) {
            const data = await response.json();
            results.value = (data.tickets || []).filter((t) => t.reference !== props.ticketReference);
        }
    } catch {
        // silently ignore
    } finally {
        loading.value = false;
    }
}

function selectTicket(ticket) {
    selectedTicket.value = ticket;
}

function confirmMerge() {
    if (!selectedTicket.value || merging.value) return;
    merging.value = true;

    router.post(
        route('escalated.admin.tickets.merge', props.ticketReference),
        {
            target_reference: selectedTicket.value.reference,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                emit('close');
            },
            onFinish: () => {
                merging.value = false;
            },
        },
    );
}
</script>

<template>
    <Teleport to="body">
        <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            @click.self="emit('close')"
        >
            <div class="w-full max-w-lg rounded-xl border border-white/[0.06] bg-neutral-900 p-6 shadow-2xl">
                <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-neutral-200">Merge Ticket</h3>
                    <button class="text-neutral-500 hover:text-neutral-300" @click="emit('close')">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p class="mb-4 text-sm text-neutral-400">
                    Search for a ticket to merge
                    <span class="font-mono text-neutral-300">{{ ticketReference }}</span> into. All replies will be
                    moved to the target ticket and this ticket will be closed.
                </p>

                <input
                    v-model="searchTerm"
                    type="text"
                    placeholder="Search by reference or subject..."
                    class="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />

                <div v-if="loading" class="mt-3 text-center text-sm text-neutral-500">Searching...</div>

                <div v-else-if="results.length" class="mt-3 max-h-48 space-y-1 overflow-y-auto">
                    <button
                        v-for="ticket in results"
                        :key="ticket.id"
                        :class="[
                            'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                            selectedTicket?.id === ticket.id
                                ? 'bg-cyan-500/15 ring-1 ring-cyan-500/20 text-neutral-200'
                                : 'text-neutral-300 hover:bg-white/[0.04]',
                        ]"
                        @click="selectTicket(ticket)"
                    >
                        <span class="font-mono text-xs text-neutral-400">{{ ticket.reference }}</span>
                        <span class="ml-2">{{ ticket.subject }}</span>
                    </button>
                </div>

                <div v-else-if="searchTerm.length >= 2 && !loading" class="mt-3 text-center text-sm text-neutral-500">
                    No matching tickets found.
                </div>

                <!-- Selected ticket preview -->
                <div v-if="selectedTicket" class="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                    <p class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Merge into</p>
                    <p class="mt-1 text-sm text-neutral-200">
                        <span class="font-mono text-neutral-400">{{ selectedTicket.reference }}</span>
                        &mdash; {{ selectedTicket.subject }}
                    </p>
                </div>

                <div class="mt-5 flex justify-end gap-3">
                    <button
                        class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.06]"
                        @click="emit('close')"
                    >
                        Cancel
                    </button>
                    <button
                        :disabled="!selectedTicket || merging"
                        :class="[
                            'rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400',
                            (!selectedTicket || merging) && 'cursor-not-allowed opacity-40',
                        ]"
                        @click="confirmMerge"
                    >
                        {{ merging ? 'Merging...' : 'Confirm Merge' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
