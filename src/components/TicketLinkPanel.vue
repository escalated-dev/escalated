<script setup>
import { ref, watch, onMounted } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    ticketReference: { type: String, required: true },
});

const links = ref([]);
const searchTerm = ref('');
const searchResults = ref([]);
const linkType = ref('related');
const loading = ref(false);
const expanded = ref(true);
let debounceTimer = null;

const linkTypeLabels = {
    problem_incident: 'Problem/Incident',
    parent_child: 'Parent/Child',
    related: 'Related',
};

onMounted(() => {
    fetchLinks();
});

async function fetchLinks() {
    try {
        const response = await fetch(route('escalated.admin.tickets.links.index', props.ticketReference), {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
        });
        if (response.ok) {
            const data = await response.json();
            links.value = data.links || [];
        }
    } catch {
        // silently ignore
    }
}

watch(searchTerm, (val) => {
    window.clearTimeout(debounceTimer);
    if (!val || val.length < 2) {
        searchResults.value = [];
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
            searchResults.value = (data.tickets || []).filter((t) => t.reference !== props.ticketReference);
        }
    } catch {
        // silently ignore
    } finally {
        loading.value = false;
    }
}

function addLink(targetRef) {
    router.post(
        route('escalated.admin.tickets.links.store', props.ticketReference),
        {
            target_reference: targetRef,
            link_type: linkType.value,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                searchTerm.value = '';
                searchResults.value = [];
                fetchLinks();
            },
        },
    );
}

function removeLink(linkId) {
    router.delete(route('escalated.admin.tickets.links.destroy', [props.ticketReference, linkId]), {
        preserveScroll: true,
        onSuccess: () => {
            fetchLinks();
        },
    });
}

function groupedLinks() {
    const groups = {};
    for (const link of links.value) {
        const type = link.link_type;
        if (!groups[type]) groups[type] = [];
        groups[type].push(link);
    }
    return groups;
}
</script>

<template>
    <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-4">
        <button
            class="flex w-full items-center justify-between text-sm font-semibold text-neutral-200"
            @click="expanded = !expanded"
        >
            <span>Linked Tickets</span>
            <svg
                :class="['h-4 w-4 transition-transform text-neutral-500', expanded && 'rotate-180']"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
            >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </button>

        <div v-if="expanded" class="mt-3 space-y-3">
            <!-- Grouped links -->
            <div v-for="(groupLinks, type) in groupedLinks()" :key="type">
                <p class="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {{ linkTypeLabels[type] || type }}
                </p>
                <div class="mt-1 space-y-1">
                    <div
                        v-for="link in groupLinks"
                        :key="link.id"
                        class="flex items-center justify-between rounded-lg bg-white/[0.02] px-2 py-1.5"
                    >
                        <div class="text-sm">
                            <span class="font-mono text-xs text-neutral-400">{{ link.ticket.reference }}</span>
                            <span class="ml-1 text-neutral-300">{{ link.ticket.subject }}</span>
                        </div>
                        <button
                            aria-label="Remove link"
                            class="text-rose-400 hover:text-rose-300 text-xs"
                            @click="removeLink(link.id)"
                        >
                            Unlink
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="!links.length" class="text-xs text-neutral-500">No linked tickets.</div>

            <!-- Add link form -->
            <div class="border-t border-white/[0.06] pt-3">
                <div class="flex gap-2 mb-2">
                    <select
                        v-model="linkType"
                        class="rounded-lg border border-white/10 bg-neutral-950 px-2 py-1 text-xs text-neutral-300 focus:border-white/20 focus:outline-none"
                    >
                        <option value="related">Related</option>
                        <option value="problem_incident">Problem/Incident</option>
                        <option value="parent_child">Parent/Child</option>
                    </select>
                </div>
                <input
                    v-model="searchTerm"
                    type="text"
                    placeholder="Search ticket to link..."
                    class="w-full rounded-lg border border-white/10 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
                <div v-if="loading" class="mt-2 text-xs text-neutral-500">Searching...</div>
                <div v-else-if="searchResults.length" class="mt-2 max-h-32 space-y-1 overflow-y-auto">
                    <button
                        v-for="ticket in searchResults"
                        :key="ticket.id"
                        class="w-full rounded-lg px-2 py-1 text-left text-xs text-neutral-300 transition-colors hover:bg-white/[0.04]"
                        @click="addLink(ticket.reference)"
                    >
                        <span class="font-mono text-neutral-400">{{ ticket.reference }}</span>
                        <span class="ml-1">{{ ticket.subject }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
