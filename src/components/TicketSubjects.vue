<script setup>
import { inject, computed } from 'vue';

const props = defineProps({
    subjects: { type: Array, default: () => [] },
});

const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const cardClass = computed(() =>
    escDark.value
        ? 'rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-4'
        : 'rounded-lg border border-gray-200 bg-white p-4',
);

const hasSubjects = computed(() => Array.isArray(props.subjects) && props.subjects.length > 0);

function initials(subject) {
    const text = (subject.title || '').trim();
    if (!text) return '?';
    return text
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w.charAt(0).toUpperCase())
        .join('');
}
</script>

<template>
    <div v-if="hasSubjects" :class="cardClass">
        <h3 :class="['mb-3 text-sm font-semibold', escDark ? 'text-[var(--esc-panel-text)]' : 'text-gray-900']">
            Related
        </h3>
        <ul class="space-y-2">
            <li v-for="(subject, i) in subjects" :key="`${subject.type}:${subject.id}:${i}`">
                <component
                    :is="subject.url ? 'a' : 'div'"
                    :href="subject.url || undefined"
                    :target="subject.url ? '_blank' : undefined"
                    :rel="subject.url ? 'noopener noreferrer' : undefined"
                    :class="[
                        'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition',
                        subject.url ? 'cursor-pointer' : '',
                        subject.url
                            ? escDark
                                ? 'hover:bg-[var(--esc-panel-hover,rgba(255,255,255,0.05))]'
                                : 'hover:bg-gray-50'
                            : '',
                    ]"
                >
                    <span
                        class="flex h-8 w-8 flex-none items-center justify-center rounded-md text-xs font-semibold text-white"
                        :style="{ backgroundColor: subject.color || '#6b7280' }"
                        :title="subject.icon || undefined"
                        aria-hidden="true"
                    >
                        {{ initials(subject) }}
                    </span>
                    <span class="min-w-0 flex-1">
                        <span
                            :class="[
                                'block truncate font-medium',
                                escDark ? 'text-[var(--esc-panel-text)]' : 'text-gray-900',
                            ]"
                        >
                            {{ subject.title }}
                        </span>
                        <span
                            v-if="subject.subtitle"
                            :class="[
                                'block truncate text-xs',
                                escDark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-500',
                            ]"
                        >
                            {{ subject.subtitle }}
                        </span>
                    </span>
                    <span
                        v-if="subject.role"
                        :class="['flex-none text-xs', escDark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-400']"
                    >
                        {{ subject.role }}
                    </span>
                    <svg
                        v-if="subject.url"
                        class="h-3.5 w-3.5 flex-none"
                        :class="escDark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-400'"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M14 5h5v5m0-5L10 14m-1 5H6a2 2 0 01-2-2V8"
                        />
                    </svg>
                </component>
            </li>
        </ul>
    </div>
</template>
