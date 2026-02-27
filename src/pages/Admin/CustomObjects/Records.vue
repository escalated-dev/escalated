<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, router } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const props = defineProps({
    object: Object,
    records: { type: Array, default: () => [] },
});

const fields = computed(() => props.object.fields_schema || []);
const editingId = ref(null);
const showAddForm = ref(false);

const newRecordForm = useForm({
    data: {},
});

const editForm = useForm({
    data: {},
});

function startAdd() {
    const data = {};
    fields.value.forEach((f) => {
        data[f.name] = '';
    });
    newRecordForm.data = data;
    showAddForm.value = true;
}

function addRecord() {
    newRecordForm.post(route('escalated.admin.custom-objects.records.store', props.object.id), {
        preserveScroll: true,
        onSuccess: () => {
            showAddForm.value = false;
            newRecordForm.reset();
        },
    });
}

function startEdit(record) {
    editingId.value = record.id;
    editForm.data = { ...(record.data || {}) };
}

function saveEdit(record) {
    editForm.put(route('escalated.admin.custom-objects.records.update', [props.object.id, record.id]), {
        preserveScroll: true,
        onSuccess: () => {
            editingId.value = null;
        },
    });
}

function cancelEdit() {
    editingId.value = null;
}

function deleteRecord(record) {
    if (confirm('Delete this record?')) {
        router.delete(route('escalated.admin.custom-objects.records.destroy', [props.object.id, record.id]), {
            preserveScroll: true,
        });
    }
}
</script>

<template>
    <EscalatedLayout :title="`${object.name} Records`">
        <div class="mb-6 flex items-center justify-between">
            <div>
                <h2 class="text-lg font-semibold text-neutral-200">{{ object.name }} Records</h2>
                <p class="mt-1 text-sm text-neutral-500">{{ records.length }} records</p>
            </div>
            <button
                type="button"
                class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
                @click="startAdd"
            >
                Add Record
            </button>
        </div>

        <!-- Add Record Form -->
        <div v-if="showAddForm" class="mb-6 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
            <h3 class="mb-4 text-sm font-semibold text-white">New Record</h3>
            <form class="space-y-3" @submit.prevent="addRecord">
                <div v-for="field in fields" :key="field.name">
                    <label class="block text-xs font-medium text-neutral-400">
                        {{ field.name }}
                        <span v-if="field.required" class="text-rose-400">*</span>
                    </label>
                    <select
                        v-if="field.type === 'select'"
                        v-model="newRecordForm.data[field.name]"
                        class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                    >
                        <option value="">Select...</option>
                        <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <input
                        v-else-if="field.type === 'date'"
                        v-model="newRecordForm.data[field.name]"
                        type="date"
                        class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                    />
                    <input
                        v-else-if="field.type === 'number'"
                        v-model="newRecordForm.data[field.name]"
                        type="number"
                        class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                    />
                    <input
                        v-else
                        v-model="newRecordForm.data[field.name]"
                        type="text"
                        class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                    />
                </div>
                <div class="flex gap-2">
                    <button
                        type="submit"
                        :disabled="newRecordForm.processing"
                        class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-1.5 text-sm font-medium text-white"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        class="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-neutral-400"
                        @click="showAddForm = false"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>

        <!-- Records Table -->
        <div v-if="records.length" class="overflow-hidden rounded-xl border border-white/[0.06]">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-white/[0.06] bg-white/[0.02]">
                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                            ID
                        </th>
                        <th
                            v-for="field in fields"
                            :key="field.name"
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500"
                        >
                            {{ field.name }}
                        </th>
                        <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                    <tr v-for="record in records" :key="record.id" class="hover:bg-white/[0.02]">
                        <td class="px-4 py-3 text-sm text-neutral-500">{{ record.id }}</td>
                        <td v-for="field in fields" :key="field.name" class="px-4 py-3">
                            <!-- Edit mode -->
                            <template v-if="editingId === record.id">
                                <input
                                    v-model="editForm.data[field.name]"
                                    :type="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
                                    class="w-full rounded border border-white/10 bg-neutral-900 px-2 py-1 text-sm text-neutral-200 focus:border-white/20 focus:outline-none"
                                />
                            </template>
                            <!-- View mode -->
                            <template v-else>
                                <span class="text-sm text-neutral-300">
                                    {{ record.data?.[field.name] || '---' }}
                                </span>
                            </template>
                        </td>
                        <td class="px-4 py-3 text-right">
                            <template v-if="editingId === record.id">
                                <button
                                    class="mr-2 text-sm text-emerald-400 hover:text-emerald-300"
                                    @click="saveEdit(record)"
                                >
                                    Save
                                </button>
                                <button class="text-sm text-neutral-500 hover:text-neutral-300" @click="cancelEdit">
                                    Cancel
                                </button>
                            </template>
                            <template v-else>
                                <button
                                    class="mr-2 text-sm text-neutral-500 hover:text-neutral-200"
                                    @click="startEdit(record)"
                                >
                                    Edit
                                </button>
                                <button
                                    class="text-sm text-red-500/60 hover:text-red-400"
                                    @click="deleteRecord(record)"
                                >
                                    Delete
                                </button>
                            </template>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div
            v-else-if="!showAddForm"
            class="rounded-xl border border-dashed border-white/[0.08] px-6 py-12 text-center"
        >
            <p class="text-sm text-neutral-500">No records yet.</p>
        </div>
    </EscalatedLayout>
</template>
