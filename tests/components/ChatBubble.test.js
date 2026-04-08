import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import ChatBubble from '../../src/components/ChatBubble.vue';

function mountBubble(props = {}, dark = false) {
    return mount(ChatBubble, {
        props: {
            message: {
                id: 1,
                body: 'Hello there',
                author: { id: 1, name: 'John Doe' },
                created_at: new Date().toISOString(),
            },
            ...props,
        },
        global: {
            provide: {
                'esc-dark': computed(() => dark),
            },
        },
    });
}

describe('ChatBubble', () => {
    describe('agent variant', () => {
        it('renders agent message right-aligned', () => {
            const wrapper = mountBubble({ isAgent: true });
            expect(wrapper.find('.flex').classes()).toContain('flex-row-reverse');
        });

        it('renders message body', () => {
            const wrapper = mountBubble({
                isAgent: true,
                message: {
                    id: 1,
                    body: 'Agent reply here',
                    author: { id: 2, name: 'Agent' },
                    created_at: new Date().toISOString(),
                },
            });
            expect(wrapper.text()).toContain('Agent reply here');
        });

        it('uses brand color background in light mode', () => {
            const wrapper = mountBubble({ isAgent: true });
            const bubble = wrapper.find('.rounded-2xl');
            expect(bubble.classes()).toContain('bg-blue-600');
        });

        it('uses dark mode background for agent', () => {
            const wrapper = mountBubble({ isAgent: true }, true);
            const bubble = wrapper.find('.rounded-2xl');
            expect(bubble.classes()).toContain('bg-cyan-500/15');
        });
    });

    describe('customer variant', () => {
        it('renders customer message left-aligned', () => {
            const wrapper = mountBubble({ isAgent: false });
            expect(wrapper.find('.flex').classes()).toContain('flex-row');
        });

        it('uses gray background in light mode', () => {
            const wrapper = mountBubble({ isAgent: false });
            const bubble = wrapper.find('.rounded-2xl');
            expect(bubble.classes()).toContain('bg-gray-100');
        });
    });

    describe('timestamps', () => {
        it('shows timestamp when showTimestamp is true', () => {
            const wrapper = mountBubble({ showTimestamp: true });
            // Should have a timestamp element
            const time = wrapper.find('.text-\\[10px\\]');
            expect(time.exists()).toBe(true);
        });

        it('hides timestamp by default', () => {
            const wrapper = mountBubble({ showTimestamp: false });
            const time = wrapper.find('.mt-1.text-\\[10px\\]');
            expect(time.exists()).toBe(false);
        });
    });

    describe('avatars', () => {
        it('shows avatar initials when showAvatar is true', () => {
            const wrapper = mountBubble({
                showAvatar: true,
                message: {
                    id: 1,
                    body: 'hi',
                    author: { id: 1, name: 'John Doe' },
                    created_at: new Date().toISOString(),
                },
            });
            expect(wrapper.text()).toContain('JD');
        });

        it('hides avatar when showAvatar is false', () => {
            const wrapper = mountBubble({ showAvatar: false });
            // Should not have a avatar circle
            expect(wrapper.findAll('.h-8.w-8').length).toBe(0);
        });

        it('shows image avatar when provided', () => {
            const wrapper = mountBubble({
                showAvatar: true,
                message: {
                    id: 1,
                    body: 'hi',
                    author: { id: 1, name: 'John', avatar: 'https://example.com/photo.jpg' },
                    created_at: new Date().toISOString(),
                },
            });
            const img = wrapper.find('img');
            expect(img.exists()).toBe(true);
            expect(img.attributes('src')).toBe('https://example.com/photo.jpg');
        });
    });

    describe('attachments', () => {
        it('renders file attachments', () => {
            const wrapper = mountBubble({
                message: {
                    id: 1,
                    body: 'See attached',
                    author: { id: 1, name: 'User' },
                    created_at: new Date().toISOString(),
                    attachments: [{ id: 1, name: 'report.pdf', url: '/files/report.pdf' }],
                },
            });
            expect(wrapper.text()).toContain('report.pdf');
            const link = wrapper.find('a');
            expect(link.attributes('href')).toBe('/files/report.pdf');
        });
    });

    describe('internal notes', () => {
        it('renders internal note style', () => {
            const wrapper = mountBubble({
                message: {
                    id: 1,
                    body: 'Internal only',
                    author: { id: 1, name: 'Agent' },
                    created_at: new Date().toISOString(),
                    is_internal_note: true,
                },
            });
            expect(wrapper.text()).toContain('Internal Note');
            const bubble = wrapper.find('.rounded-2xl');
            expect(bubble.classes()).toContain('bg-yellow-50');
        });
    });
});
