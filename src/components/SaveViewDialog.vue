<script setup>
import { ref, computed, inject } from 'vue';

const props = defineProps({
    show: { type: Boolean, default: false },
    filters: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['close', 'saved']);
const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const name = ref('');
const isShared = ref(false);
const saving = ref(false);
const error = ref('');

function reset() {
    name.value = '';
    isShared.value = false;
    error.value = '';
}

async function save() {
    if (!name.value.trim()) {
        error.value = 'Name is required.';
        return;
    }

    const nonEmptyFilters = {};
    for (const [key, value] of Object.entries(props.filters)) {
        if (value !== '' && value !== null && value !== undefined) {
            nonEmptyFilters[key] = value;
        }
    }

    if (Object.keys(nonEmptyFilters).length === 0) {
        error.value = 'Apply some filters first before saving a view.';
        return;
    }

    saving.value = true;
    error.value = '';

    try {
        const response = await fetch(route('escalated.admin.saved-views.store'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                name: name.value.trim(),
                filters: nonEmptyFilters,
                is_shared: isShared.value,
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            error.value = data.message || 'Failed to save view.';
            return;
        }

        emit('saved');
        reset();
        emit('close');
    } catch {
        error.value = 'Failed to save view.';
    } finally {
        saving.value = false;
    }
}

function cancel() {
    reset();
    emit('close');
}

const overlayClass = computed(() => (escDark.value ? 'bg-black/60' : 'bg-black/30'));

const panelClass = computed(() =>
    escDark.value
        ? 'border border-white/10 bg-[var(--esc-panel-surface)] text-neutral-200 shadow-xl'
        : 'bg-white text-gray-900 shadow-xl',
);

const inputClass = computed(() =>
    escDark.value
        ? 'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-cyan-500/40'
        : 'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
);
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="cancel">
            <div :class="['absolute inset-0', overlayClass]" @click="cancel"></div>
            <div :class="['relative w-full max-w-md rounded-lg p-6', panelClass]">
                <h3 :class="['mb-4 text-lg font-semibold', escDark ? 'text-neutral-100' : 'text-gray-900']">
                    Save Current View
                </h3>

                <div class="space-y-4">
                    <div>
                        <label
                            :class="['mb-1 block text-sm font-medium', escDark ? 'text-neutral-400' : 'text-gray-700']"
                        >
                            Name
                        </label>
                        <input
                            v-model="name"
                            type="text"
                            placeholder="e.g. My Open Tickets"
                            :class="['w-full', inputClass]"
                            @keydown.enter="save"
                        />
                    </div>

                    <label class="flex items-center gap-2">
                        <input
                            v-model="isShared"
                            type="checkbox"
                            :class="
                                escDark
                                    ? 'h-4 w-4 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500/20'
                                    : 'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                            "
                        />
                        <span :class="['text-sm', escDark ? 'text-neutral-400' : 'text-gray-600']">
                            Share with all agents
                        </span>
                    </label>

                    <p v-if="error" :class="['text-sm', escDark ? 'text-red-400' : 'text-red-600']">
                        {{ error }}
                    </p>
                </div>

                <div class="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        :class="[
                            'rounded-md px-4 py-2 text-sm font-medium',
                            escDark ? 'text-neutral-400 hover:text-neutral-200' : 'text-gray-600 hover:text-gray-800',
                        ]"
                        @click="cancel"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        :disabled="saving"
                        :class="[
                            'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50',
                            escDark
                                ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                                : 'bg-blue-600 text-white hover:bg-blue-700',
                        ]"
                        @click="save"
                    >
                        {{ saving ? 'Saving...' : 'Save View' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
