import { onBeforeUnmount, ref } from 'vue';
import { requestJson } from '../utils/agentApi';

export const KB_MIN_QUERY = 2;
const MAX_QUERY = 200;

/**
 * Knowledge-base search for agents (ADR 2026-11-05-agent-panel-data):
 * `GET escalated.agent.kb.search?q=` answering
 * `{ data: [{ id, title, excerpt, url, category, updated_at, internal? }] }`.
 *
 * `url` is the host's search route ('' turns search off). Queries shorter
 * than two characters clear the results; typing is debounced and a late
 * answer for an older query is ignored.
 */
export function useKbSearch(url, { limit = 8, delay = 250 } = {}) {
    const query = ref('');
    const results = ref([]);
    const loading = ref(false);
    const failed = ref(false);
    const searched = ref(false);
    let timer = null;
    let request = 0;

    async function run(term) {
        const target = typeof url === 'function' ? url() : (url?.value ?? url);
        if (!target) return;
        const mine = ++request;
        loading.value = true;
        failed.value = false;
        try {
            const data = await requestJson(target, { params: { q: term, limit } });
            if (mine !== request) return;
            results.value = Array.isArray(data?.data) ? data.data : [];
            searched.value = true;
        } catch {
            if (mine !== request) return;
            results.value = [];
            failed.value = true;
        } finally {
            if (mine === request) loading.value = false;
        }
    }

    function search(value, { immediate = false } = {}) {
        query.value = value;
        clearTimeout(timer);
        const term = String(value || '')
            .trim()
            .slice(0, MAX_QUERY);
        if (term.length < KB_MIN_QUERY) {
            request++;
            results.value = [];
            loading.value = false;
            failed.value = false;
            searched.value = false;
            return;
        }
        if (immediate) run(term);
        else timer = setTimeout(() => run(term), delay);
    }

    function reset() {
        search('');
    }

    onBeforeUnmount(() => clearTimeout(timer));

    return { query, results, loading, failed, searched, search, reset };
}

/** An HTML link to an article, as the composer inserts it. */
export function articleLink(article) {
    const escape = (value) =>
        String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    return `<a href="${escape(article.url)}">${escape(article.title)}</a>`;
}
