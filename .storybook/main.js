import vue from '@vitejs/plugin-vue';

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
        return config;
    },
};
export default config;
