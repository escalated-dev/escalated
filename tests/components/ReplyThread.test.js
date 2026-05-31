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
