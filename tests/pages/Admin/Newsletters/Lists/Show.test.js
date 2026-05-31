import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Show from '../../../../../src/pages/Admin/Newsletters/Lists/Show.vue';

vi.mock('@inertiajs/vue3', () => ({
    router: { delete: vi.fn(), put: vi.fn() },
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
    usePage: () => ({ props: { escalated: { is_admin: true, prefix: 'support' } } }),
}));

vi.mock('../../../../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

const globalConfig = {
    mocks: { $t: (key) => key },
    stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
};

describe('Lists Show', () => {
    it('shows member table for static lists', () => {
        const wrapper = mount(Show, {
            props: {
                list: {
                    id: 1,
                    name: 'All',
                    kind: 'static',
                    description: '',
                    member_count: 2,
                    opted_out_count: 0,
                    filter_json: null,
                },
                members: {
                    data: [
                        {
                            id: 1,
                            contact: { id: 10, name: 'A', email: 'a@example.com' },
                            added_at: '2026-05-19T00:00:00Z',
                        },
                    ],
                    links: [],
                    meta: {},
                },
                matchCount: 0,
            },
            global: globalConfig,
        });
        expect(wrapper.find('.list-member-table').exists()).toBe(true);
        expect(wrapper.find('.dynamic-filter-builder').exists()).toBe(false);
    });

    it('shows filter builder for dynamic lists', () => {
        const wrapper = mount(Show, {
            props: {
                list: {
                    id: 1,
                    name: 'Active',
                    kind: 'dynamic',
                    description: '',
                    member_count: 0,
                    opted_out_count: 0,
                    filter_json: { rules: [] },
                },
                members: { data: [], links: [], meta: {} },
                matchCount: 42,
            },
            global: globalConfig,
        });
        expect(wrapper.find('.dynamic-filter-builder').exists()).toBe(true);
        expect(wrapper.find('.list-member-table').exists()).toBe(false);
    });
});
