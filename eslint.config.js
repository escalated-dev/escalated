import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import storybook from 'eslint-plugin-storybook';

export default [
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    ...storybook.configs['flat/recommended'],
    {
        languageOptions: {
            globals: {
                // Browser globals
                document: 'readonly',
                window: 'readonly',
                navigator: 'readonly',
                fetch: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                requestAnimationFrame: 'readonly',
                confirm: 'readonly',
                alert: 'readonly',
                DOMParser: 'readonly',
                URL: 'readonly',
                console: 'readonly',
                // Inertia/Ziggy route helper
                route: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-redeclare': 'off',
            'no-control-regex': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/require-default-prop': 'off',
            'vue/no-v-html': 'off',
            'vue/html-indent': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/html-self-closing': 'off',
            'vue/first-attribute-linebreak': 'off',
            'vue/html-closing-bracket-newline': 'off',
            'vue/no-deprecated-slot-attribute': 'off',
            'vue/prop-name-casing': 'off',
        },
    },
    {
        ignores: ['node_modules/', 'dist/', 'storybook-static/', 'screenshots/', 'playwright-screenshots.config.js'],
    },
];
