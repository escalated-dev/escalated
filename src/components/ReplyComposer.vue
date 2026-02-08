<script setup>
import { ref } from 'vue';
import FileDropzone from './FileDropzone.vue';

const props = defineProps({
    ticketId: { type: [Number, String], required: true },
    cannedResponses: { type: Array, default: () => [] },
    allowNotes: { type: Boolean, default: false },
});

const emit = defineEmits(['submit']);

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
    if (!body.value.trim()) return;
    submitting.value = true;
    emit('submit', {
        body: body.value,
        is_internal_note: isNote.value,
        attachments: files.value,
    });
    body.value = '';
    files.value = [];
    isNote.value = false;
    submitting.value = false;
}
</script>

<template>
    <div class="rounded-lg border border-gray-200 bg-white p-4">
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

        <textarea v-model="body" rows="4" placeholder="Type your reply..."
                  class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>

        <FileDropzone @files="handleFiles" class="mt-2" />

        <div v-if="files.length" class="mt-2 space-y-1">
            <div v-for="(file, i) in files" :key="i" class="flex items-center gap-2 text-sm text-gray-600">
                <span>📎 {{ file.name }}</span>
                <button @click="removeFile(i)" class="text-red-500 hover:text-red-700">&times;</button>
            </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
            <div v-if="cannedResponses.length" class="relative">
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
                {{ isNote ? 'Add Note' : 'Send Reply' }}
            </button>
        </div>
    </div>
</template>
