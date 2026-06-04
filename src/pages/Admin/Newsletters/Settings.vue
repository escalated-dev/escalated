<template>
    <EscalatedLayout title="Newsletter settings">
        <form class="settings" @submit.prevent="save">
            <h1>{{ $t('newsletters.settings.title') }}</h1>
            <label>
                {{ $t('newsletters.settings.default_from') }}
                <input v-model="form.default_from" name="default_from" type="email" />
            </label>
            <label>
                {{ $t('newsletters.settings.default_reply_to') }}
                <input v-model="form.default_reply_to" name="default_reply_to" type="email" />
            </label>
            <label>
                {{ $t('newsletters.settings.default_theme') }}
                <select v-model="form.default_theme" name="default_theme">
                    <option v-for="t in themes" :key="t" :value="t">{{ t }}</option>
                </select>
            </label>
            <label>
                {{ $t('newsletters.settings.rate_limit') }}
                <input v-model.number="form.rate_limit_per_minute" type="number" min="1" />
            </label>
            <label>
                {{ $t('newsletters.settings.batch_size') }}
                <input v-model.number="form.batch_size" type="number" min="1" />
            </label>
            <label class="checkbox">
                <input v-model="form.tracking_enabled" name="tracking_enabled" type="checkbox" />
                {{ $t('newsletters.settings.tracking_enabled') }}
            </label>
            <p class="help">{{ $t('newsletters.settings.tracking_help') }}</p>
            <button type="submit">{{ $t('form.save') }}</button>
        </form>
    </EscalatedLayout>
</template>

<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { reactive } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    settings: { type: Object, required: true },
    themes: { type: Array, required: true },
});

const form = reactive({ ...props.settings });
function save() {
    router.put('/admin/newsletters/settings', form);
}
</script>

<style scoped>
.settings {
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.settings label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--escalated-text-muted, #64748b);
}
.settings label.checkbox {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--escalated-text, #0f172a);
}
.settings input,
.settings select {
    padding: 8px 10px;
    border: 1px solid var(--escalated-border, #e2e8f0);
    border-radius: 6px;
    font-size: 14px;
}
.help {
    color: var(--escalated-text-muted, #64748b);
    font-size: 12px;
}
</style>
