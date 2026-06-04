<template>
    <EscalatedLayout :title="isNew ? 'New template' : template.name">
        <form class="templates-show" @submit.prevent="save">
            <header>
                <h1>{{ isNew ? $t('newsletters.templates.new') : template.name }}</h1>
            </header>
            <label>
                {{ $t('newsletters.templates.columns.name') }}
                <input v-model="form.name" required />
            </label>
            <label>
                {{ $t('newsletters.templates.theme') }}
                <select v-model="form.theme">
                    <option v-for="t in themes" :key="t" :value="t">{{ t }}</option>
                </select>
            </label>
            <label>
                {{ $t('newsletters.templates.subject_template') }}
                <input v-model="form.subject_template" />
            </label>
            <div class="editor-section">
                <div class="editor-toolbar"><MergeFieldDropdown @insert="onInsert" /></div>
                <MarkdownEditor ref="editorRef" v-model="form.body_markdown" />
            </div>
            <button type="submit">{{ $t('form.save') }}</button>
        </form>
    </EscalatedLayout>
</template>

<script setup>
import EscalatedLayout from '../../../../components/EscalatedLayout.vue';
import MarkdownEditor from '../../../../components/admin/newsletters/MarkdownEditor.vue';
import MergeFieldDropdown from '../../../../components/admin/newsletters/MergeFieldDropdown.vue';
import { reactive, ref } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    template: { type: Object, required: true },
    themes: { type: Array, required: true },
    isNew: { type: Boolean, default: false },
});

const form = reactive({ ...props.template });
const editorRef = ref(null);

function save() {
    if (props.isNew) router.post('/admin/newsletters/templates', form);
    else router.put(`/admin/newsletters/templates/${props.template.id}`, form);
}
function onInsert(path) {
    editorRef.value?.insertMergeField(path);
}
</script>

<style scoped>
.templates-show {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 800px;
}
.editor-toolbar {
    margin-bottom: 8px;
}
</style>
