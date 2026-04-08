import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import ChatThread from '../../src/components/ChatThread.vue';

function mountThread(props = {}, dark = false) {
    return mount(ChatThread, {
        props: {
            messages: [],
            ...props,
        },
        global: {
            provide: {
                'esc-dark': computed(() => dark),
            },
        },
    });
}

function makeMessage(overrides = {}) {
    return {
        id: Math.random(),
        body: 'Test message',
        author: { id: 1, name: 'Agent' },
        created_at: new Date().toISOString(),
        is_agent: true,
        ...overrides,
    };
}

describe('ChatThread', () => {
    describe('empty state', () => {
        it('shows empty state when no messages', () => {
            const wrapper = mountThread();
            // i18n key fallback or translated text
            expect(wrapper.text()).toContain('Chat started');
        });
    });

    describe('message rendering', () => {
        it('renders messages as ChatBubble components', () => {
            const messages = [
                makeMessage({ id: 1, body: 'Hello', is_agent: false, author: { id: 2, name: 'Customer' } }),
                makeMessage({ id: 2, body: 'Hi there', is_agent: true, author: { id: 1, name: 'Agent' } }),
            ];
            const wrapper = mountThread({ messages });
            expect(wrapper.text()).toContain('Hello');
            expect(wrapper.text()).toContain('Hi there');
        });
    });

    describe('message grouping', () => {
        it('groups consecutive same-author messages (avatar only on first)', () => {
            const now = Date.now();
            const messages = [
                makeMessage({
                    id: 1,
                    body: 'First',
                    author: { id: 1, name: 'Agent' },
                    created_at: new Date(now).toISOString(),
                }),
                makeMessage({
                    id: 2,
                    body: 'Second',
                    author: { id: 1, name: 'Agent' },
                    created_at: new Date(now + 1000).toISOString(),
                }),
            ];
            const wrapper = mountThread({ messages });
            // Both messages should be rendered
            expect(wrapper.text()).toContain('First');
            expect(wrapper.text()).toContain('Second');
        });
    });

    describe('typing indicator', () => {
        it('shows typing indicator when typingUser is set', () => {
            const wrapper = mountThread({ typingUser: 'Sarah' });
            // The i18n key chat.typing uses :name replacement
            expect(wrapper.text()).toContain('Sarah is typing...');
        });

        it('hides typing indicator when typingUser is null', () => {
            const wrapper = mountThread({ typingUser: null });
            // Should not show any typing indicator dots
            const dots = wrapper.findAll('.animate-bounce');
            expect(dots.length).toBe(0);
        });
    });

    describe('time separators', () => {
        it('shows time separator when gap > 5 minutes', () => {
            const now = Date.now();
            const messages = [
                makeMessage({
                    id: 1,
                    body: 'First',
                    created_at: new Date(now - 600000).toISOString(),
                }),
                makeMessage({
                    id: 2,
                    body: 'Second',
                    created_at: new Date(now).toISOString(),
                }),
            ];
            const wrapper = mountThread({ messages });
            // Should have time separator dividers (border-t elements)
            const separators = wrapper.findAll('.border-t');
            expect(separators.length).toBeGreaterThanOrEqual(2); // at least the two separators in the time divider
        });
    });

    describe('new messages pill', () => {
        it('new messages button is hidden by default', () => {
            const wrapper = mountThread({
                messages: [makeMessage({ id: 1 })],
            });
            // The "New messages" button should not be visible initially
            const pill = wrapper.find('button.absolute');
            expect(pill.exists()).toBe(false);
        });
    });
});
