<template>
    <EscalatedLayout title="Newsletters">
        <div class="compose">
            <div v-if="!mailConfigured" class="compose__banner">
                {{ $t('newsletters.compose.mail_not_configured') }}
            </div>

            <header class="compose__header">
                <h1>{{ $t('newsletters.compose.title') }}</h1>
                <div class="compose__actions">
                    <button type="button" @click="save('draft')">
                        {{ $t('newsletters.compose.actions.save_draft') }}
                    </button>
                    <button type="button" @click="testSend">
                        {{ $t('newsletters.compose.actions.test_send') }}
                    </button>
                    <template v-if="canSend">
                        <button type="button" :disabled="!mailConfigured || !form.scheduled_at" @click="schedule">
                            {{ $t('newsletters.compose.actions.schedule') }}
                        </button>
                        <button type="button" class="button--primary" :disabled="!mailConfigured" @click="sendNow">
                            {{ $t('newsletters.compose.actions.send_now') }}
                        </button>
                    </template>
                </div>
            </header>

            <div class="compose__panes">
                <section class="compose__metadata">
                    <label>
                        {{ $t('newsletters.compose.subject') }}
                        <input v-model="form.subject" />
                    </label>
                    <label>
                        {{ $t('newsletters.compose.from_name') }}
                        <input v-model="form.from_name" />
                    </label>
                    <label>
                        {{ $t('newsletters.compose.from_email') }}
                        <input v-model="form.from_email" type="email" />
                    </label>
                    <label>
                        {{ $t('newsletters.compose.reply_to') }}
                        <input v-model="form.reply_to" type="email" />
                    </label>
                    <label>
                        {{ $t('newsletters.compose.list') }}
                        <select v-model="form.target_list_id">
                            <option v-for="l in lists" :key="l.id" :value="l.id">
                                {{ l.name }} ({{ l.member_count }})
                            </option>
                        </select>
                    </label>
                    <label>
                        {{ $t('newsletters.compose.template') }}
                        <select v-model="form.template_id">
                            <option :value="null">— none —</option>
                            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
                        </select>
                    </label>
                    <label>
                        {{ $t('newsletters.compose.schedule_at') }}
                        <input v-model="form.scheduled_at" type="datetime-local" />
                    </label>
                </section>

                <section class="compose__editor">
                    <div class="compose__editor-toolbar">
                        <MergeFieldDropdown @insert="insertField" />
                    </div>
                    <MarkdownEditor ref="editorRef" v-model="form.body_markdown" />
                </section>

                <section class="compose__preview">
                    <PreviewIframe :html="previewHtml" :loading="previewLoading" />
                </section>
            </div>
        </div>
    </EscalatedLayout>
</template>

<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import MarkdownEditor from '../../../components/admin/newsletters/MarkdownEditor.vue';
import MergeFieldDropdown from '../../../components/admin/newsletters/MergeFieldDropdown.vue';
import PreviewIframe from '../../../components/admin/newsletters/PreviewIframe.vue';
import { reactive, ref, toRef, computed } from 'vue';
import { router } from '@inertiajs/vue3';
import { usePreview } from './usePreview.js';

const props = defineProps({
    lists: { type: Array, required: true },
    templates: { type: Array, required: true },
    themes: { type: Array, required: true },
    mailConfigured: { type: Boolean, required: true },
    canSend: { type: Boolean, required: true },
    defaultFromEmail: { type: String, default: '' },
    defaultReplyTo: { type: String, default: '' },
    defaultTheme: { type: String, default: 'default' },
    // When present, the page is editing an existing draft/scheduled newsletter.
    newsletter: { type: Object, default: null },
});

const isEditing = computed(() => props.newsletter != null && props.newsletter.id != null);

const form = reactive({
    subject: props.newsletter?.subject ?? '',
    from_name: props.newsletter?.from_name ?? '',
    from_email: props.newsletter?.from_email ?? props.defaultFromEmail,
    reply_to: props.newsletter?.reply_to ?? props.defaultReplyTo,
    target_list_id: props.newsletter?.target_list_id ?? props.lists[0]?.id ?? null,
    template_id: props.newsletter?.template_id ?? null,
    theme: props.newsletter?.theme ?? props.defaultTheme,
    body_markdown: props.newsletter?.body_markdown ?? '',
    scheduled_at: props.newsletter?.scheduled_at ?? '',
});

const editorRef = ref(null);
const { html: previewHtml, loading: previewLoading } = usePreview(toRef(form), '/admin/newsletters/preview');

function insertField(path) {
    editorRef.value?.insertMergeField(path);
}
function save(status) {
    if (isEditing.value) {
        router.put(`/admin/newsletters/${props.newsletter.id}`, { ...form, status });
    } else {
        router.post('/admin/newsletters', { ...form, status });
    }
}
function testSend() {
    router.post('/admin/newsletters/test', form);
}
function schedule() {
    save('scheduled');
}
function sendNow() {
    save('sending');
}
</script>

<style scoped>
.compose__banner {
    background: #fef3c7;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 12px;
}
.compose__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.compose__actions {
    display: flex;
    gap: 8px;
}
.compose__panes {
    display: grid;
    grid-template-columns: 280px 1fr 1fr;
    gap: 16px;
    align-items: start;
}
.compose__metadata {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.compose__metadata label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: var(--escalated-text-muted, #64748b);
}
.compose__metadata input,
.compose__metadata select {
    padding: 8px 10px;
    border: 1px solid var(--escalated-border, #e2e8f0);
    border-radius: 6px;
    font-size: 14px;
    color: var(--escalated-text, #0f172a);
}
.compose__editor-toolbar {
    margin-bottom: 8px;
}
.compose__preview {
    height: 100%;
    min-height: 480px;
}
</style>
