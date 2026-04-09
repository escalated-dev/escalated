<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    modelValue: { type: Number, default: 30 },
    options: { type: Array, default: () => [7, 30, 90, 365] },
});

const emit = defineEmits(['update:modelValue']);

const showCustom = ref(false);
const customStart = ref('');
const customEnd = ref('');

const isCustom = computed(() => !props.options.includes(props.modelValue));

function selectPeriod(days) {
    showCustom.value = false;
    emit('update:modelValue', days);
}

function applyCustom() {
    if (customStart.value && customEnd.value) {
        const start = new Date(customStart.value);
        const end = new Date(customEnd.value);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (days > 0) {
            emit('update:modelValue', days);
            showCustom.value = false;
        }
    }
}

function formatLabel(days) {
    if (days === 365) return '1y';
    return `${days}d`;
}
</script>

<template>
    <div class="flex items-center gap-2">
        <button
            v-for="d in options"
            :key="d"
            :class="[
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                modelValue === d
                    ? 'bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] text-white shadow-lg shadow-[var(--esc-panel-bg)]/20'
                    : 'border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]',
            ]"
            @click="selectPeriod(d)"
        >
            {{ formatLabel(d) }}
        </button>
        <div class="relative">
            <button
                :class="[
                    'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                    isCustom
                        ? 'bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] text-white shadow-lg shadow-[var(--esc-panel-bg)]/20'
                        : 'border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-tertiary)] hover:bg-[var(--esc-panel-hover)] hover:text-[var(--esc-panel-text-secondary)]',
                ]"
                @click="showCustom = !showCustom"
            >
                Custom
            </button>
            <div
                v-if="showCustom"
                class="absolute right-0 top-full z-10 mt-2 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-4 shadow-xl"
            >
                <div class="flex flex-col gap-3">
                    <label class="text-xs font-medium text-[var(--esc-panel-text-muted)]">
                        Start
                        <input
                            v-model="customStart"
                            type="date"
                            class="mt-1 block w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-3 py-1.5 text-sm text-[var(--esc-panel-text)]"
                        />
                    </label>
                    <label class="text-xs font-medium text-[var(--esc-panel-text-muted)]">
                        End
                        <input
                            v-model="customEnd"
                            type="date"
                            class="mt-1 block w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-3 py-1.5 text-sm text-[var(--esc-panel-text)]"
                        />
                    </label>
                    <button
                        class="rounded-lg bg-[var(--esc-panel-accent)] px-4 py-1.5 text-sm font-medium text-white transition-all hover:opacity-90"
                        @click="applyCustom"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
