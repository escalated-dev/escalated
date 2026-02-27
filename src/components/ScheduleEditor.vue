<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({
            monday: { start: '09:00', end: '17:00' },
            tuesday: { start: '09:00', end: '17:00' },
            wednesday: { start: '09:00', end: '17:00' },
            thursday: { start: '09:00', end: '17:00' },
            friday: { start: '09:00', end: '17:00' },
            saturday: { start: '', end: '' },
            sunday: { start: '', end: '' },
        }),
    },
});

const emit = defineEmits(['update:modelValue']);

const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
];

const timeOptions = computed(() => {
    const options = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            options.push(`${hh}:${mm}`);
        }
    }
    options.push('24:00');
    return options;
});

function updateDay(dayKey, field, value) {
    const updated = { ...props.modelValue };
    updated[dayKey] = { ...(updated[dayKey] || { start: '', end: '' }), [field]: value };
    emit('update:modelValue', updated);
}

function toggleDay(dayKey) {
    const updated = { ...props.modelValue };
    const current = updated[dayKey];
    if (current && current.start) {
        updated[dayKey] = { start: '', end: '' };
    } else {
        updated[dayKey] = { start: '09:00', end: '17:00' };
    }
    emit('update:modelValue', updated);
}

function isDayEnabled(dayKey) {
    const day = props.modelValue[dayKey];
    return day && day.start;
}
</script>

<template>
    <div class="space-y-2">
        <div
            v-for="day in days"
            :key="day.key"
            class="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-neutral-950/50 px-3 py-2"
        >
            <label class="flex w-28 items-center gap-2">
                <input
                    type="checkbox"
                    :checked="isDayEnabled(day.key)"
                    class="rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-white/10"
                    @change="toggleDay(day.key)"
                />
                <span class="text-sm font-medium text-neutral-300">{{ day.label }}</span>
            </label>

            <template v-if="isDayEnabled(day.key)">
                <select
                    :value="modelValue[day.key]?.start || '09:00'"
                    class="rounded-lg border border-white/10 bg-neutral-950 px-2 py-1 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                    @change="updateDay(day.key, 'start', $event.target.value)"
                >
                    <option v-for="t in timeOptions" :key="'s-' + t" :value="t">{{ t }}</option>
                </select>
                <span class="text-xs text-neutral-500">to</span>
                <select
                    :value="modelValue[day.key]?.end || '17:00'"
                    class="rounded-lg border border-white/10 bg-neutral-950 px-2 py-1 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                    @change="updateDay(day.key, 'end', $event.target.value)"
                >
                    <option v-for="t in timeOptions" :key="'e-' + t" :value="t">{{ t }}</option>
                </select>
            </template>
            <span v-else class="text-xs text-neutral-500">Closed</span>
        </div>
    </div>
</template>
