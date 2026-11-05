import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EscalatedNavigation from '../../src/components/EscalatedNavigation.vue';
import { useEscalatedNavigation } from '../../src/composables/useEscalatedNavigation';
import { escalatedNavIcons } from '../../src/utils/adminNavIcons';

const usePage = vi.fn();

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

const navigation = [
    {
        key: 'reports',
        label: 'Reports',
        route: 'escalated.admin.reports',
        url: '/admin/support/reports',
        icon: 'reports',
        position: 10,
        active: false,
        badge: null,
        plugin: null,
        children: [],
    },
    {
        key: 'tickets',
        label: 'Tickets',
        route: 'escalated.admin.tickets.index',
        url: '/admin/support/tickets',
        icon: 'tickets',
        position: 20,
        active: true,
        badge: null,
        plugin: null,
        children: [],
    },
    {
        key: 'plugin:crm:0',
        label: 'CRM',
        route: null,
        url: '/admin/support/plugins/crm',
        icon: 'crm-icon',
        position: 99,
        active: false,
        badge: 3,
        plugin: 'crm',
        children: [],
    },
];

function withProps(escalated) {
    usePage.mockReturnValue({ url: '/admin/support/tickets', props: { escalated } });
}

describe('useEscalatedNavigation', () => {
    beforeEach(() => usePage.mockReset());

    it('exposes the shared items, the active one and the embed flag', () => {
        withProps({ navigation, embed: { enabled: true, mode: 'layout' } });
        const { items, activeItem, isEmbedded } = useEscalatedNavigation();
        expect(items.value.map((i) => i.key)).toEqual(['reports', 'tickets', 'plugin:crm:0']);
        expect(activeItem.value.label).toBe('Tickets');
        expect(isEmbedded.value).toBe(true);
    });

    it('is empty on a backend that does not share navigation', () => {
        withProps({ prefix: 'support' });
        const { items, activeItem, isEmbedded } = useEscalatedNavigation();
        expect(items.value).toEqual([]);
        expect(activeItem.value).toBeNull();
        expect(isEmbedded.value).toBe(false);
    });
});

describe('EscalatedNavigation', () => {
    beforeEach(() => usePage.mockReset());

    it('renders a link per item, marks the active one and draws known icons', () => {
        withProps({ navigation });
        const wrapper = mount(EscalatedNavigation);

        const links = wrapper.findAll('a');
        expect(links.map((a) => a.text())).toEqual(['Reports', 'Tickets', 'CRM3']);
        expect(links.map((a) => a.attributes('href'))).toEqual([
            '/admin/support/reports',
            '/admin/support/tickets',
            '/admin/support/plugins/crm',
        ]);
        expect(links[1].attributes('aria-current')).toBe('page');
        expect(links[0].attributes('aria-current')).toBeUndefined();
        expect(links[0].find('path').attributes('d')).toBe(escalatedNavIcons.reports);
        // Plugin icons this package does not know are not guessed at.
        expect(links[2].find('svg').exists()).toBe(false);
    });

    it('renders nothing without navigation', () => {
        withProps({});
        expect(mount(EscalatedNavigation).find('nav').exists()).toBe(false);
    });

    it('lets the host render each item through the slot', () => {
        withProps({ navigation });
        const wrapper = mount(EscalatedNavigation, {
            slots: { default: '<template #default="{ item }"><b>{{ item.label.toUpperCase() }}</b></template>' },
        });
        expect(wrapper.findAll('b').map((b) => b.text())).toEqual(['REPORTS', 'TICKETS', 'CRM']);
    });
});
