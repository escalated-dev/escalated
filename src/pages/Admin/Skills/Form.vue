<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    skill: { type: Object, default: null },
});

const form = useForm({
    name: props.skill?.name || '',
});

function submit() {
    if (props.skill) {
        form.put(route('escalated.admin.skills.update', props.skill.id));
    } else {
        form.post(route('escalated.admin.skills.store'));
    }
}
</script>

<template>
    <EscalatedLayout :title="skill ? 'Edit Skill' : 'Create Skill'">
        <form class="max-w-lg space-y-4" @submit.prevent="submit">
            <div>
                <label class="block text-sm font-medium text-neutral-300">Name</label>
                <input
                    v-model="form.name"
                    type="text"
                    required
                    class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                />
                <p v-if="form.errors.name" class="mt-1 text-xs text-rose-400">{{ form.errors.name }}</p>
            </div>

            <div class="flex gap-3">
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50"
                >
                    {{ skill ? 'Update' : 'Create' }}
                </button>
                <a
                    :href="route('escalated.admin.skills.index')"
                    class="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.06]"
                >
                    Cancel
                </a>
            </div>
        </form>
    </EscalatedLayout>
</template>
