import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { router } from '@inertiajs/core';
import Records from '../../src/pages/Admin/CustomObjects/Records.vue';

/**
 * The records screen kept each record's field values in a form field named
 * `data`. `data()` is one of useForm's own methods, so Inertia logged a
 * conflict error on every visit, and filling in a record assigned over the
 * method the form submits with.
 *
 * This mounts the screen on the real useForm, which is the only way to see
 * either: a mocked form has no methods to collide with.
 */
vi.stubGlobal(
    'route',
    vi.fn((name) => `/${name}`),
);

const object = {
    id: 7,
    name: 'Vehicles',
    fields_schema: [
        { name: 'plate', label: 'Plate', type: 'text' },
        { name: 'make', label: 'Make', type: 'text' },
    ],
};

function mountRecords(records = []) {
    return mount(Records, {
        props: { object, records },
        global: {
            stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
            mocks: { route: (name) => `/${name}` },
        },
    });
}

describe('Admin/CustomObjects/Records', () => {
    let errors;

    beforeEach(() => {
        errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('builds its forms without colliding with useForm', () => {
        mountRecords();

        const conflicts = errors.mock.calls.filter(([message]) =>
            String(message).includes('conflict with form properties'),
        );
        expect(conflicts).toEqual([]);
    });

    it('posts a new record as { data } with the values entered', async () => {
        const post = vi.spyOn(router, 'post').mockImplementation(() => {});
        const wrapper = mountRecords();

        await wrapper
            .findAll('button')
            .find((b) => b.text() === 'Add Record')
            .trigger('click');
        const inputs = wrapper.findAll('input[type="text"]');
        await inputs[0].setValue('ABC 123');
        await inputs[1].setValue('Ford');
        await wrapper.find('form').trigger('submit');

        expect(post).toHaveBeenCalledTimes(1);
        expect(post.mock.calls[0][0]).toBe('/escalated.admin.custom-objects.records.store');
        expect(post.mock.calls[0][1]).toEqual({ data: { plate: 'ABC 123', make: 'Ford' } });
    });
});
