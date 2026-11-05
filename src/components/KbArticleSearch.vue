<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useKbSearch } from '../composables/useKbSearch';
import { absoluteTime, relativeTime } from '../utils/agentTicket';
import PanelIcon from './PanelIcon.vue';

/**
 * Knowledge-base search for agents, used in the ticket's Related panel and
 * in the composer's "Insert article link" menu.
 *
 * In the panel each result opens the article in a new tab and, with
 * `canInsert`, has a button that inserts its link into the reply. As a
 * `picker` (the composer) choosing a result inserts its link. Internal
 * (agent-only) articles are never offered for insertion.
 */
const props = defineProps({
    /** The host's `escalated.agent.kb.search` URL. */
    searchUrl: { type: String, required: true },
    canInsert: { type: Boolean, default: false },
    picker: { type: Boolean, default: false },
    autofocus: { type: Boolean, default: false },
});

const emit = defineEmits(['insert']);
const { t } = useI18n();
const { query, results, loading, failed, searched, search } = useKbSearch(() => props.searchUrl);
const inputRef = ref(null);
const listRef = ref(null);
const now = Date.now();

onMounted(() => {
    if (props.autofocus) nextTick(() => inputRef.value?.focus());
});

function insertable(article) {
    return props.canInsert && !article.internal && !!article.url;
}

function categoryName(article) {
    const category = article.category;
    if (!category) return '';
    return typeof category === 'string' ? category : category.name || '';
}

function rowEls() {
    return [...(listRef.value?.querySelectorAll('[data-kb-row]:not([disabled])') || [])];
}

function onInputKeydown(event) {
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        rowEls()[0]?.focus();
    } else if (event.key === 'Enter') {
        event.preventDefault();
        search(query.value, { immediate: true });
    }
}

function onListKeydown(event) {
    const els = rowEls();
    const index = els.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        els[Math.min(index + 1, els.length - 1)]?.focus();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (index <= 0) inputRef.value?.focus();
        else els[index - 1]?.focus();
    }
}

function choose(article) {
    if (insertable(article)) emit('insert', article);
}

defineExpose({ focus: () => inputRef.value?.focus() });
</script>

<template>
    <div data-testid="esc-kb-search">
        <label class="relative block">
            <span class="sr-only">{{ t('agent_panel.kb.search') }}</span>
            <PanelIcon
                name="search"
                class="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-[var(--esc-panel-text-muted)]"
            />
            <input
                ref="inputRef"
                :value="query"
                type="search"
                :placeholder="t('agent_panel.kb.search_placeholder')"
                maxlength="200"
                class="h-8 w-full rounded-[var(--esc-radius,6px)] border border-[var(--esc-panel-border-input)] bg-transparent pl-8 pr-2 text-[13px] text-[var(--esc-panel-text)] placeholder-[var(--esc-panel-text-tertiary)] focus:border-[var(--esc-panel-accent)] focus:outline-none"
                data-testid="esc-kb-search-input"
                @input="search($event.target.value)"
                @keydown="onInputKeydown"
            />
        </label>

        <ul
            v-if="results.length"
            ref="listRef"
            :class="['mt-1.5', picker ? 'max-h-64 overflow-y-auto' : '']"
            :aria-label="t('agent_panel.kb.results')"
            data-testid="esc-kb-results"
            @keydown="onListKeydown"
        >
            <li v-for="article in results" :key="article.id" class="group relative">
                <component
                    :is="picker ? 'button' : 'a'"
                    :type="picker ? 'button' : undefined"
                    :href="picker ? undefined : article.url"
                    :target="picker ? undefined : '_blank'"
                    :rel="picker ? undefined : 'noopener noreferrer'"
                    :disabled="picker && !insertable(article) ? true : undefined"
                    :title="article.title"
                    data-kb-row
                    :class="[
                        '-mx-2 flex w-[calc(100%+1rem)] min-w-0 flex-col rounded-[var(--esc-radius,6px)] px-2 py-1.5 text-left hover:bg-[var(--esc-panel-hover)] focus-visible:bg-[var(--esc-panel-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--esc-panel-accent)] disabled:cursor-not-allowed disabled:opacity-60',
                        !picker && insertable(article) ? 'pr-9' : '',
                    ]"
                    data-testid="esc-kb-result"
                    @click="picker && choose(article)"
                >
                    <span class="flex min-w-0 items-center gap-1.5 text-[13px] text-[var(--esc-panel-text)]">
                        <PanelIcon
                            v-if="article.internal"
                            name="lock"
                            class="h-3.5 w-3.5 shrink-0 text-[var(--esc-panel-text-tertiary)]"
                        />
                        <span class="truncate">{{ article.title }}</span>
                    </span>
                    <span class="block truncate text-[12px] leading-4 text-[var(--esc-panel-text-tertiary)]">
                        <template v-if="article.internal">{{ t('agent_panel.kb.internal') }} &middot; </template>
                        <template v-if="categoryName(article)">{{ categoryName(article) }} &middot; </template>
                        <time
                            v-if="article.updated_at"
                            :datetime="article.updated_at"
                            :title="absoluteTime(article.updated_at)"
                            >{{ t('agent_panel.kb.updated', { time: relativeTime(article.updated_at, t, now) }) }}</time
                        >
                    </span>
                    <span
                        v-if="article.excerpt"
                        class="mt-0.5 line-clamp-2 text-[12px] leading-4 text-[var(--esc-panel-text-secondary)]"
                        >{{ article.excerpt }}</span
                    >
                </component>
                <button
                    v-if="!picker && insertable(article)"
                    type="button"
                    class="absolute right-0 top-1 flex h-7 w-7 items-center justify-center rounded-[var(--esc-radius,6px)] text-[var(--esc-panel-text-tertiary)] opacity-0 hover:bg-[var(--esc-panel-active)] hover:text-[var(--esc-panel-text)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--esc-panel-accent)] group-focus-within:opacity-100 group-hover:opacity-100"
                    :aria-label="t('agent_panel.kb.insert_link_to', { title: article.title })"
                    :title="t('agent_panel.kb.insert_link')"
                    data-testid="esc-kb-insert"
                    @click="choose(article)"
                >
                    <PanelIcon name="link" class="h-4 w-4" />
                </button>
            </li>
        </ul>
        <p
            v-else-if="loading"
            class="mt-2 text-[12px] text-[var(--esc-panel-text-tertiary)]"
            role="status"
            data-testid="esc-kb-loading"
        >
            {{ t('agent_panel.kb.searching') }}
        </p>
        <p
            v-else-if="failed"
            class="mt-2 text-[12px] text-[var(--esc-panel-text-tertiary)]"
            role="status"
            data-testid="esc-kb-failed"
        >
            {{ t('agent_panel.kb.failed') }}
        </p>
        <p
            v-else-if="searched"
            class="mt-2 text-[12px] text-[var(--esc-panel-text-tertiary)]"
            role="status"
            data-testid="esc-kb-empty"
        >
            {{ t('agent_panel.kb.no_results') }}
        </p>
        <p v-else-if="picker" class="mt-2 text-[12px] text-[var(--esc-panel-text-tertiary)]">
            {{ t('agent_panel.kb.hint') }}
        </p>
    </div>
</template>
