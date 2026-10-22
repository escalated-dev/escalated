import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SlaPolicyForm from '../../src/pages/Admin/SlaPolicies/Form.vue';
import DepartmentForm from '../../src/pages/Admin/Departments/Form.vue';

/**
 * Which business schedule an SLA policy or a department counts its
 * business-hours deadlines in (policy, else department, else the default).
 *
 * Backends that support it pass a `schedules` list and accept
 * `business_schedule_id` (null for "use the default"). They leave the stored
 * schedule alone when the key is not sent, so a page rendered without the list
 * must not send it at all: a backend without schedules would otherwise see an
 * unknown field, and one with them would have its value cleared.
 */
const submitted = vi.hoisted(() => ({ forms: [] }));

vi.mock('@inertiajs/vue3', async () => {
    const { reactive } = await import('vue');

    return {
        useForm: vi.fn((data) => {
            const form = reactive({
                ...data,
                processing: false,
                errors: {},
                data() {
                    return Object.fromEntries(Object.keys(data).map((key) => [key, form[key]]));
                },
            });
            form.post = vi.fn(() => submitted.forms.push(form.data()));
            form.put = vi.fn(() => submitted.forms.push(form.data()));
            return form;
        }),
        usePage: vi.fn(() => ({ props: { escalated: { prefix: 'support', is_admin: true } } })),
        router: { post: vi.fn() },
        Link: { template: '<a><slot /></a>' },
    };
});

vi.stubGlobal(
    'route',
    vi.fn((name) => `/${name}`),
);

const mountOptions = {
    global: {
        stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
        mocks: { route: (name) => `/${name}` },
    },
};

const schedules = [
    { id: 3, name: 'Office hours' },
    { id: 7, name: 'Weekend cover' },
];

beforeEach(() => {
    submitted.forms = [];
});

const pages = [
    {
        name: 'Admin/SlaPolicies/Form',
        component: SlaPolicyForm,
        props: { priorities: ['low', 'high'] },
        recordKey: 'policy',
        record: { id: 1, name: 'Standard', business_hours_only: true },
    },
    {
        name: 'Admin/Departments/Form',
        component: DepartmentForm,
        props: {},
        recordKey: 'department',
        record: { id: 2, name: 'Billing', slug: 'billing' },
    },
];

describe.each(pages)('$name business schedule', ({ component, props, recordKey, record }) => {
    it('renders as before when the backend sends no schedules', async () => {
        const wrapper = mount(component, { props: { ...props }, ...mountOptions });

        expect(wrapper.find('#business-schedule').exists()).toBe(false);
        expect(wrapper.text()).not.toContain('Business hours schedule');

        await wrapper.find('form').trigger('submit');
        expect(submitted.forms).toHaveLength(1);
        expect(submitted.forms[0]).not.toHaveProperty('business_schedule_id');
    });

    it('does not send a schedule for a saved record when the backend sends no schedules', async () => {
        const wrapper = mount(component, {
            props: { ...props, [recordKey]: { ...record, business_schedule_id: 3 } },
            ...mountOptions,
        });

        await wrapper.find('form').trigger('submit');
        expect(submitted.forms[0]).not.toHaveProperty('business_schedule_id');
    });

    it('offers the default plus each schedule', () => {
        const wrapper = mount(component, { props: { ...props, schedules }, ...mountOptions });
        const select = wrapper.find('select#business-schedule');

        expect(select.exists()).toBe(true);
        expect(wrapper.find('label[for="business-schedule"]').text()).toBe('Business hours schedule');
        expect(select.findAll('option').map((o) => o.text())).toEqual([
            'Use the default',
            'Office hours',
            'Weekend cover',
        ]);
    });

    it('posts null for "Use the default" on a new record', async () => {
        const wrapper = mount(component, { props: { ...props, schedules }, ...mountOptions });

        await wrapper.find('form').trigger('submit');
        expect(submitted.forms[0].business_schedule_id).toBeNull();
    });

    it('posts the chosen schedule id', async () => {
        const wrapper = mount(component, { props: { ...props, schedules }, ...mountOptions });

        await wrapper.find('select#business-schedule').findAll('option')[2].setSelected();
        await wrapper.find('form').trigger('submit');
        expect(submitted.forms[0].business_schedule_id).toBe(7);
    });

    it('starts from the saved schedule and can go back to the default', async () => {
        const wrapper = mount(component, {
            props: { ...props, schedules, [recordKey]: { ...record, business_schedule_id: 3 } },
            ...mountOptions,
        });
        const select = wrapper.find('select#business-schedule');

        expect(select.element.selectedOptions[0].text).toBe('Office hours');

        await select.findAll('option')[0].setSelected();
        await wrapper.find('form').trigger('submit');
        expect(submitted.forms[0].business_schedule_id).toBeNull();
    });
});
