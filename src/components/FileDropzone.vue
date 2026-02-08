<script setup>
import { ref, computed, inject } from 'vue';

const emit = defineEmits(['files']);
const dark = inject('esc-dark', computed(() => false));

const dragging = ref(false);
const fileInput = ref(null);

function onDrop(e) {
    dragging.value = false;
    if (e.dataTransfer?.files?.length) {
        emit('files', Array.from(e.dataTransfer.files));
    }
}

function onFileSelect(e) {
    if (e.target.files?.length) {
        emit('files', Array.from(e.target.files));
        e.target.value = '';
    }
}

function browse() {
    fileInput.value?.click();
}
</script>

<template>
    <div @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop"
         :class="['cursor-pointer rounded-lg border-2 border-dashed px-4 py-3 text-center text-xs transition-colors',
                  dark
                      ? (dragging ? 'border-white/20 bg-white/[0.04]' : 'border-white/[0.08] hover:border-white/[0.12]')
                      : (dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400')]"
         @click="browse">
        <p :class="dark ? 'text-neutral-500' : 'text-gray-500'">
            Drop files here or <span :class="['font-medium', dark ? 'text-white' : 'text-blue-600']">browse</span>
        </p>
        <input ref="fileInput" type="file" multiple class="hidden" @change="onFileSelect" />
    </div>
</template>
