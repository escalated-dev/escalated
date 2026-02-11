<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import { useForm, usePage, router } from '@inertiajs/vue3';
import { computed } from 'vue';

const props = defineProps({ plugins: Array });
const page = usePage();

const flash = computed(() => ({
    success: page.props.flash?.success,
    error: page.props.flash?.error,
}));

const uploadForm = useForm({
    plugin: null,
});

function onFileChange(e) {
    uploadForm.plugin = e.target.files[0];
}

function submitUpload() {
    uploadForm.post(route('escalated.admin.plugins.upload'), {
        forceFormData: true,
        onSuccess: () => {
            uploadForm.reset();
        },
    });
}

function activate(slug) {
    router.post(route('escalated.admin.plugins.activate', slug));
}

function deactivate(slug) {
    router.post(route('escalated.admin.plugins.deactivate', slug));
}

function deletePlugin(slug) {
    if (confirm('Are you sure you want to delete this plugin? This cannot be undone.')) {
        router.delete(route('escalated.admin.plugins.destroy', slug));
    }
}
</script>

<template>
    <EscalatedLayout title="Plugins">
        <div class="mx-auto max-w-4xl space-y-6">
            <!-- Flash messages -->
            <div v-if="flash.success" class="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                {{ flash.success }}
            </div>
            <div v-if="flash.error" class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {{ flash.error }}
            </div>

            <!-- Upload Plugin -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-4 text-sm font-semibold text-white">Upload Plugin</h3>
                <form @submit.prevent="submitUpload" class="flex items-end gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-neutral-200">Plugin ZIP File</label>
                        <input type="file" accept=".zip" @change="onFileChange"
                               class="mt-2 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-sm file:text-neutral-300 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10" />
                        <p v-if="uploadForm.errors.plugin" class="mt-1 text-xs text-red-400">{{ uploadForm.errors.plugin }}</p>
                    </div>
                    <button type="submit" :disabled="uploadForm.processing || !uploadForm.plugin"
                            class="shrink-0 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50">
                        {{ uploadForm.processing ? 'Uploading...' : 'Upload' }}
                    </button>
                </form>
            </div>

            <!-- Plugin List -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-5 text-sm font-semibold text-white">Installed Plugins</h3>

                <div v-if="!plugins || plugins.length === 0" class="py-8 text-center text-sm text-neutral-500">
                    No plugins installed yet.
                </div>

                <div v-else class="divide-y divide-white/[0.06]">
                    <div v-for="plugin in plugins" :key="plugin.slug" class="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                        <!-- Plugin info -->
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2.5">
                                <span class="text-sm font-medium text-white">{{ plugin.name }}</span>
                                <span class="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                                    v{{ plugin.version }}
                                </span>
                                <span :class="[
                                    'rounded px-1.5 py-0.5 text-[10px] font-medium',
                                    plugin.source === 'composer'
                                        ? 'bg-violet-500/10 text-violet-400'
                                        : 'bg-cyan-500/10 text-cyan-400'
                                ]">
                                    {{ plugin.source }}
                                </span>
                            </div>
                            <p v-if="plugin.description" class="mt-1 text-xs text-neutral-500">{{ plugin.description }}</p>
                            <p class="mt-1 text-xs text-neutral-600">by {{ plugin.author }}</p>
                        </div>

                        <!-- Actions -->
                        <div class="flex shrink-0 items-center gap-2">
                            <!-- Active status toggle -->
                            <button v-if="plugin.is_active" @click="deactivate(plugin.slug)"
                                    class="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
                                Active
                            </button>
                            <button v-else @click="activate(plugin.slug)"
                                    class="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-neutral-300">
                                Inactive
                            </button>

                            <!-- Delete (local only) -->
                            <button v-if="plugin.source === 'local'" @click="deletePlugin(plugin.slug)"
                                    class="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-neutral-600 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </EscalatedLayout>
</template>
