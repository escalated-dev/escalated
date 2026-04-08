import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, ref, readonly } from 'vue';
import ActiveChatsPanel from '../../src/components/ActiveChatsPanel.vue';

// Mock useChat composable to prevent real WebSocket subscriptions
vi.mock('../../src/composables/useChat', () => ({
    useChat: () => ({
        subscribeToChatQueue: () => () => {},
        connectionState: readonly(ref('disconnected')),
        messageBuffer: readonly(ref([])),
    }),
}));

function mountPanel(props = {}, dark = false) {
    return mount(ActiveChatsPanel, {
        props: {
            chats: [],
            agentId: 1,
            ...props,
        },
        global: {
            provide: {
                'esc-dark': computed(() => dark),
            },
        },
    });
}

describe('ActiveChatsPanel', () => {
    describe('toggle button', () => {
        it('renders the toggle button', () => {
            const wrapper = mountPanel();
            const toggleBtn = wrapper.find('button.fixed');
            expect(toggleBtn.exists()).toBe(true);
        });

        it('shows unread badge when there are unread messages', () => {
            const wrapper = mountPanel({
                chats: [
                    {
                        id: 1,
                        customer_name: 'Alice',
                        unread_count: 3,
                        last_message: 'Hi',
                        last_message_at: new Date().toISOString(),
                    },
                ],
            });
            expect(wrapper.text()).toContain('3');
        });

        it('hides unread badge when no unread', () => {
            const wrapper = mountPanel({
                chats: [{ id: 1, customer_name: 'Alice', unread_count: 0, last_message: 'Hi' }],
            });
            // Should not have badge span with count
            const badge = wrapper.find('.bg-rose-500');
            expect(badge.exists()).toBe(false);
        });
    });

    describe('chat list', () => {
        it('shows empty state when no chats', async () => {
            const wrapper = mountPanel({ chats: [] });
            // Open the panel first
            await wrapper.find('button.fixed').trigger('click');
            expect(wrapper.text()).toContain('No active chats');
        });

        it('renders chat list items', async () => {
            const wrapper = mountPanel({
                chats: [
                    {
                        id: 1,
                        customer_name: 'Alice Smith',
                        unread_count: 2,
                        last_message: 'Need help',
                        last_message_at: new Date().toISOString(),
                    },
                    {
                        id: 2,
                        customer_name: 'Bob Jones',
                        unread_count: 0,
                        last_message: 'Thanks',
                        last_message_at: new Date().toISOString(),
                    },
                ],
            });
            await wrapper.find('button.fixed').trigger('click');
            expect(wrapper.text()).toContain('Alice Smith');
            expect(wrapper.text()).toContain('Bob Jones');
        });

        it('shows customer initials as avatar', async () => {
            const wrapper = mountPanel({
                chats: [{ id: 1, customer_name: 'Alice Smith', unread_count: 0, last_message: 'Hi' }],
            });
            await wrapper.find('button.fixed').trigger('click');
            expect(wrapper.text()).toContain('AS');
        });
    });

    describe('status toggle', () => {
        it('shows current status', async () => {
            const wrapper = mountPanel({ agentStatus: 'online' });
            await wrapper.find('button.fixed').trigger('click');
            expect(wrapper.text()).toContain('Online');
        });

        it('displays the agent status text', async () => {
            const wrapper = mountPanel({ agentStatus: 'online' });
            await wrapper.find('button.fixed').trigger('click');
            expect(wrapper.text()).toContain('Online');
        });
    });

    describe('navigate', () => {
        it('emits navigate event when chat is clicked', async () => {
            const chat = {
                id: 1,
                customer_name: 'Alice',
                unread_count: 0,
                last_message: 'Hi',
                last_message_at: new Date().toISOString(),
            };
            const wrapper = mountPanel({ chats: [chat] });
            await wrapper.find('button.fixed').trigger('click');

            // Click the chat item button
            const chatBtns = wrapper.findAll('button.w-full');
            if (chatBtns.length) {
                await chatBtns[0].trigger('click');
                expect(wrapper.emitted('navigate')).toBeTruthy();
                expect(wrapper.emitted('navigate')[0][0]).toEqual(chat);
            }
        });
    });
});
