import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';

const post = vi.fn();
vi.mock('@inertiajs/vue3', () => ({
    router: {
        post: (...args) => post(...args),
    },
}));

import CustomTicketActions from '../../src/components/CustomTicketActions.vue';

const actions = [
    {
        key: 'sync-crm',
        label: 'Sync CRM',
        variant: 'primary',
        confirmation: null,
        disabled: false,
        metadata: { icon: 'refresh-cw' },
        url: '/support/agent/tickets/TK-1/actions/sync-crm',
        method: 'post',
    },
    {
        key: 'archive',
        label: 'Archive',
        variant: 'danger',
        confirmation: 'Archive this ticket?',
        disabled: false,
        metadata: {},
        url: '/support/agent/tickets/TK-1/actions/archive',
        method: 'post',
    },
    {
        key: 'locked',
        label: 'Locked',
        variant: 'secondary',
        confirmation: null,
        disabled: true,
        metadata: {},
        url: '/support/agent/tickets/TK-1/actions/locked',
        method: 'post',
    },
];

function mountActions(props = {}, dark = false) {
    return mount(CustomTicketActions, {
        props: { actions, ...props },
        global: {
            provide: {
                'esc-dark': computed(() => dark),
            },
        },
    });
}

describe('CustomTicketActions', () => {
    beforeEach(() => {
        post.mockClear();
    });

    describe('rendering', () => {
        it('renders a button per action with its label', () => {
            const wrapper = mountActions();
            const buttons = wrapper.findAll('button');
            expect(buttons).toHaveLength(3);
            expect(wrapper.text()).toContain('Sync CRM');
            expect(wrapper.text()).toContain('Archive');
        });

        it('renders an icon when metadata.icon is present', () => {
            const wrapper = mountActions();
            const syncButton = wrapper.get('[data-action-key="sync-crm"]');
            expect(syncButton.find('svg').exists()).toBe(true);
        });

        it('disables actions flagged as disabled', () => {
            const wrapper = mountActions();
            const locked = wrapper.get('[data-action-key="locked"]');
            expect(locked.attributes('disabled')).toBeDefined();
        });

        it('renders nothing when there are no actions', () => {
            const wrapper = mountActions({ actions: [] });
            expect(wrapper.findAll('button')).toHaveLength(0);
        });
    });

    describe('triggering', () => {
        it('POSTs to the action url when clicked', async () => {
            const wrapper = mountActions();
            await wrapper.get('[data-action-key="sync-crm"]').trigger('click');
            expect(post).toHaveBeenCalledTimes(1);
            expect(post.mock.calls[0][0]).toBe('/support/agent/tickets/TK-1/actions/sync-crm');
        });

        it('does not POST when a disabled action is clicked', async () => {
            const wrapper = mountActions();
            await wrapper.get('[data-action-key="locked"]').trigger('click');
            expect(post).not.toHaveBeenCalled();
        });

        it('asks for confirmation and aborts when declined', async () => {
            const confirmSpy = vi.fn().mockReturnValue(false);
            vi.stubGlobal('confirm', confirmSpy);
            const wrapper = mountActions();
            await wrapper.get('[data-action-key="archive"]').trigger('click');
            expect(confirmSpy).toHaveBeenCalledWith('Archive this ticket?');
            expect(post).not.toHaveBeenCalled();
            vi.unstubAllGlobals();
        });

        it('POSTs after confirmation is accepted', async () => {
            vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
            const wrapper = mountActions();
            await wrapper.get('[data-action-key="archive"]').trigger('click');
            expect(post).toHaveBeenCalledTimes(1);
            vi.unstubAllGlobals();
        });
    });
});
