<template>
    <div class="merge-field-dropdown">
        <button type="button" class="merge-field-dropdown__toggle" @click="open = !open">
            {{ $t('newsletters.merge_fields.label') }} ▾
        </button>
        <ul v-if="open" class="merge-field-dropdown__menu">
            <li v-for="opt in options" :key="opt.path" :data-path="opt.path" @click="pick(opt.path)">
                <code>{{ tokenFor(opt.path) }}</code>
                <span class="merge-field-dropdown__hint">{{ opt.label }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    metadataKeys: { type: Array, default: () => [] },
});

const emit = defineEmits(['insert']);
const open = ref(false);

const options = computed(() => [
    { path: 'contact.name', label: 'Contact full name' },
    { path: 'contact.first_name', label: 'Contact first name' },
    { path: 'contact.email', label: 'Contact email' },
    { path: 'unsubscribe_url', label: 'Unsubscribe URL' },
    { path: 'view_in_browser_url', label: 'View-in-browser URL' },
    ...props.metadataKeys.map((k) => ({ path: `contact.metadata.${k}`, label: `Metadata: ${k}` })),
]);

function pick(path) {
    emit('insert', path);
    open.value = false;
}

function tokenFor(path) {
    return `{{ ${path} }}`;
}
</script>

<style scoped>
.merge-field-dropdown {
    position: relative;
    display: inline-block;
}
.merge-field-dropdown__toggle {
    padding: 6px 10px;
    border: 1px solid var(--escalated-border, #e2e8f0);
    background: white;
    border-radius: 4px;
    cursor: pointer;
}
.merge-field-dropdown__menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 10;
    margin: 4px 0 0;
    padding: 4px 0;
    min-width: 280px;
    list-style: none;
    background: white;
    border: 1px solid var(--escalated-border, #e2e8f0);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.merge-field-dropdown__menu li {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    gap: 12px;
}
.merge-field-dropdown__menu li:hover {
    background: var(--escalated-bg-hover, #f7fafc);
}
.merge-field-dropdown__hint {
    color: var(--escalated-text-muted, #64748b);
    font-size: 12px;
}
</style>
