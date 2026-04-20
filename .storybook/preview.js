import { computed } from 'vue';
import './storybook.css';

const panelDarkDefaults = {
    '--esc-panel-bg': '#000000',
    '--esc-panel-sidebar-bg': '#0a0a0a',
    '--esc-panel-topbar-bg': 'rgba(0,0,0,0.8)',
    '--esc-panel-surface': 'rgba(23,23,23,0.6)',
    '--esc-panel-surface-alt': '#0a0a0a',
    '--esc-panel-border': 'rgba(255,255,255,0.06)',
    '--esc-panel-border-input': 'rgba(255,255,255,0.1)',
    '--esc-panel-text': '#ffffff',
    '--esc-panel-text-secondary': '#e5e5e5',
    '--esc-panel-text-tertiary': '#a3a3a3',
    '--esc-panel-text-muted': '#737373',
    '--esc-panel-accent': '#06b6d4',
    '--esc-panel-accent-secondary': '#8b5cf6',
    '--esc-panel-accent-hover': '#22d3ee',
    '--esc-panel-accent-secondary-hover': '#a78bfa',
    '--esc-panel-hover': 'rgba(255,255,255,0.03)',
    '--esc-panel-active': 'rgba(255,255,255,0.08)',
};

const panelPresets = {
    'default-dark': panelDarkDefaults,
    'default-light': {
        '--esc-panel-bg': '#f9fafb',
        '--esc-panel-sidebar-bg': '#ffffff',
        '--esc-panel-topbar-bg': 'rgba(255,255,255,0.95)',
        '--esc-panel-surface': '#ffffff',
        '--esc-panel-surface-alt': '#f9fafb',
        '--esc-panel-border': '#e5e7eb',
        '--esc-panel-border-input': '#d1d5db',
        '--esc-panel-text': '#111827',
        '--esc-panel-text-secondary': '#374151',
        '--esc-panel-text-tertiary': '#6b7280',
        '--esc-panel-text-muted': '#9ca3af',
        '--esc-panel-accent': '#3b82f6',
        '--esc-panel-accent-secondary': '#6366f1',
        '--esc-panel-accent-hover': '#2563eb',
        '--esc-panel-accent-secondary-hover': '#818cf8',
        '--esc-panel-hover': 'rgba(0,0,0,0.02)',
        '--esc-panel-active': '#eff6ff',
    },
    'custom-brand': {
        '--esc-panel-bg': '#0f0f23',
        '--esc-panel-sidebar-bg': '#1a1a2e',
        '--esc-panel-topbar-bg': 'rgba(15,15,35,0.8)',
        '--esc-panel-surface': '#16213e',
        '--esc-panel-surface-alt': '#0f0f23',
        '--esc-panel-border': 'rgba(255,255,255,0.08)',
        '--esc-panel-border-input': 'rgba(255,255,255,0.12)',
        '--esc-panel-text': '#ffffff',
        '--esc-panel-text-secondary': '#a0aec0',
        '--esc-panel-text-tertiary': '#718096',
        '--esc-panel-text-muted': '#4a5568',
        '--esc-panel-accent': '#e94560',
        '--esc-panel-accent-secondary': '#ff6b6b',
        '--esc-panel-accent-hover': '#c81e45',
        '--esc-panel-accent-secondary-hover': '#ff8787',
        '--esc-panel-hover': 'rgba(255,255,255,0.03)',
        '--esc-panel-active': 'rgba(233,69,96,0.12)',
    },
};

function applyPanelPreset(el, presetName) {
    const preset = panelPresets[presetName] || panelDarkDefaults;
    for (const [prop, value] of Object.entries(preset)) {
        el.style.setProperty(prop, value);
    }
}

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
        panelTheme: {
            name: 'Panel Theme',
            description: 'Panel theme preset',
            defaultValue: 'default-dark',
            toolbar: {
                icon: 'grid',
                items: [
                    { value: 'default-dark', title: 'Default Dark' },
                    { value: 'default-light', title: 'Default Light' },
                    { value: 'custom-brand', title: 'Custom Brand' },
                ],
                dynamicTitle: true,
            },
        },
    },
    decorators: [
        (story, context) => {
            const theme = context.globals.theme || 'dark';
            const panelTheme = context.globals.panelTheme || 'default-dark';

            // Apply panel theme CSS variables to document root
            applyPanelPreset(document.documentElement, panelTheme);

            // Fullscreen stories render without the padded wrapper so they
            // can fill the iframe edge-to-edge (used by the demo GIF flow).
            if (context.parameters?.layout === 'fullscreen') {
                const isDark = theme !== 'light';
                return {
                    components: { story },
                    provide: { 'esc-dark': computed(() => isDark) },
                    template: `<story />`,
                };
            }

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
