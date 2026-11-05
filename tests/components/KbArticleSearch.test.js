import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import KbArticleSearch from '../../src/components/KbArticleSearch.vue';
import { articleLink } from '../../src/composables/useKbSearch';

const articles = [
    {
        id: 1,
        title: 'Exporting reports to CSV',
        excerpt: 'Reports can be exported from the dashboard.',
        url: 'https://example.com/support/kb/exporting-reports',
        category: { id: 3, name: 'Reports' },
        updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
        id: 2,
        title: 'Export service runbook',
        excerpt: 'Restart the export worker.',
        url: 'https://example.com/support/kb/export-runbook',
        category: null,
        updated_at: null,
        internal: true,
    },
];

let wrapper;

beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: articles }) })),
    );
});

afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

async function typeQuery(value) {
    const input = wrapper.get('[data-testid="esc-kb-search-input"]');
    input.element.value = value;
    await input.trigger('input');
    vi.advanceTimersByTime(300);
    await flushPromises();
}

describe('KbArticleSearch', () => {
    it('searches after a pause, with the query and a limit', async () => {
        wrapper = mount(KbArticleSearch, { props: { searchUrl: '/support/agent/kb/search' } });
        await typeQuery('export');
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toBe('/support/agent/kb/search?q=export&limit=8');
        const rows = wrapper.findAll('[data-testid="esc-kb-result"]');
        expect(rows).toHaveLength(2);
        expect(rows[0].text()).toContain('Exporting reports to CSV');
        expect(rows[0].text()).toContain('Reports');
        expect(rows[0].text()).toContain('Updated 3d ago');
        expect(rows[0].text()).toContain('Reports can be exported');
        expect(rows[0].attributes('href')).toBe('https://example.com/support/kb/exporting-reports');
        expect(rows[0].attributes('target')).toBe('_blank');
    });

    it('does not search under two characters', async () => {
        wrapper = mount(KbArticleSearch, { props: { searchUrl: '/kb' } });
        await typeQuery('e');
        expect(fetch).not.toHaveBeenCalled();
        expect(wrapper.find('[data-testid="esc-kb-empty"]').exists()).toBe(false);
    });

    it('marks internal articles and never offers to insert them', async () => {
        wrapper = mount(KbArticleSearch, { props: { searchUrl: '/kb', canInsert: true } });
        await typeQuery('export');
        const rows = wrapper.findAll('li');
        expect(rows[1].text()).toContain('Internal');
        expect(rows[0].find('[data-testid="esc-kb-insert"]').exists()).toBe(true);
        expect(rows[1].find('[data-testid="esc-kb-insert"]').exists()).toBe(false);
        await rows[0].get('[data-testid="esc-kb-insert"]').trigger('click');
        expect(wrapper.emitted('insert')[0][0]).toMatchObject({ id: 1 });
    });

    it('offers no insert button without canInsert', async () => {
        wrapper = mount(KbArticleSearch, { props: { searchUrl: '/kb' } });
        await typeQuery('export');
        expect(wrapper.find('[data-testid="esc-kb-insert"]').exists()).toBe(false);
    });

    it('as a picker inserts the chosen article and disables internal ones', async () => {
        wrapper = mount(KbArticleSearch, { props: { searchUrl: '/kb', canInsert: true, picker: true } });
        expect(wrapper.text()).toContain('Type at least 2 characters.');
        await typeQuery('export');
        const rows = wrapper.findAll('[data-testid="esc-kb-result"]');
        expect(rows[0].element.tagName).toBe('BUTTON');
        expect(rows[1].attributes('disabled')).toBeDefined();
        await rows[0].trigger('click');
        expect(wrapper.emitted('insert')).toHaveLength(1);
    });

    it('says when nothing matches and when the search fails', async () => {
        fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) }));
        wrapper = mount(KbArticleSearch, { props: { searchUrl: '/kb' } });
        await typeQuery('zzz');
        expect(wrapper.get('[data-testid="esc-kb-empty"]').text()).toBe('No articles match.');
        fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, status: 500 }));
        await typeQuery('yyy');
        expect(wrapper.get('[data-testid="esc-kb-failed"]').text()).toBe('Search did not load.');
    });

    it('ignores a late answer for an older query', async () => {
        let first;
        fetch.mockImplementationOnce(() => new Promise((resolve) => (first = resolve)));
        fetch.mockImplementationOnce(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [articles[1]] }) }),
        );
        wrapper = mount(KbArticleSearch, { props: { searchUrl: '/kb' } });
        await typeQuery('exp');
        await typeQuery('runbook');
        first({ ok: true, json: () => Promise.resolve({ data: articles }) });
        await flushPromises();
        expect(wrapper.findAll('[data-testid="esc-kb-result"]')).toHaveLength(1);
    });
});

describe('articleLink', () => {
    it('escapes the title and URL', () => {
        expect(articleLink({ title: 'A <b> & "c"', url: 'https://x.test/?a=1&b="2"' })).toBe(
            '<a href="https://x.test/?a=1&amp;b=&quot;2&quot;">A &lt;b&gt; &amp; &quot;c&quot;</a>',
        );
    });
});
