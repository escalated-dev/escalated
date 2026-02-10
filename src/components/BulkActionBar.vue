<script setup>
import { ref, computed, inject } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    selectedIds: { type: Array, required: true },
    bulkRoute: { type: String, required: true },
    agents: { type: Array, default: () => [] },
    departments: { type: Array, default: () => [] },
});

const emit = defineEmits(['clear']);
const escDark = inject('esc-dark', computed(() => false));
const processing = ref(false);

function performAction(action, value) {
    if (!props.selectedIds.length || processing.value) return;
    processing.value = true;
    router.post(props.bulkRoute, {
        ticket_ids: props.selectedIds,
        action,
        value,
    }, {
        preserveScroll: true,
        onSuccess: () => emit('clear'),
        onFinish: () => { processing.value = false; },
    });
}

const statusOptions = [
    { value: 'in_progress', label: 'In Progress' },
    { value: 'waiting_on_customer', label: 'Waiting on Customer' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'critical', label: 'Critical' },
];

const selectClass = computed(() => escDark.value
    ? 'rounded-lg border border-white/10 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10'
    : 'rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none'
);
</script>

<template>
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition-all duration-150 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-full opacity-0">
        <div v-if="selectedIds.length > 0"
             :class="['fixed bottom-0 left-0 right-0 z-50 border-t px-6 py-3',
                       escDark ? 'border-white/[0.06] bg-neutral-950/95 backdrop-blur-xl' : 'border-gray-200 bg-white/95 backdrop-blur-xl shadow-lg']">
            <div class="mx-auto flex max-w-7xl items-center gap-4">
                <span :class="['text-sm font-semibold', escDark ? 'text-white' : 'text-gray-900']">
                    {{ selectedIds.length }} ticket{{ selectedIds.length !== 1 ? 's' : '' }} selected
                </span>

                <select @change="performAction('status', $event.target.value); $event.target.value = ''" :class="selectClass" :disabled="processing">
                    <option value="">Status...</option>
                    <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>

                <select @change="performAction('priority', $event.target.value); $event.target.value = ''" :class="selectClass" :disabled="processing">
                    <option value="">Priority...</option>
                    <option v-for="o in priorityOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
                </select>

                <select v-if="agents.length" @change="performAction('assign', $event.target.value); $event.target.value = ''" :class="selectClass" :disabled="processing">
                    <option value="">Assign to...</option>
                    <option v-for="a in agents" :key="a.id" :value="a.id">{{ a.name }}</option>
                </select>

                <select v-if="departments.length" @change="performAction('department', $event.target.value); $event.target.value = ''" :class="selectClass" :disabled="processing">
                    <option value="">Department...</option>
                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>

                <button @click="performAction('delete', null)"
                        :class="['rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                                 escDark ? 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/20 hover:bg-rose-500/25' : 'bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100']"
                        :disabled="processing">
                    Delete
                </button>

                <button @click="emit('clear')"
                        :class="['ml-auto rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                                 escDark ? 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700']">
                    Deselect All
                </button>
            </div>
        </div>
    </Transition>
</template>
