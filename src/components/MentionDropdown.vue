<script setup>
import { ref, computed, inject, watch, nextTick } from 'vue';

const props = defineProps({
    suggestions: { type: Array, default: () => [] },
    visible: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
});

const emit = defineEmits(['select', 'close']);

const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const activeIndex = ref(0);
const listRef = ref(null);

// Reset active index when suggestions change
watch(
    () => props.suggestions,
    () => {
        activeIndex.value = 0;
    },
);

function scrollActiveIntoView() {
    nextTick(() => {
        const list = listRef.value;
        if (!list) return;
        const item = list.children[activeIndex.value];
        if (item) {
            item.scrollIntoView({ block: 'nearest' });
        }
    });
}

function onKeydown(e) {
    if (!props.visible) return false;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex.value = (activeIndex.value + 1) % props.suggestions.length;
        scrollActiveIntoView();
        return true;
    }

    if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex.value = (activeIndex.value - 1 + props.suggestions.length) % props.suggestions.length;
        scrollActiveIntoView();
        return true;
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
        if (props.suggestions.length > 0) {
            e.preventDefault();
            emit('select', props.suggestions[activeIndex.value]);
            return true;
        }
    }

    if (e.key === 'Escape') {
        e.preventDefault();
        emit('close');
        return true;
    }

    return false;
}

function selectAgent(agent) {
    emit('select', agent);
}

defineExpose({ onKeydown });
</script>

<template>
    <div
        v-if="visible && (suggestions.length > 0 || loading)"
        :class="[
            'absolute z-50 w-64 max-h-48 overflow-y-auto rounded-lg border shadow-lg',
            escDark ? 'border-white/10 bg-neutral-900 shadow-black/40' : 'border-gray-200 bg-white shadow-gray-200/50',
        ]"
        role="listbox"
        aria-label="Agent suggestions"
    >
        <!-- Loading state -->
        <div
            v-if="loading && suggestions.length === 0"
            :class="['px-3 py-2 text-xs', escDark ? 'text-neutral-500' : 'text-gray-400']"
        >
            Searching...
        </div>

        <!-- Suggestions list -->
        <div ref="listRef">
            <button
                v-for="(agent, index) in suggestions"
                :key="agent.id"
                type="button"
                role="option"
                :aria-selected="index === activeIndex"
                :class="[
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                    index === activeIndex
                        ? escDark
                            ? 'bg-white/[0.06] text-white'
                            : 'bg-blue-50 text-blue-900'
                        : escDark
                          ? 'text-neutral-300 hover:bg-white/[0.04]'
                          : 'text-gray-700 hover:bg-gray-50',
                ]"
                @click="selectAgent(agent)"
                @mouseenter="activeIndex = index"
            >
                <!-- Avatar placeholder -->
                <div
                    :class="[
                        'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        escDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-700',
                    ]"
                >
                    {{
                        (agent.name || '')
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)
                    }}
                </div>
                <div class="min-w-0 flex-1">
                    <div :class="['truncate font-medium text-sm', escDark ? 'text-white' : 'text-gray-900']">
                        {{ agent.name }}
                    </div>
                    <div :class="['truncate text-xs', escDark ? 'text-neutral-500' : 'text-gray-500']">
                        {{ agent.email }}
                    </div>
                </div>
            </button>
        </div>

        <!-- No results -->
        <div
            v-if="!loading && suggestions.length === 0 && visible"
            :class="['px-3 py-2 text-xs', escDark ? 'text-neutral-500' : 'text-gray-400']"
        >
            No agents found
        </div>
    </div>
</template>
