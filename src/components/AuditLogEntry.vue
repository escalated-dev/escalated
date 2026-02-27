<script setup>
import { computed } from 'vue';

const props = defineProps({
    log: { type: Object, required: true },
});

const actionColors = {
    created: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    updated: 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20',
    deleted: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20',
};

const actionColor = computed(
    () => actionColors[props.log.action] || 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20',
);

const userInitial = computed(() => {
    const name = props.log.user?.name || 'System';
    return name.charAt(0).toUpperCase();
});

const resourceName = computed(() => {
    const type = props.log.auditable_type || '';
    return type.split('\\').pop() || type;
});

const changedFields = computed(() => {
    if (props.log.action !== 'updated') return [];
    const oldVals = props.log.old_values || {};
    const newVals = props.log.new_values || {};
    const keys = new Set([...Object.keys(oldVals), ...Object.keys(newVals)]);
    return Array.from(keys).map((key) => ({
        field: key,
        old: oldVals[key] ?? '-',
        new: newVals[key] ?? '-',
    }));
});

const formattedDate = computed(() => {
    if (!props.log.created_at) return '';
    const d = new Date(props.log.created_at);
    return d.toLocaleString();
});
</script>

<template>
    <div
        class="flex gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.03]"
    >
        <!-- Avatar -->
        <div
            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-xs font-semibold text-neutral-300"
        >
            {{ userInitial }}
        </div>

        <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 text-sm">
                <span class="font-medium text-neutral-200">{{ log.user?.name || 'System' }}</span>
                <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', actionColor]">
                    {{ log.action }}
                </span>
                <span class="text-neutral-400">{{ resourceName }}</span>
                <span class="text-neutral-600">#{{ log.auditable_id }}</span>
                <span class="ml-auto text-xs text-neutral-500">{{ formattedDate }}</span>
            </div>

            <!-- Changed fields diff -->
            <div v-if="changedFields.length" class="mt-2 space-y-1">
                <div v-for="change in changedFields" :key="change.field" class="flex items-center gap-2 text-xs">
                    <span class="font-medium text-neutral-400">{{ change.field }}:</span>
                    <span class="text-rose-400/70 line-through">{{
                        typeof change.old === 'object' ? JSON.stringify(change.old) : change.old
                    }}</span>
                    <svg
                        class="h-3 w-3 text-neutral-600"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                    <span class="text-emerald-400/70">{{
                        typeof change.new === 'object' ? JSON.stringify(change.new) : change.new
                    }}</span>
                </div>
            </div>

            <!-- IP address -->
            <div v-if="log.ip_address" class="mt-1 text-xs text-neutral-600">IP: {{ log.ip_address }}</div>
        </div>
    </div>
</template>
