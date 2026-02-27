<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import PermissionMatrix from '../../../components/PermissionMatrix.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    role: { type: Object, default: null },
    permissions: { type: Object, default: () => ({}) },
});

const form = useForm({
    name: props.role?.name || '',
    description: props.role?.description || '',
    permissions: props.role?.permissions?.map((p) => p.id) || [],
});

function submit() {
    if (props.role) {
        form.put(route('escalated.admin.roles.update', props.role.id));
    } else {
        form.post(route('escalated.admin.roles.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="role ? 'Edit Role' : 'New Role'">
        <form
            class="mx-auto max-w-3xl space-y-5 rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6"
            @submit.prevent="submit"
        >
            <div>
                <label class="block text-sm font-medium text-neutral-300">Name</label>
                <input
                    v-model="form.name"
                    type="text"
                    required
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
                <div v-if="form.errors.name" class="mt-1 text-sm text-rose-400">{{ form.errors.name }}</div>
            </div>

            <div>
                <label class="block text-sm font-medium text-neutral-300">Description</label>
                <textarea
                    v-model="form.description"
                    rows="2"
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                ></textarea>
            </div>

            <div>
                <label class="mb-2 block text-sm font-medium text-neutral-300">Permissions</label>
                <PermissionMatrix v-model="form.permissions" :permissions="permissions" />
                <div v-if="form.errors.permissions" class="mt-1 text-sm text-rose-400">
                    {{ form.errors.permissions }}
                </div>
            </div>

            <div class="flex justify-end">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50"
                >
                    {{ role ? 'Update' : 'Create' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
