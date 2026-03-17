<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    job: { type: Object, required: true },
});

const jobData = ref({ ...props.job });
const polling = ref(null);

const isActive = computed(() => ['importing', 'authenticating', 'mapping'].includes(jobData.value.status));
const isFinished = computed(() => ['completed', 'failed'].includes(jobData.value.status));

async function pollStatus() {
    try {
        const response = await fetch(route('escalated.admin.import.status', jobData.value.id));
        const data = await response.json();
        Object.assign(jobData.value, data);

        if (isFinished.value && polling.value) {
            clearInterval(polling.value);
            polling.value = null;
        }
    } catch (e) {
        // Silently retry on next interval
    }
}

onMounted(() => {
    if (isActive.value) {
        polling.value = setInterval(pollStatus, 3000);
    }
});

onUnmounted(() => {
    if (polling.value) clearInterval(polling.value);
});

const progressEntries = computed(() => {
    if (!jobData.value.progress) return [];
    return Object.entries(jobData.value.progress).map(([type, data]) => ({
        type,
        ...data,
        percentage: data.total > 0 ? Math.round((data.processed / data.total) * 100) : 0,
    }));
});

const recentErrors = computed(() => {
    return (jobData.value.error_log || []).slice(-20);
});

function pause() {
    router.post(route('escalated.admin.import.pause', jobData.value.id));
}

function resume() {
    router.post(route('escalated.admin.import.resume', jobData.value.id));
}

function cancel() {
    if (confirm('Are you sure you want to cancel this import?')) {
        router.post(route('escalated.admin.import.cancel', jobData.value.id));
    }
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold text-[var(--esc-panel-text)]">
                    Import Progress
                    <span
                        class="ml-2 text-sm font-normal capitalize"
                        :class="{
                            'text-blue-400': isActive,
                            'text-green-400': jobData.status === 'completed',
                            'text-red-400': jobData.status === 'failed',
                            'text-yellow-400': jobData.status === 'paused',
                        }"
                        >{{ jobData.status }}</span
                    >
                </h2>
                <p class="mt-1 text-sm text-[var(--esc-panel-text-secondary)] capitalize">{{ jobData.platform }}</p>
            </div>

            <div class="flex gap-2">
                <button
                    v-if="jobData.status === 'importing'"
                    class="rounded-lg border border-yellow-500/50 px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/10"
                    @click="pause"
                >
                    Pause
                </button>
                <button
                    v-if="jobData.status === 'paused'"
                    class="rounded-lg border border-blue-500/50 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/10"
                    @click="resume"
                >
                    Resume
                </button>
                <button
                    v-if="isActive || jobData.status === 'paused'"
                    class="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
                    @click="cancel"
                >
                    Cancel
                </button>
            </div>
        </div>

        <!-- Progress bars per entity type -->
        <div class="space-y-4">
            <div
                v-for="entry in progressEntries"
                :key="entry.type"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-4"
            >
                <div class="mb-2 flex items-center justify-between text-sm">
                    <span class="font-medium capitalize text-[var(--esc-panel-text)]">{{ entry.type }}</span>
                    <span class="text-[var(--esc-panel-text-secondary)]">
                        {{ entry.processed }} / {{ entry.total || '?' }}
                        <span v-if="entry.skipped" class="ml-2 text-yellow-400">{{ entry.skipped }} skipped</span>
                        <span v-if="entry.failed" class="ml-2 text-red-400">{{ entry.failed }} failed</span>
                    </span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-[var(--esc-panel-surface-alt)]">
                    <div
                        class="h-full rounded-full bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] transition-all duration-500"
                        :style="{ width: entry.percentage + '%' }"
                    ></div>
                </div>
            </div>
        </div>

        <!-- Error log -->
        <div v-if="recentErrors.length" class="rounded-xl border border-red-500/20 bg-[var(--esc-panel-surface)] p-4">
            <h3 class="mb-3 text-sm font-semibold text-red-400">Recent Errors</h3>
            <div class="max-h-60 space-y-2 overflow-y-auto">
                <div
                    v-for="(error, idx) in recentErrors"
                    :key="idx"
                    class="rounded-lg bg-[var(--esc-panel-surface-alt)] p-3 text-xs"
                >
                    <span class="font-medium capitalize text-[var(--esc-panel-text)]">{{ error.entity_type }}</span>
                    <span class="mx-1 text-[var(--esc-panel-text-muted)]">#{{ error.source_id }}</span>
                    <span class="text-red-400">{{ error.error }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
