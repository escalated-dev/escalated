import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Show from '../../../../../src/pages/Admin/Newsletters/Templates/Show.vue';

vi.mock('@inertiajs/vue3', () => ({
    router: { post: vi.fn(), put: vi.fn() },
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

describe('Templates Show', () => {
    it('renders the template name and body for an existing template', () => {
        const wrapper = mount(Show, {
            props: {
                template: {
                    id: 1,
                    name: 'Monthly',
                    theme: 'branded',
                    subject_template: 'Monthly update',
                    body_markdown: '# Hi',
                },
                themes: ['default', 'branded'],
                isNew: false,
            },
            global: globalConfig,
        });
        const inputs = wrapper.findAll('input');
        expect(inputs[0].element.value).toBe('Monthly');
        expect(wrapper.find('textarea').element.value).toBe('# Hi');
    });
});
