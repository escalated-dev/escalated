import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MessageBody from '../../src/components/MessageBody.vue';
import PinnedNotes from '../../src/components/PinnedNotes.vue';

vi.mock('@inertiajs/vue3', () => ({ router: { post: vi.fn() } }));

describe('MessageBody', () => {
    it('renders plain text as escaped text with its line breaks', () => {
        const wrapper = mount(MessageBody, { props: { body: 'Bob <bob@example.com> wrote:\nhi' } });

        expect(wrapper.element.textContent).toBe('Bob <bob@example.com> wrote:\nhi');
        expect(wrapper.classes()).toContain('whitespace-pre-line');
        expect(wrapper.html()).toContain('&lt;bob@example.com&gt;');
    });

    it('never passes plain text to the HTML renderer', () => {
        const render = vi.fn(() => '');
        mount(MessageBody, { props: { body: 'a <script>alert(1)</script>', render } });

        expect(render).not.toHaveBeenCalled();
    });

    it('renders an HTML body through the renderer, as before', () => {
        const render = vi.fn((html) => html.replace('<script>x</script>', ''));
        const wrapper = mount(MessageBody, { props: { body: '<p>Hi</p><script>x</script>', render } });

        expect(render).toHaveBeenCalledWith('<p>Hi</p><script>x</script>');
        expect(wrapper.find('p').text()).toBe('Hi');
        expect(wrapper.classes()).not.toContain('whitespace-pre-line');
    });

    it('passes classes through on both paths', () => {
        const plain = mount(MessageBody, { props: { body: 'x' }, attrs: { class: 'prose' } });
        const html = mount(MessageBody, { props: { body: '<p>x</p>' }, attrs: { class: 'prose' } });

        expect(plain.classes()).toContain('prose');
        expect(html.classes()).toContain('prose');
    });

    it('copes with an empty body', () => {
        expect(mount(MessageBody, { props: { body: null } }).text()).toBe('');
    });
});

describe('PinnedNotes', () => {
    it('shows a plain-text note verbatim', () => {
        const wrapper = mount(PinnedNotes, {
            props: {
                notes: [
                    {
                        id: 1,
                        body: 'Call <ops@example.com>\nafter 5',
                        author: { name: 'Dana' },
                        created_at: '2026-01-01',
                    },
                ],
                ticketReference: 'ESC-1',
                routePrefix: 'escalated.agent',
            },
            global: { mocks: { route: () => '/x' } },
        });

        expect(wrapper.text()).toContain('Call <ops@example.com>');
        expect(wrapper.find('[data-body-format="text"]').element.textContent).toBe('Call <ops@example.com>\nafter 5');
    });
});
