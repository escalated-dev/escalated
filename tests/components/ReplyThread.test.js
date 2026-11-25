import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ReplyThread from '../../src/components/ReplyThread.vue';

// Regression for the "Unknown author on a just-posted reply" bug: ReplyThread
// must render the author's name whenever the reply has an `author`, and fall
// back to "Unknown" only when the reply genuinely has none. (The backend fix
// ensures the author is present in the payload — escalated-laravel.)

vi.mock('@inertiajs/vue3', () => ({ router: { post: vi.fn() } }));
vi.mock('../../src/composables/useI18n', () => ({
    useI18n: () => ({ t: (key) => key }),
}));

function mountThread(replies) {
    return mount(ReplyThread, {
        props: { replies, ticketReference: 'ESC-1', routePrefix: 'escalated.agent' },
        global: { stubs: { AttachmentList: true, TicketSplitDialog: true } },
    });
}

describe('ReplyThread author rendering', () => {
    it('renders the author name when the reply has an author', () => {
        const wrapper = mountThread([
            { id: 1, body: 'On it!', author: { id: 7, name: 'Dana Agent' }, created_at: '2026-01-01T00:00:00Z' },
        ]);

        expect(wrapper.text()).toContain('Dana Agent');
        expect(wrapper.text()).not.toContain('ticket.unknown');
    });

    it('falls back to "Unknown" only when the reply genuinely has no author', () => {
        const wrapper = mountThread([
            { id: 2, body: 'Automated message', author: null, created_at: '2026-01-01T00:00:00Z' },
        ]);

        expect(wrapper.text()).toContain('ticket.unknown');
    });
});

describe('ReplyThread body format', () => {
    it('keeps the line breaks of a plain-text reply', () => {
        const wrapper = mountThread([{ id: 3, body: 'Line one\nLine two', author: null, created_at: '2026-01-01' }]);
        const body = wrapper.get('[data-testid="esc-reply-body"]');

        expect(body.classes()).toContain('whitespace-pre-line');
        expect(body.text()).toContain('Line one\nLine two');
    });

    it('keeps the line breaks of a plain-text email that quotes an address', () => {
        const body = 'Thanks!\n\nOn Monday, Bob <bob@example.com> wrote:\n> Is it fixed?';
        const wrapper = mountThread([{ id: 6, body, author: null, created_at: '2026-01-01' }]);

        expect(wrapper.get('[data-testid="esc-reply-body"]').classes()).toContain('whitespace-pre-line');
    });

    it('renders an HTML reply as before', () => {
        const wrapper = mountThread([
            { id: 4, body: '<p>One</p>\n<p>Two</p>', author: null, created_at: '2026-01-01' },
        ]);
        const body = wrapper.get('[data-testid="esc-reply-body"]');

        expect(body.classes()).not.toContain('whitespace-pre-line');
        expect(body.findAll('p')).toHaveLength(2);
    });

    it('shows a quoted address and the line break of a plain-text body verbatim', () => {
        const wrapper = mountThread([
            { id: 7, body: 'Bob <bob@example.com> wrote:\nhi', author: null, created_at: '2026-01-01' },
        ]);
        const body = wrapper.get('[data-testid="esc-reply-body"]');

        expect(body.element.textContent).toBe('Bob <bob@example.com> wrote:\nhi');
        expect(body.classes()).toContain('whitespace-pre-line');
        expect(body.attributes('data-body-format')).toBe('text');
    });

    it('shows a script in a plain-text body as text and never runs it', () => {
        window.__escalatedXss = 0;
        const wrapper = mountThread([
            {
                id: 5,
                body: 'Hi <script>window.__escalatedXss = 1</script>\nthere',
                author: null,
                created_at: '2026-01-01',
            },
        ]);
        const body = wrapper.get('[data-testid="esc-reply-body"]');

        expect(body.find('script').exists()).toBe(false);
        expect(body.element.textContent).toContain('<script>window.__escalatedXss = 1</script>');
        expect(window.__escalatedXss).toBe(0);
        delete window.__escalatedXss;
    });

    it('keeps sanitising the HTML path', () => {
        const wrapper = mountThread([
            {
                id: 8,
                body: '<p>Hi</p><script>window.__escalatedXss = 3</script>',
                author: null,
                created_at: '2026-01-01',
            },
        ]);
        const body = wrapper.get('[data-testid="esc-reply-body"]');

        expect(body.attributes('data-body-format')).toBe('html');
        expect(body.find('p').text()).toBe('Hi');
        expect(body.html()).not.toContain('<script');
    });
});

describe('isPlainText', () => {
    it('counts only real HTML tags as markup', async () => {
        const { isPlainText } = await import('../../src/utils/messageBody');

        expect(isPlainText('Bob <bob@example.com> wrote:')).toBe(true);
        expect(isPlainText('a <b> c')).toBe(false);
        expect(isPlainText('<p>Hello</p>')).toBe(false);
        expect(isPlainText('line<br/>break')).toBe(false);
        expect(isPlainText('<a href="https://x.test">x</a>')).toBe(false);
        expect(isPlainText('<H2 class="t">Title</H2>')).toBe(false);
        expect(isPlainText('if a < b and c > d')).toBe(true);
        expect(isPlainText('')).toBe(true);
    });
});
