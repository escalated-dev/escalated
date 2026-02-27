<script setup>
import { computed } from 'vue';

const props = defineProps({
    categories: { type: Array, default: () => [] },
    level: { type: Number, default: 0 },
    parentId: { type: [Number, null], default: null },
});

defineEmits(['edit', 'delete']);

const children = computed(() => {
    return props.categories.filter((c) => {
        if (props.parentId === null) return !c.parent_id;
        return c.parent_id === props.parentId;
    });
});
</script>

<template>
    <div>
        <div v-for="category in children" :key="category.id">
            <div
                :class="[
                    'flex items-center justify-between rounded-lg border border-white/[0.06] bg-neutral-900/60 px-4 py-3 mb-1.5',
                ]"
                :style="{ marginLeft: level * 24 + 'px' }"
            >
                <div class="flex items-center gap-3">
                    <svg
                        class="h-4 w-4 text-neutral-600"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                        />
                    </svg>
                    <div>
                        <span class="text-sm font-medium text-neutral-200">{{ category.name }}</span>
                        <span v-if="category.articles_count !== undefined" class="ml-2 text-xs text-neutral-500">
                            {{ category.articles_count }} articles
                        </span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-neutral-600">pos: {{ category.position }}</span>
                    <button
                        type="button"
                        class="rounded p-1 text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-300"
                        @click="$emit('edit', category)"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                        </svg>
                    </button>
                    <button
                        type="button"
                        class="rounded p-1 text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
                        @click="$emit('delete', category)"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                        </svg>
                    </button>
                </div>
            </div>
            <CategoryTree
                :categories="categories"
                :level="level + 1"
                :parent-id="category.id"
                @edit="$emit('edit', $event)"
                @delete="$emit('delete', $event)"
            />
        </div>
    </div>
</template>
