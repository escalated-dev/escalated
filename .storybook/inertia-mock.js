/* eslint-disable vue/one-component-per-file */
/**
 * Stand-in for @inertiajs/vue3 in Storybook.
 *
 * Pages and the agent shell read shared props through usePage(), which needs an
 * Inertia app. Storybook has none, so stories set the page here instead and
 * navigation is a no-op.
 */
import { defineComponent, h, reactive } from 'vue';

export const page = reactive({ component: '', url: '/', props: {}, version: null });

export function setPage(url, props = {}) {
    page.url = url;
    page.props = props;
}

export function usePage() {
    return page;
}

const noop = () => {};

export const router = {
    visit: noop,
    get: noop,
    post: noop,
    put: noop,
    patch: noop,
    delete: noop,
    reload: noop,
    on: () => noop,
};

export function useForm(data = {}) {
    const form = reactive({
        ...data,
        processing: false,
        errors: {},
        hasErrors: false,
        data: () => ({ ...data }),
        post: noop,
        put: noop,
        patch: noop,
        delete: noop,
        submit: noop,
        reset: noop,
        clearErrors: noop,
        transform: () => form,
    });
    return form;
}

export const Link = defineComponent({
    name: 'InertiaLink',
    inheritAttrs: false,
    props: {
        href: { type: String, default: '#' },
        method: String,
        as: String,
        data: Object,
        preserveState: Boolean,
        preserveScroll: Boolean,
        only: Array,
    },
    setup(props, { slots, attrs }) {
        return () =>
            h(
                'a',
                {
                    ...attrs,
                    href: props.href,
                    onClick: (event) => {
                        event.preventDefault();
                        if (typeof attrs.onClick === 'function') attrs.onClick(event);
                    },
                },
                slots.default?.(),
            );
    },
});

export const Head = defineComponent({ name: 'InertiaHead', render: () => null });

export function usePoll() {
    return { start: noop, stop: noop };
}

export function usePrefetch() {
    return { isPrefetching: false, isPrefetched: false, flush: noop };
}

export function useRemember(value) {
    return value;
}

export function createInertiaApp() {
    return Promise.resolve();
}
