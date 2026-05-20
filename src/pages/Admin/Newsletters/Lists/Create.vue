<template>
    <EscalatedLayout title="New list">
        <form class="lists-create" @submit.prevent="submit">
            <h1>{{ $t('newsletters.lists.new') }}</h1>
            <label>
                Name
                <input v-model="form.name" required />
            </label>
            <label>
                Description
                <textarea v-model="form.description" />
            </label>
            <fieldset>
                <legend>Kind</legend>
                <label class="radio">
                    <input v-model="form.kind" type="radio" value="static" />
                    {{ $t('newsletters.lists.kind.static') }}
                </label>
                <p class="help">{{ $t('newsletters.lists.create.static_help') }}</p>
                <label class="radio">
                    <input v-model="form.kind" type="radio" value="dynamic" />
                    {{ $t('newsletters.lists.kind.dynamic') }}
                </label>
                <p class="help">{{ $t('newsletters.lists.create.dynamic_help') }}</p>
            </fieldset>
            <button type="submit">Create</button>
        </form>
    </EscalatedLayout>
</template>

<script setup>
import EscalatedLayout from '../../../../components/EscalatedLayout.vue';
import { reactive } from 'vue';
import { router } from '@inertiajs/vue3';

const form = reactive({ name: '', description: '', kind: 'static' });
function submit() {
    router.post('/admin/newsletters/lists', form);
}
</script>

<style scoped>
.lists-create {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 480px;
}
.lists-create label {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.lists-create label.radio {
    flex-direction: row;
    align-items: center;
    gap: 8px;
}
.help {
    color: var(--escalated-text-muted, #64748b);
    font-size: 12px;
    margin: 0 0 8px 24px;
}
</style>
