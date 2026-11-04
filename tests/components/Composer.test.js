import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Composer from '../../src/components/Composer.vue';
import { clearToasts, useAgentToasts } from '../../src/composables/useAgentToasts';

const post = vi.fn();

vi.mock('@inertiajs/vue3', () => ({
    router: { post: (...args) => post(...args) },
}));

vi.mock('../../src/composables/useMentions', async () => {
    const { ref } = await import('vue');
    return {
        useMentions: () => ({
            suggestions: ref([]),
            isActive: ref(false),
            loading: ref(false),
            pending: ref(false),
            onTextChange: () => {},
            insertMention: (body) => body,
            close: () => {},
        }),
    };
});

let wrapper;

function mountComposer(props = {}) {
    wrapper = mount(Composer, {
        props: {
            replyAction: '/reply',
            noteAction: '/note',
            statusAction: '/status',
            draftKey: 'ESC-1',
            ...props,
        },
        attachTo: document.body,
    });
    return wrapper;
}

beforeEach(() => {
    clearToasts();
    post.mockReset();
    window.localStorage.clear();
});

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.useRealTimers();
});

const input = () => wrapper.get('[data-testid="esc-composer-input"]');

describe('Composer', () => {
    it('posts a reply to the reply action', async () => {
        mountComposer();
        await input().setValue('Thanks, looking into it.');
        await wrapper.get('[data-testid="esc-composer-send"]').trigger('click');
        expect(post).toHaveBeenCalledWith(
            '/reply',
            { body: 'Thanks, looking into it.', is_internal_note: false, attachments: [] },
            expect.any(Object),
        );
    });

    it('switches to an internal note with an amber cue and posts to the note action', async () => {
        mountComposer();
        expect(wrapper.find('[data-testid="esc-composer-note-cue"]').exists()).toBe(false);
        await wrapper.get('[data-testid="esc-composer-note-tab"]').trigger('click');
        expect(wrapper.get('[data-testid="esc-composer"]').attributes('data-mode')).toBe('note');
        expect(wrapper.get('[data-testid="esc-composer-note-cue"]').text()).toContain('Only agents');
        await input().setValue('Checking the export queue.');
        await wrapper.get('[data-testid="esc-composer-send"]').trigger('click');
        expect(post).toHaveBeenCalledWith(
            '/note',
            expect.objectContaining({ body: 'Checking the export queue.', is_internal_note: true }),
            expect.any(Object),
        );
    });

    it('offers internal notes only to light agents', () => {
        mountComposer({ notesOnly: true });
        expect(wrapper.find('[data-testid="esc-composer-reply-tab"]').exists()).toBe(false);
        expect(wrapper.get('[data-testid="esc-composer"]').attributes('data-mode')).toBe('note');
        expect(wrapper.find('[data-testid="esc-composer-send-menu"]').exists()).toBe(false);
    });

    it('does not send an empty message', async () => {
        mountComposer();
        expect(wrapper.get('[data-testid="esc-composer-send"]').attributes('disabled')).toBeDefined();
        await wrapper.get('[data-testid="esc-composer-send"]').trigger('click');
        expect(post).not.toHaveBeenCalled();
    });

    it('sends and then resolves from the split button menu', async () => {
        post.mockImplementation((url, data, options) => options?.onSuccess?.());
        mountComposer();
        await input().setValue('Fixed now.');
        await wrapper.get('[data-testid="esc-composer-send-menu"]').trigger('click');
        const resolve = wrapper.findAll('[role="menuitem"]').find((item) => item.text() === 'Send and resolve');
        await resolve.trigger('click');
        expect(post.mock.calls[0][0]).toBe('/reply');
        expect(post.mock.calls[1]).toEqual(['/status', { status: 'resolved' }, expect.any(Object)]);
    });

    it('sends and sets waiting on customer', async () => {
        post.mockImplementation((url, data, options) => options?.onSuccess?.());
        mountComposer();
        await input().setValue('Could you send a screenshot?');
        await wrapper.get('[data-testid="esc-composer-send-menu"]').trigger('click');
        await wrapper.findAll('[role="menuitem"]')[0].trigger('click');
        expect(post.mock.calls[1]).toEqual(['/status', { status: 'waiting_on_customer' }, expect.any(Object)]);
    });

    it('sends with Ctrl Enter', async () => {
        mountComposer();
        await input().setValue('Quick reply');
        await input().trigger('keydown', { key: 'Enter', ctrlKey: true });
        expect(post).toHaveBeenCalledWith('/reply', expect.anything(), expect.any(Object));
    });

    it('autosaves a draft per ticket and mode, restores it, and clears it once sent', async () => {
        vi.useFakeTimers();
        mountComposer();
        await input().setValue('Half-written reply');
        vi.advanceTimersByTime(600);
        expect(window.localStorage.getItem('escalated-draft:ESC-1:reply')).toBe('Half-written reply');
        await nextTick();
        expect(wrapper.get('[data-testid="esc-composer-draft"]').text()).toBe('Draft saved');

        wrapper.unmount();
        mountComposer();
        expect(input().element.value).toBe('Half-written reply');

        wrapper.unmount();
        mountComposer({ draftKey: 'ESC-2' });
        expect(input().element.value).toBe('');

        wrapper.unmount();
        post.mockImplementation((url, data, options) => options?.onSuccess?.());
        mountComposer();
        await wrapper.get('[data-testid="esc-composer-send"]').trigger('click');
        expect(window.localStorage.getItem('escalated-draft:ESC-1:reply')).toBeNull();
    });

    it('keeps reply and note drafts apart', async () => {
        vi.useFakeTimers();
        mountComposer();
        await input().setValue('Reply text');
        vi.advanceTimersByTime(600);
        await wrapper.get('[data-testid="esc-composer-note-tab"]').trigger('click');
        expect(input().element.value).toBe('');
        await input().setValue('Note text');
        vi.advanceTimersByTime(600);
        await wrapper.get('[data-testid="esc-composer-reply-tab"]').trigger('click');
        expect(input().element.value).toBe('Reply text');
    });

    it('wraps the selection in bold', async () => {
        mountComposer();
        await input().setValue('make this bold');
        input().element.setSelectionRange(5, 9);
        await wrapper.get('button[aria-label="Bold"]').trigger('click');
        expect(input().element.value).toBe('make <strong>this</strong> bold');
    });

    it('inserts a canned response', async () => {
        mountComposer({ cannedResponses: [{ id: 1, title: 'Greeting', body: 'Hi there,' }] });
        await wrapper.get('[data-testid="esc-composer-canned"]').trigger('click');
        await wrapper
            .findAll('[role="menuitem"]')
            .find((item) => item.text() === 'Greeting')
            .trigger('click');
        expect(input().element.value).toBe('Hi there,');
    });

    it('lists attached files and lets them be removed', async () => {
        mountComposer();
        const file = new window.File(['x'], 'error-export.png', { type: 'image/png' });
        const fileInput = wrapper.get('input[type="file"]');
        Object.defineProperty(fileInput.element, 'files', { value: [file], configurable: true });
        await fileInput.trigger('change');
        expect(wrapper.get('[data-testid="esc-composer-files"]').text()).toContain('error-export.png');
        await wrapper.get('button[aria-label="Remove error-export.png"]').trigger('click');
        expect(wrapper.find('[data-testid="esc-composer-files"]').exists()).toBe(false);
    });

    it('uses an AA placeholder colour and shows focus on the whole box', () => {
        mountComposer();
        expect(input().classes()).toContain('placeholder-[var(--esc-panel-text-tertiary)]');
        const box = wrapper.get('[data-testid="esc-composer"]');
        expect(box.classes()).toContain('focus-within:border-[var(--esc-panel-accent)]');
    });

    it('tints the focus border amber on an internal note', async () => {
        mountComposer({ mode: 'note' });
        const box = wrapper.get('[data-testid="esc-composer"]');
        expect(box.classes()).toContain('focus-within:border-[var(--esc-panel-note-text)]');
    });

    it('confirms a sent reply when the backend sends no flash', async () => {
        post.mockImplementation((url, data, options) => {
            options.onSuccess({ props: {} });
            options.onFinish?.();
        });
        mountComposer();
        await input().setValue('Done.');
        await wrapper.get('[data-testid="esc-composer-send"]').trigger('click');
        expect(useAgentToasts().toasts.value.map((t) => t.message)).toEqual(['Reply sent']);
    });

    it('keeps the text and says why when the send is rejected', async () => {
        post.mockImplementation((url, data, options) => {
            options.onError({ body: 'The body may not be greater than 10000 characters.' });
            options.onFinish?.();
        });
        mountComposer();
        await input().setValue('Too long');
        await wrapper.get('[data-testid="esc-composer-send"]').trigger('click');
        const error = wrapper.get('[data-testid="esc-composer-error"]');
        expect(error.attributes('role')).toBe('alert');
        expect(error.text()).toContain('The body may not be greater than 10000 characters.');
        expect(input().element.value).toBe('Too long');
        await input().setValue('Shorter');
        expect(wrapper.find('[data-testid="esc-composer-error"]').exists()).toBe(false);
    });

    it('shows that it is sending', async () => {
        post.mockImplementation(() => {});
        mountComposer();
        await input().setValue('Hello');
        await wrapper.get('[data-testid="esc-composer-send"]').trigger('click');
        const send = wrapper.get('[data-testid="esc-composer-send"]');
        expect(send.attributes('aria-busy')).toBe('true');
        expect(send.text()).toContain('Sending');
    });
});
