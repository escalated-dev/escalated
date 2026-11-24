import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import KnowledgePanel from '../../src/components/KnowledgePanel.vue';

const articles = [
    { id: 1, title: 'Exporting reports to CSV', excerpt: 'From the dashboard.', url: 'https://example.com/kb/1' },
    { id: 2, title: 'Export runbook', excerpt: 'Agents only.', url: 'https://example.com/kb/2', internal: true },
];

let wrapper;
let fetch;

beforeEach(() => {
    vi.useFakeTimers();
    fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: articles }) }));
    vi.stubGlobal('fetch', fetch);
});

afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete window.route;
});

async function type(value) {
    await wrapper.get('input').setValue(value);
    vi.advanceTimersByTime(500);
    await flushPromises();
}

describe('KnowledgePanel', () => {
    it('renders nothing when the host has no knowledge-base search', () => {
        wrapper = mount(KnowledgePanel, { props: { ticketReference: 'ESC-1' } });
        expect(wrapper.html()).toBe('<!--v-if-->');
    });

    it('never makes up results for a search', async () => {
        fetch.mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) }));
        wrapper = mount(KnowledgePanel, { props: { ticketReference: 'ESC-1', searchUrl: '/kb/search' } });
        await type('refund');

        expect(wrapper.text()).not.toContain('refund');
        expect(wrapper.text()).toContain('No articles found.');
        expect(wrapper.findAll('h4')).toHaveLength(0);
    });

    it('shows the articles the real search returns', async () => {
        wrapper = mount(KnowledgePanel, { props: { ticketReference: 'ESC-1', searchUrl: '/kb/search' } });
        await type('export');

        expect(fetch.mock.calls[0][0]).toContain('/kb/search?q=export');
        expect(wrapper.findAll('h4').map((h) => h.text())).toEqual(['Exporting reports to CSV', 'Export runbook']);
    });

    it('does not offer an internal article for the reply', async () => {
        wrapper = mount(KnowledgePanel, { props: { ticketReference: 'ESC-1', searchUrl: '/kb/search' } });
        await type('export');

        const buttons = wrapper.findAll('button').filter((b) => b.text() === 'Insert Link');
        expect(buttons).toHaveLength(1);
        await buttons[0].trigger('click');
        expect(wrapper.emitted('insert-link')[0][0]).toMatchObject({ id: 1 });
    });

    it("uses the host's escalated.agent.kb.search route by default", async () => {
        window.route = vi.fn(() => '/support/agent/kb/search');
        wrapper = mount(KnowledgePanel, { props: { ticketReference: 'ESC-1' } });
        await type('export');

        expect(window.route).toHaveBeenCalledWith('escalated.agent.kb.search');
        expect(fetch.mock.calls[0][0]).toContain('/support/agent/kb/search?q=export');
    });
});
