import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ErrorPage from '../../src/pages/Error.vue';

/**
 * The refusal and not-found screen.
 *
 * `escalated-rails` has rendered `Escalated/Error` for every 403 and 404 inside
 * the panel with no component behind it, which means a refusal arrived as a
 * blank page. A refusal that says nothing is indistinguishable from a bug.
 */
vi.mock('@inertiajs/vue3', () => ({
    Link: { template: '<a :href="href"><slot /></a>', props: ['href'] },
}));

const mountOptions = { global: { mocks: { route: (name) => `/${name}` } } };

describe('Error', () => {
    it('shows the status it was given', () => {
        const wrapper = mount(ErrorPage, { props: { status: 403 }, ...mountOptions });

        expect(wrapper.text()).toContain('403');
        expect(wrapper.text()).toContain('Not allowed');
    });

    it('prefers the message the backend sent', () => {
        // Backends send this already translated, so it has to win over
        // anything written here.
        const wrapper = mount(ErrorPage, {
            props: { status: 403, message: 'Vous ne pouvez pas envoyer de bulletins.' },
            ...mountOptions,
        });

        expect(wrapper.text()).toContain('Vous ne pouvez pas envoyer de bulletins.');
        expect(wrapper.text()).not.toContain('Your account does not have access');
    });

    it('explains a bare status that arrived with no message', () => {
        const wrapper = mount(ErrorPage, { props: { status: 404 }, ...mountOptions });

        expect(wrapper.text()).toContain('Not found');
        expect(wrapper.text()).toContain('does not exist');
    });

    it('copes with a status it has no wording for', () => {
        const wrapper = mount(ErrorPage, { props: { status: 418 }, ...mountOptions });

        expect(wrapper.text()).toContain('418');
        expect(wrapper.text()).toContain('Something went wrong');
    });

    it('takes the status as a string as well as a number', () => {
        // Some backends serialise it as one.
        const wrapper = mount(ErrorPage, { props: { status: '404' }, ...mountOptions });

        expect(wrapper.text()).toContain('Not found');
    });

    it('does not render the signed-in chrome', () => {
        // The usual reason to be here is having been refused, and the layout's
        // navigation is a list of places the viewer may equally not be allowed
        // to go.
        const wrapper = mount(ErrorPage, { props: { status: 403 }, ...mountOptions });

        expect(wrapper.find('nav').exists()).toBe(false);
    });

    it('offers a way back only when the backend said where that is', () => {
        // The page is reached without a layout to resolve the host's prefix, so
        // a guessed link would be wrong more often than not.
        expect(
            mount(ErrorPage, { props: { status: 404 }, ...mountOptions })
                .find('a')
                .exists(),
        ).toBe(false);

        const wrapper = mount(ErrorPage, { props: { status: 404, home: '/support' }, ...mountOptions });

        expect(wrapper.find('a').attributes('href')).toBe('/support');
    });
});
