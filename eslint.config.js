import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';

export default [
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
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
                DOMParser: 'readonly',
                URL: 'readonly',
                console: 'readonly',
                // Inertia/Ziggy route helper
                route: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-control-regex': 'off',
            'vue/multi-word-component-names': 'off',
            'vue/require-default-prop': 'off',
            'vue/no-v-html': 'off',
            'vue/html-indent': ['warn', 4],
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/html-self-closing': 'off',
            'vue/first-attribute-linebreak': 'off',
            'vue/html-closing-bracket-newline': 'off',
            'vue/no-deprecated-slot-attribute': 'off',
        },
    },
    {
        ignores: ['node_modules/', 'dist/'],
    },
];
