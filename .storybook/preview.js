import { computed } from 'vue';
import './storybook.css';

/** @type { import('@storybook/vue3-vite').Preview } */
const preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        a11y: {
            test: 'todo',
        },
    },
    globalTypes: {
        theme: {
            name: 'Theme',
            description: 'Dark or light mode',
            defaultValue: 'dark',
            toolbar: {
                icon: 'paintbrush',
                items: [
                    { value: 'dark', title: 'Dark' },
                    { value: 'light', title: 'Light' },
                    { value: 'side-by-side', title: 'Side by Side' },
                ],
                dynamicTitle: true,
            },
        },
    },
    decorators: [
        (story, context) => {
            const theme = context.globals.theme || 'dark';

            if (theme === 'side-by-side') {
                return {
                    components: { story },
                    provide: {
                        'esc-dark': computed(() => false),
                    },
                    setup() {
                        const darkProvide = { 'esc-dark': computed(() => true) };
                        return { darkProvide };
                    },
                    template: `
                        <div style="display: flex; gap: 24px; align-items: flex-start;">
                            <div style="flex: 1; padding: 24px; background: #fff; border-radius: 12px;">
                                <div style="font-size: 11px; color: #999; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Light</div>
                                <story />
                            </div>
                            <div style="flex: 1; padding: 24px; background: #171717; border-radius: 12px;">
                                <div style="font-size: 11px; color: #666; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Dark</div>
                                <story v-bind="darkProvide" />
                            </div>
                        </div>
                    `,
                };
            }

            const isDark = theme === 'dark';
            return {
                components: { story },
                provide: {
                    'esc-dark': computed(() => isDark),
                },
                template: `
                    <div style="padding: 24px; min-height: 100px; border-radius: 12px;"
                         :style="{ background: ${isDark} ? '#171717' : '#fff' }">
                        <story />
                    </div>
                `,
            };
        },
    ],
};

export default preview;
