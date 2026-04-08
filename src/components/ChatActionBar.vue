<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import { useI18n } from '../composables/useI18n';

const props = defineProps({
    sessionId: { type: [String, Number], default: null },
    startedAt: { type: String, default: null },
    customer: { type: Object, default: () => ({}) },
    agents: { type: Array, default: () => [] },
    departments: { type: Array, default: () => [] },
    endEndpoint: { type: String, default: '' },
    transferEndpoint: { type: String, default: '' },
});

const emit = defineEmits(['end-chat', 'transfer']);

const escDark = inject(
    'esc-dark',
    computed(() => false),
);
const { t } = useI18n();

const showEndConfirm = ref(false);
const showTransfer = ref(false);
const elapsed = ref('0:00');
let timerInterval = null;

function updateTimer() {
    if (!props.startedAt) return;
    const diffMs = Date.now() - new Date(props.startedAt).getTime();
    const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins >= 60) {
        const hrs = Math.floor(mins / 60);
        const remMins = mins % 60;
        elapsed.value = `${hrs}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
        elapsed.value = `${mins}:${String(secs).padStart(2, '0')}`;
    }
}

onMounted(() => {
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
});

onUnmounted(() => {
    clearInterval(timerInterval);
});

async function confirmEndChat() {
    emit('end-chat', props.sessionId);
    if (props.endEndpoint) {
        try {
            await fetch(props.endEndpoint, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
            });
        } catch {
            // handled by caller
        }
    }
    showEndConfirm.value = false;
}

function transferTo(type, id) {
    emit('transfer', { type, id });
    if (props.transferEndpoint) {
        fetch(props.transferEndpoint, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            },
            body: JSON.stringify({ type, id }),
        }).catch(() => {});
    }
    showTransfer.value = false;
}
</script>

<template>
    <div
        :class="[
            'flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3',
            escDark ? 'border-white/[0.06] bg-neutral-900/60' : 'border-gray-200 bg-white',
        ]"
    >
        <!-- Chat duration -->
        <div class="flex items-center gap-2">
            <span :class="['h-2 w-2 animate-pulse rounded-full bg-emerald-500']"></span>
            <span :class="['text-sm font-mono font-medium', escDark ? 'text-neutral-300' : 'text-gray-700']">
                {{ elapsed }}
            </span>
            <span :class="['text-xs', escDark ? 'text-neutral-600' : 'text-gray-400']">
                {{ t('chat.live') }}
            </span>
        </div>

        <!-- Customer info -->
        <div
            v-if="customer.name || customer.email"
            :class="['flex items-center gap-2 text-xs', escDark ? 'text-neutral-500' : 'text-gray-500']"
        >
            <span v-if="customer.name">{{ customer.name }}</span>
            <span v-if="customer.email" class="hidden sm:inline">&middot; {{ customer.email }}</span>
            <span v-if="customer.page_url" class="hidden md:inline truncate max-w-[200px]"
                >&middot; {{ customer.page_url }}</span
            >
        </div>

        <div class="ml-auto flex items-center gap-2">
            <!-- Transfer -->
            <div class="relative">
                <button
                    :class="[
                        'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                        escDark
                            ? 'border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-200'
                            : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800',
                    ]"
                    @click="showTransfer = !showTransfer"
                >
                    {{ t('chat.transfer') }}
                </button>
                <div
                    v-if="showTransfer"
                    :class="[
                        'absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border py-1 shadow-xl',
                        escDark ? 'border-white/[0.08] bg-neutral-800' : 'border-gray-200 bg-white',
                    ]"
                >
                    <div
                        v-if="agents.length"
                        :class="[
                            'px-3 py-1 text-[10px] font-semibold uppercase',
                            escDark ? 'text-neutral-600' : 'text-gray-400',
                        ]"
                    >
                        {{ t('chat.agents') }}
                    </div>
                    <button
                        v-for="agent in agents"
                        :key="'a-' + agent.id"
                        :class="[
                            'block w-full px-3 py-1.5 text-left text-sm',
                            escDark ? 'text-neutral-300 hover:bg-white/[0.06]' : 'text-gray-700 hover:bg-gray-50',
                        ]"
                        @click="transferTo('agent', agent.id)"
                    >
                        {{ agent.name }}
                    </button>
                    <div
                        v-if="departments.length"
                        :class="[
                            'mt-1 border-t px-3 py-1 text-[10px] font-semibold uppercase',
                            escDark ? 'border-white/[0.06] text-neutral-600' : 'border-gray-100 text-gray-400',
                        ]"
                    >
                        {{ t('chat.departments') }}
                    </div>
                    <button
                        v-for="dept in departments"
                        :key="'d-' + dept.id"
                        :class="[
                            'block w-full px-3 py-1.5 text-left text-sm',
                            escDark ? 'text-neutral-300 hover:bg-white/[0.06]' : 'text-gray-700 hover:bg-gray-50',
                        ]"
                        @click="transferTo('department', dept.id)"
                    >
                        {{ dept.name }}
                    </button>
                </div>
            </div>

            <!-- End Chat -->
            <div class="relative">
                <button
                    v-if="!showEndConfirm"
                    :class="[
                        'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                        escDark
                            ? 'border-rose-500/20 text-rose-400 hover:bg-rose-500/10'
                            : 'border-red-200 text-red-600 hover:bg-red-50',
                    ]"
                    @click="showEndConfirm = true"
                >
                    {{ t('chat.end_chat') }}
                </button>
                <div v-else class="flex items-center gap-2">
                    <span :class="['text-xs', escDark ? 'text-neutral-400' : 'text-gray-500']">
                        {{ t('chat.end_confirm') }}
                    </span>
                    <button
                        :class="[
                            'rounded-lg px-3 py-1.5 text-sm font-medium text-white',
                            escDark ? 'bg-rose-600 hover:bg-rose-500' : 'bg-red-600 hover:bg-red-500',
                        ]"
                        @click="confirmEndChat"
                    >
                        {{ t('form.confirm') }}
                    </button>
                    <button
                        :class="[
                            'rounded-lg border px-3 py-1.5 text-sm',
                            escDark
                                ? 'border-white/10 text-neutral-400 hover:text-neutral-200'
                                : 'border-gray-300 text-gray-500 hover:text-gray-700',
                        ]"
                        @click="showEndConfirm = false"
                    >
                        {{ t('form.cancel') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
