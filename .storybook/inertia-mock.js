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

// A story that plays out a flow (the README demo) answers router calls itself;
// every other story leaves this unset and navigation stays a no-op.
let routerHandler = null;

export function setRouterHandler(handler) {
    routerHandler = handler;
}

function dispatch(method, url, data, options) {
    if (routerHandler) routerHandler({ method, url, data: data || {}, options: options || {} });
}

export const router = {
    visit: (url, options) => dispatch(options?.method || 'get', url, options?.data, options),
    get: (url, data, options) => dispatch('get', url, data, options),
    post: (url, data, options) => dispatch('post', url, data, options),
    put: (url, data, options) => dispatch('put', url, data, options),
    patch: (url, data, options) => dispatch('patch', url, data, options),
    delete: (url, options) => dispatch('delete', url, options?.data, options),
    reload: (options) => dispatch('reload', page.url, null, options),
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
