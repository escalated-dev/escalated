import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TicketSplitDialog from '../../src/components/TicketSplitDialog.vue';

// Stub the Inertia router
vi.mock('@inertiajs/vue3', () => ({
    router: {
        post: vi.fn(),
    },
}));

// Stub the global route() helper
const mockRoute = vi.fn((...args) => `/mocked-route/${args.join('/')}`);
vi.stubGlobal('route', mockRoute);

const defaultProps = {
    ticketReference: 'TK-1234',
    replyId: 42,
    replyAuthor: 'Jane Doe',
    replyExcerpt: 'This is the reply content that will be split.',
};

function mountDialog(propsOverrides = {}) {
    return mount(TicketSplitDialog, {
        props: { ...defaultProps, ...propsOverrides },
        global: {
            stubs: {
                Teleport: true,
            },
        },
    });
}

describe('TicketSplitDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ----------------------------------------------------------------
    // Rendering with reply data
    // ----------------------------------------------------------------
    describe('rendering', () => {
        it('renders the dialog title', () => {
            const wrapper = mountDialog();
            expect(wrapper.text()).toContain('Split to New Ticket');
        });

        it('displays the ticket reference', () => {
            const wrapper = mountDialog();
            expect(wrapper.text()).toContain('TK-1234');
        });

        it('displays the reply author name', () => {
            const wrapper = mountDialog();
            expect(wrapper.text()).toContain('Jane Doe');
        });

        it('displays the reply excerpt', () => {
            const wrapper = mountDialog();
            expect(wrapper.text()).toContain('This is the reply content that will be split.');
        });

        it('hides author span when replyAuthor is empty', () => {
            const wrapper = mountDialog({ replyAuthor: '' });
            expect(wrapper.text()).not.toContain('by ');
        });

        it('hides excerpt block when replyExcerpt is empty', () => {
            const wrapper = mountDialog({ replyExcerpt: '' });
            expect(wrapper.text()).not.toContain('Reply content');
        });
    });

    // ----------------------------------------------------------------
    // Subject field
    // ----------------------------------------------------------------
    describe('subject field', () => {
        it('renders an input for the subject', () => {
            const wrapper = mountDialog();
            const input = wrapper.find('input[type="text"]');
            expect(input.exists()).toBe(true);
        });

        it('subject field starts empty', () => {
            const wrapper = mountDialog();
            const input = wrapper.find('input[type="text"]');
            expect(input.element.value).toBe('');
        });

        it('subject field has placeholder text', () => {
            const wrapper = mountDialog();
            const input = wrapper.find('input[type="text"]');
            expect(input.attributes('placeholder')).toContain('auto-generate');
        });
    });

    // ----------------------------------------------------------------
    // Close / cancel
    // ----------------------------------------------------------------
    describe('close event', () => {
        it('emits close when cancel button is clicked', async () => {
            const wrapper = mountDialog();
            const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Cancel');
            await cancelBtn.trigger('click');
            expect(wrapper.emitted('close')).toHaveLength(1);
        });

        it('emits close when X button is clicked', async () => {
            const wrapper = mountDialog();
            // X button is the first button (contains the svg)
            const xBtn = wrapper.findAll('button')[0];
            await xBtn.trigger('click');
            expect(wrapper.emitted('close')).toHaveLength(1);
        });

        it('emits close when clicking the backdrop overlay', async () => {
            const wrapper = mountDialog();
            const overlay = wrapper.find('.fixed.inset-0');
            await overlay.trigger('click');
            expect(wrapper.emitted('close')).toHaveLength(1);
        });
    });

    // ----------------------------------------------------------------
    // Submit
    // ----------------------------------------------------------------
    describe('submit', () => {
        it('calls router.post with the correct route on submit', async () => {
            const { router } = await import('@inertiajs/vue3');
            const wrapper = mountDialog();
            const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Split to New Ticket'));
            await submitBtn.trigger('click');

            expect(mockRoute).toHaveBeenCalledWith('escalated.admin.tickets.split', 'TK-1234');
            expect(router.post).toHaveBeenCalledTimes(1);
            expect(router.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ reply_id: 42 }),
                expect.any(Object),
            );
        });

        it('includes subject in payload when provided', async () => {
            const { router } = await import('@inertiajs/vue3');
            const wrapper = mountDialog();
            const input = wrapper.find('input[type="text"]');
            await input.setValue('Custom subject line');

            const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Split to New Ticket'));
            await submitBtn.trigger('click');

            expect(router.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ reply_id: 42, subject: 'Custom subject line' }),
                expect.any(Object),
            );
        });

        it('omits subject from payload when empty', async () => {
            const { router } = await import('@inertiajs/vue3');
            const wrapper = mountDialog();

            const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Split to New Ticket'));
            await submitBtn.trigger('click');

            const payload = router.post.mock.calls[0][1];
            expect(payload).not.toHaveProperty('subject');
        });

        it('shows "Splitting..." text while submitting', async () => {
            const wrapper = mountDialog();
            const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('Split to New Ticket'));
            await submitBtn.trigger('click');

            // After click, splitting ref is true (router.post is mocked and never calls onFinish)
            expect(wrapper.text()).toContain('Splitting...');
        });
    });
});
