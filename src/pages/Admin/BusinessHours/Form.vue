<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import ScheduleEditor from '../../../components/ScheduleEditor.vue';
import { useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    schedule: { type: Object, default: null },
    timezones: { type: Array, default: () => [] },
});

const defaultSchedule = {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '', end: '' },
    sunday: { start: '', end: '' },
};

const form = useForm({
    name: props.schedule?.name || '',
    timezone: props.schedule?.timezone || 'UTC',
    is_default: props.schedule?.is_default ?? false,
    schedule: props.schedule?.schedule || { ...defaultSchedule },
    holidays:
        props.schedule?.holidays?.map((h) => ({
            name: h.name,
            date: h.date?.split('T')[0] || h.date,
            recurring: h.recurring,
        })) || [],
});

const newHoliday = ref({ name: '', date: '', recurring: false });

function addHoliday() {
    if (newHoliday.value.name && newHoliday.value.date) {
        form.holidays.push({ ...newHoliday.value });
        newHoliday.value = { name: '', date: '', recurring: false };
    }
}

function removeHoliday(index) {
    form.holidays.splice(index, 1);
}

function submit() {
    if (props.schedule) {
        form.put(route('escalated.admin.business-hours.update', props.schedule.id));
    } else {
        form.post(route('escalated.admin.business-hours.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="schedule ? 'Edit Schedule' : 'New Schedule'">
        <form
            class="mx-auto max-w-2xl space-y-5 rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            @submit.prevent="submit"
        >
            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Name</label>
                <input
                    v-model="form.name"
                    type="text"
                    required
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                />
                <div v-if="form.errors.name" class="mt-1 text-sm text-rose-400">{{ form.errors.name }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Timezone</label>
                <select
                    v-model="form.timezone"
                    required
                    class="mt-1 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                >
                    <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
                </select>
                <div v-if="form.errors.timezone" class="mt-1 text-sm text-rose-400">{{ form.errors.timezone }}</div>
            </div>

            <label class="flex items-center gap-2">
                <input
                    v-model="form.is_default"
                    type="checkbox"
                    class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] text-cyan-500 focus:ring-[var(--esc-panel-border-input)]"
                />
                <span class="text-sm text-[var(--esc-panel-text-secondary)]">Default schedule</span>
            </label>

            <div>
                <label class="mb-2 block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                    >Weekly Hours</label
                >
                <ScheduleEditor v-model="form.schedule" />
                <div v-if="form.errors.schedule" class="mt-1 text-sm text-rose-400">{{ form.errors.schedule }}</div>
            </div>

            <div>
                <label class="mb-2 block text-sm font-medium text-[var(--esc-panel-text-secondary)]">Holidays</label>
                <div class="space-y-2">
                    <div
                        v-for="(holiday, idx) in form.holidays"
                        :key="idx"
                        class="flex items-center gap-2 rounded-lg border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] px-3 py-2"
                    >
                        <span class="flex-1 text-sm text-[var(--esc-panel-text-secondary)]">{{ holiday.name }}</span>
                        <span class="text-sm text-[var(--esc-panel-text-tertiary)]">{{ holiday.date }}</span>
                        <span
                            v-if="holiday.recurring"
                            class="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-400 ring-1 ring-violet-500/20"
                            >Recurring</span
                        >
                        <button
                            type="button"
                            class="text-sm text-rose-400 hover:text-rose-300"
                            @click="removeHoliday(idx)"
                        >
                            Remove
                        </button>
                    </div>
                    <div class="flex items-end gap-2">
                        <div class="flex-1">
                            <input
                                v-model="newHoliday.name"
                                type="text"
                                placeholder="Holiday name"
                                class="w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                        </div>
                        <div>
                            <input
                                v-model="newHoliday.date"
                                type="date"
                                class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-1.5 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                        </div>
                        <label class="flex items-center gap-1">
                            <input
                                v-model="newHoliday.recurring"
                                type="checkbox"
                                class="rounded border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface)] text-cyan-500 focus:ring-[var(--esc-panel-border-input)]"
                            />
                            <span class="text-xs text-[var(--esc-panel-text-tertiary)]">Recurring</span>
                        </label>
                        <button
                            type="button"
                            class="rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-hover)] px-3 py-1.5 text-sm font-medium text-[var(--esc-panel-text-secondary)] transition-colors hover:bg-[var(--esc-panel-hover)]"
                            @click="addHoliday"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ schedule ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
