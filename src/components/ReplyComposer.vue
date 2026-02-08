<script setup>
import { ref, computed, inject } from 'vue';
import { router } from '@inertiajs/vue3';
import FileDropzone from './FileDropzone.vue';

const props = defineProps({
    action: { type: String, required: true },
    cannedResponses: { type: Array, default: () => [] },
    allowNotes: { type: Boolean, default: false },
    placeholder: { type: String, default: 'Type your reply...' },
    submitLabel: { type: String, default: null },
});

const emit = defineEmits(['submit']);
const escDark = inject('esc-dark', computed(() => false));

const body = ref('');
const isNote = ref(false);
const files = ref([]);
const submitting = ref(false);

function insertCanned(response) {
    body.value += response.body;
}

function handleFiles(newFiles) {
    files.value = [...files.value, ...newFiles];
}

function removeFile(index) {
    files.value.splice(index, 1);
}

function submit() {
    if (!body.value.trim() || submitting.value) return;
    submitting.value = true;

    const payload = {
        body: body.value,
        is_internal_note: isNote.value,
        attachments: files.value,
    };

    emit('submit', payload);

    router.post(props.action, payload, {
        preserveScroll: true,
        onSuccess: () => {
            body.value = '';
            files.value = [];
            isNote.value = false;
        },
        onFinish: () => {
            submitting.value = false;
        },
    });
}

const buttonLabel = computed(() => {
    if (props.submitLabel) return props.submitLabel;
    return isNote.value ? 'Add Note' : 'Send Reply';
});
</script>

<template>
    <!-- Dark mode -->
    <div v-if="escDark.value" class="rounded-xl border border-white/[0.06] bg-gray-900/60 p-4">
        <div v-if="allowNotes" class="mb-3 flex gap-2">
            <button @click="isNote = false"
                    :class="['rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', !isNote ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/20' : 'text-gray-400 hover:bg-white/[0.04]']">
                Reply
            </button>
            <button @click="isNote = true"
                    :class="['rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', isNote ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20' : 'text-gray-400 hover:bg-white/[0.04]']">
                Internal Note
            </button>
        </div>

        <div v-if="isNote" class="mb-2 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs text-amber-400 ring-1 ring-amber-500/20">
            This note is only visible to agents.
        </div>

        <textarea v-model="body" rows="4" :placeholder="placeholder"
                  class="w-full rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"></textarea>

        <FileDropzone @files="handleFiles" class="mt-2" />

        <div v-if="files.length" class="mt-2 space-y-1">
            <div v-for="(file, i) in files" :key="i" class="flex items-center gap-2 text-sm text-gray-400">
                <span>{{ file.name }}</span>
                <button @click="removeFile(i)" class="text-rose-400 hover:text-rose-300">&times;</button>
            </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
            <div v-if="cannedResponses.length">
                <select @change="insertCanned(cannedResponses[$event.target.value]); $event.target.value = ''"
                        class="rounded-lg border border-white/10 bg-gray-900 px-2 py-1 text-xs text-gray-400">
                    <option value="">Canned responses...</option>
                    <option v-for="(cr, i) in cannedResponses" :key="cr.id" :value="i">{{ cr.title }}</option>
                </select>
            </div>
            <div v-else></div>
            <button @click="submit" :disabled="!body.trim() || submitting"
                    :class="['rounded-lg px-4 py-2 text-sm font-medium text-white transition-all',
                             isNote ? 'bg-amber-500 hover:bg-amber-400' : 'bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400',
                             (!body.trim() || submitting) && 'cursor-not-allowed opacity-40']">
                {{ buttonLabel }}
            </button>
        </div>
    </div>

    <!-- Light mode -->
    <div v-else class="rounded-lg border border-gray-200 bg-white p-4">
        <div v-if="allowNotes" class="mb-3 flex gap-2">
            <button @click="isNote = false"
                    :class="['rounded-md px-3 py-1 text-sm font-medium', !isNote ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100']">
                Reply
            </button>
            <button @click="isNote = true"
                    :class="['rounded-md px-3 py-1 text-sm font-medium', isNote ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-100']">
                Internal Note
            </button>
        </div>

        <div v-if="isNote" class="mb-2 rounded bg-yellow-50 px-3 py-1.5 text-xs text-yellow-700">
            This note is only visible to agents.
        </div>

        <textarea v-model="body" rows="4" :placeholder="placeholder"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>

        <FileDropzone @files="handleFiles" class="mt-2" />

        <div v-if="files.length" class="mt-2 space-y-1">
            <div v-for="(file, i) in files" :key="i" class="flex items-center gap-2 text-sm text-gray-600">
                <span>{{ file.name }}</span>
                <button @click="removeFile(i)" class="text-red-500 hover:text-red-700">&times;</button>
            </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
            <div v-if="cannedResponses.length">
                <select @change="insertCanned(cannedResponses[$event.target.value]); $event.target.value = ''"
                        class="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600">
                    <option value="">Canned responses...</option>
                    <option v-for="(cr, i) in cannedResponses" :key="cr.id" :value="i">{{ cr.title }}</option>
                </select>
            </div>
            <div v-else></div>
            <button @click="submit" :disabled="!body.trim() || submitting"
                    :class="['rounded-md px-4 py-2 text-sm font-medium text-white',
                             isNote ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700',
                             (!body.trim() || submitting) && 'cursor-not-allowed opacity-50']">
                {{ buttonLabel }}
            </button>
        </div>
    </div>
</template>
