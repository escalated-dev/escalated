<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { router } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    plugins: { type: Array, default: () => [] },
});

const confirmingDelete = ref(null);
const uploading = ref(false);
const fileInput = ref(null);

const activePlugins = computed(() => props.plugins.filter(p => p.active));
const inactivePlugins = computed(() => props.plugins.filter(p => !p.active));

function togglePlugin(plugin) {
    router.post(route('escalated.admin.plugins.toggle', plugin.id), {}, {
        preserveScroll: true,
    });
}

function confirmDelete(plugin) {
    confirmingDelete.value = plugin.id;
}

function cancelDelete() {
    confirmingDelete.value = null;
}

function deletePlugin(plugin) {
    router.delete(route('escalated.admin.plugins.destroy', plugin.id), {
        preserveScroll: true,
        onSuccess: () => { confirmingDelete.value = null; },
    });
}

function triggerUpload() {
    fileInput.value?.click();
}

function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    uploading.value = true;
    router.post(route('escalated.admin.plugins.upload'), { file }, {
        forceFormData: true,
        preserveScroll: true,
        onFinish: () => {
            uploading.value = false;
            if (fileInput.value) fileInput.value.value = '';
        },
    });
}

function statusColor(plugin) {
    if (plugin.active) return 'bg-emerald-500';
    return 'bg-neutral-600';
}

function statusLabel(plugin) {
    return plugin.active ? 'Active' : 'Inactive';
}
</script>

<template>
    <EscalatedLayout title="Plugins">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
            <div>
                <p class="text-sm text-neutral-400">
                    {{ activePlugins.length }} active, {{ inactivePlugins.length }} inactive
                </p>
            </div>
            <div>
                <input ref="fileInput" type="file" accept=".zip" class="hidden" @change="handleUpload" />
                <button @click="triggerUpload" :disabled="uploading"
                        class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50">
                    <span v-if="uploading" class="flex items-center gap-2">
                        <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Uploading...
                    </span>
                    <span v-else class="flex items-center gap-2">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload Plugin
                    </span>
                </button>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="!plugins?.length" class="rounded-xl border border-white/[0.06] bg-neutral-900/60 px-6 py-16 text-center">
            <svg class="mx-auto mb-4 h-12 w-12 text-neutral-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
            </svg>
            <h3 class="text-sm font-medium text-neutral-300">No plugins installed</h3>
            <p class="mt-1 text-xs text-neutral-500">Upload a plugin ZIP to extend Escalated with custom functionality.</p>
        </div>

        <!-- Plugin cards -->
        <div v-else class="space-y-3">
            <div v-for="plugin in plugins" :key="plugin.id"
                 class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5 transition-colors hover:bg-neutral-900/80">
                <div class="flex items-start justify-between gap-4">
                    <!-- Plugin info -->
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-3">
                            <h3 class="text-sm font-semibold text-white">{{ plugin.name }}</h3>
                            <span :class="['inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                           plugin.active
                                               ? 'bg-emerald-500/10 text-emerald-400'
                                               : 'bg-neutral-500/10 text-neutral-500']">
                                <span :class="['h-1.5 w-1.5 rounded-full', statusColor(plugin)]"></span>
                                {{ statusLabel(plugin) }}
                            </span>
                            <span v-if="plugin.version" class="text-[11px] text-neutral-600">v{{ plugin.version }}</span>
                        </div>
                        <p v-if="plugin.description" class="mt-1 text-sm text-neutral-400">{{ plugin.description }}</p>
                        <div class="mt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-600">
                            <span v-if="plugin.author" class="flex items-center gap-1">
                                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                {{ plugin.author }}
                            </span>
                            <span v-if="plugin.homepage" class="flex items-center gap-1">
                                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                </svg>
                                <a :href="plugin.homepage" target="_blank" rel="noopener" class="hover:text-neutral-400">{{ plugin.homepage }}</a>
                            </span>
                            <span v-if="plugin.installed_at" class="flex items-center gap-1">
                                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                Installed {{ plugin.installed_at }}
                            </span>
                        </div>

                        <!-- Provided extensions summary -->
                        <div v-if="plugin.provides" class="mt-3 flex flex-wrap gap-2">
                            <span v-if="plugin.provides.menu_items"
                                  class="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-neutral-500">
                                {{ plugin.provides.menu_items }} menu item{{ plugin.provides.menu_items !== 1 ? 's' : '' }}
                            </span>
                            <span v-if="plugin.provides.widgets"
                                  class="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-neutral-500">
                                {{ plugin.provides.widgets }} widget{{ plugin.provides.widgets !== 1 ? 's' : '' }}
                            </span>
                            <span v-if="plugin.provides.page_components"
                                  class="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] text-neutral-500">
                                {{ plugin.provides.page_components }} page component{{ plugin.provides.page_components !== 1 ? 's' : '' }}
                            </span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex shrink-0 items-center gap-2">
                        <!-- Toggle active/inactive -->
                        <button @click="togglePlugin(plugin)"
                                :class="['relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                                         plugin.active ? 'bg-emerald-500' : 'bg-neutral-700']"
                                :title="plugin.active ? 'Deactivate' : 'Activate'">
                            <span :class="['pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                                           plugin.active ? 'translate-x-5' : 'translate-x-0']" />
                        </button>

                        <!-- Delete -->
                        <template v-if="confirmingDelete === plugin.id">
                            <button @click="deletePlugin(plugin)"
                                    class="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/30">
                                Confirm
                            </button>
                            <button @click="cancelDelete"
                                    class="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/[0.04]">
                                Cancel
                            </button>
                        </template>
                        <button v-else @click="confirmDelete(plugin)"
                                class="rounded-lg border border-white/[0.06] p-1.5 text-neutral-600 transition-colors hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-400"
                                title="Delete plugin">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </EscalatedLayout>
</template>
