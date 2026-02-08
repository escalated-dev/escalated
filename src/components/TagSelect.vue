<script setup>
import { ref, computed, inject } from 'vue';

const props = defineProps({
    tags: { type: Array, required: true },
    modelValue: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue']);
const dark = inject('esc-dark', computed(() => false));

const search = ref('');

const filteredTags = computed(() => {
    if (!search.value) return props.tags;
    const q = search.value.toLowerCase();
    return props.tags.filter(t => t.name.toLowerCase().includes(q));
});

function toggle(tagId) {
    const current = [...props.modelValue];
    const index = current.indexOf(tagId);
    if (index >= 0) {
        current.splice(index, 1);
    } else {
        current.push(tagId);
    }
    emit('update:modelValue', current);
}

function isSelected(tagId) {
    return props.modelValue.includes(tagId);
}
</script>

<template>
    <div>
        <label :class="['mb-1 block text-xs font-medium', dark ? 'text-neutral-500' : 'text-gray-600']">Tags</label>
        <input v-model="search" type="text" placeholder="Filter tags..."
               :class="['mb-2 w-full rounded-md border px-2 py-1 text-xs focus:outline-none',
                        dark ? 'border-white/10 bg-neutral-950 text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:ring-1 focus:ring-white/10' : 'border-gray-300 focus:border-blue-500']" />
        <div class="flex flex-wrap gap-1">
            <button v-for="tag in filteredTags" :key="tag.id" @click="toggle(tag.id)"
                    :class="['rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
                             dark
                                 ? (isSelected(tag.id) ? 'bg-white/[0.12] text-white ring-1 ring-white/20' : 'bg-white/[0.04] text-neutral-500 hover:bg-white/[0.08]')
                                 : (isSelected(tag.id) ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')]"
                    :style="tag.color ? { backgroundColor: isSelected(tag.id) ? tag.color + '33' : undefined, color: isSelected(tag.id) ? tag.color : undefined } : {}">
                {{ tag.name }}
            </button>
        </div>
    </div>
</template>
