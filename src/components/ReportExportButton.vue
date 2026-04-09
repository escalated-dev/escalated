<script setup>
import { ref } from 'vue';

const props = defineProps({
    exportUrl: { type: String, default: '' },
    reportName: { type: String, default: 'report' },
    periodDays: { type: Number, default: 30 },
});

const open = ref(false);
const loading = ref(false);

async function exportAs(format) {
    loading.value = true;
    try {
        const separator = props.exportUrl.includes('?') ? '&' : '?';
        const url = props.exportUrl ? `${props.exportUrl}${separator}format=${format}&days=${props.periodDays}` : '#';

        if (!props.exportUrl) {
            const data = { report: props.reportName, format, period_days: props.periodDays };
            const blob = new Blob([format === 'json' ? JSON.stringify(data, null, 2) : 'No export URL configured'], {
                type: format === 'json' ? 'application/json' : 'text/csv',
            });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${props.reportName}-${props.periodDays}d.${format}`;
            a.click();
            URL.revokeObjectURL(a.href);
        } else {
            const response = await fetch(url);
            const blob = await response.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${props.reportName}-${props.periodDays}d.${format}`;
            a.click();
            URL.revokeObjectURL(a.href);
        }
    } finally {
        loading.value = false;
        open.value = false;
    }
}
</script>

<template>
    <div class="relative">
        <button
            class="flex items-center gap-2 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-3.5 py-1.5 text-sm font-medium text-[var(--esc-panel-text-tertiary)] transition-all hover:text-[var(--esc-panel-text-secondary)]"
            @click="open = !open"
        >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
            </svg>
            <span>Export</span>
            <svg v-if="loading" class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
        </button>
        <div
            v-if="open"
            class="absolute right-0 top-full z-10 mt-1 w-44 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] py-1 shadow-xl"
        >
            <button
                class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)]"
                @click="exportAs('csv')"
            >
                <svg
                    class="h-4 w-4 text-[var(--esc-panel-text-muted)]"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                </svg>
                Export as CSV
            </button>
            <button
                class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--esc-panel-text-secondary)] hover:bg-[var(--esc-panel-hover)]"
                @click="exportAs('json')"
            >
                <svg
                    class="h-4 w-4 text-[var(--esc-panel-text-muted)]"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                    />
                </svg>
                Export as JSON
            </button>
        </div>
    </div>
</template>
