<script setup>
import { computed } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useAgentToasts } from '../composables/useAgentToasts';
import PanelIcon from './PanelIcon.vue';

/** The agent panel's toast stack, bottom right. AgentShell renders it once. */
const { t } = useI18n();
const { toasts, dismiss } = useAgentToasts();
const polite = computed(() => toasts.value.filter((item) => item.tone !== 'error'));
const errors = computed(() => toasts.value.filter((item) => item.tone === 'error'));
</script>

<template>
    <div
        class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col items-end gap-2"
        data-testid="esc-toasts"
    >
        <div role="alert" class="contents">
            <div
                v-for="item in errors"
                :key="item.id"
                class="pointer-events-auto flex w-full items-start gap-2.5 rounded-[var(--esc-radius,6px)] border border-[var(--esc-sla-breach)] bg-[var(--esc-panel-sidebar-bg)] px-3 py-2.5 text-[13px] text-[var(--esc-panel-text)] shadow-lg"
                data-tone="error"
                data-testid="esc-toast"
            >
                <PanelIcon name="warning" class="mt-0.5 h-4 w-4 shrink-0 text-[var(--esc-sla-breach)]" />
                <span class="min-w-0 flex-1">{{ item.message }}</span>
                <button
                    type="button"
                    class="-m-1 rounded p-1 text-[var(--esc-panel-text-tertiary)] hover:text-[var(--esc-panel-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)]"
                    :aria-label="t('agent_panel.toast.dismiss')"
                    @click="dismiss(item.id)"
                >
                    <PanelIcon name="x" class="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
        <div role="status" aria-live="polite" class="contents">
            <div
                v-for="item in polite"
                :key="item.id"
                class="pointer-events-auto flex w-full items-center gap-2.5 rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-sidebar-bg)] px-3 py-2.5 text-[13px] text-[var(--esc-panel-text)] shadow-lg"
                data-tone="success"
                data-testid="esc-toast"
            >
                <PanelIcon name="check" class="h-4 w-4 shrink-0 text-[var(--esc-sla-ok)]" />
                <span class="min-w-0 flex-1">{{ item.message }}</span>
            </div>
        </div>
    </div>
</template>
