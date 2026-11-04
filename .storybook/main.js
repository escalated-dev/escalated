import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
    stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
    framework: '@storybook/vue3-vite',
    async viteFinal(config) {
        const hasVue = config.plugins?.some(
            (p) => p && (p.name === 'vite:vue' || (Array.isArray(p) && p[0]?.name === 'vite:vue')),
        );
        if (!hasVue) {
            config.plugins = config.plugins || [];
            config.plugins.push(vue());
        }
        // Pages and the agent shell read shared props through usePage(). Storybook
        // has no Inertia app, so stories get a stand-in they can set props on.
        config.resolve = config.resolve || {};
        const alias = { '@inertiajs/vue3': fileURLToPath(new URL('./inertia-mock.js', import.meta.url)) };
        config.resolve.alias = Array.isArray(config.resolve.alias)
            ? [...config.resolve.alias, { find: '@inertiajs/vue3', replacement: alias['@inertiajs/vue3'] }]
            : { ...(config.resolve.alias || {}), ...alias };
        return config;
    },
};
export default config;
