<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
    statuses: { type: Array, default: () => ['open', 'in_progress', 'waiting_on_customer', 'waiting_on_agent', 'escalated', 'resolved', 'closed'] },
    priorities: { type: Array, default: () => ['low', 'medium', 'high', 'urgent', 'critical'] },
    agents: { type: Array, default: () => [] },
    departments: { type: Array, default: () => [] },
    modelValue: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);

const filters = reactive({
    status: props.modelValue.status || '',
    priority: props.modelValue.priority || '',
    assigned_to: props.modelValue.assigned_to || '',
    department_id: props.modelValue.department_id || '',
    search: props.modelValue.search || '',
});

watch(filters, (val) => {
    emit('update:modelValue', { ...val });
}, { deep: true });
</script>

<template>
    <div class="flex flex-wrap items-center gap-3">
        <input v-model="filters.search" type="text" placeholder="Search tickets..."
               class="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />

        <select v-model="filters.status" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
            <option value="">All Statuses</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s.replace(/_/g, ' ') }}</option>
        </select>

        <select v-model="filters.priority" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
            <option value="">All Priorities</option>
            <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
        </select>

        <select v-if="agents.length" v-model="filters.assigned_to" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
            <option value="">All Agents</option>
            <option v-for="a in agents" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>

        <select v-if="departments.length" v-model="filters.department_id" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
            <option value="">All Departments</option>
            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
    </div>
</template>
