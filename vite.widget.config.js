import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

/**
 * Builds the standalone widget bundle (dist/widget/escalated-widget.js): one
 * IIFE with Vue included, loadable with a plain <script> tag on any site.
 * Backends serve it at {widgetPath}/embed.js.
 *
 * Component <style> blocks would normally land in a separate .css file that
 * a shadow root never sees, so they are moved into the script, where the
 * loader adds them to each widget's shadow root.
 */
function inlineCssIntoShadowRoot() {
    return {
        name: 'escalated-inline-widget-css',
        apply: 'build',
        enforce: 'post',
        generateBundle(_, bundle) {
            const styles = Object.values(bundle).filter(
                (file) => file.type === 'asset' && file.fileName.endsWith('.css'),
            );
            const css = styles.map((file) => String(file.source)).join('\n');
            for (const file of styles) delete bundle[file.fileName];
            const entry = Object.values(bundle).find((file) => file.type === 'chunk' && file.isEntry);
            entry.code = `/*! @escalated-dev/escalated ${version} widget | MIT */\nglobalThis.__ESCALATED_WIDGET_CSS__=${JSON.stringify(css)};\n${entry.code}`;
        },
    };
}

export default defineConfig({
    plugins: [vue(), inlineCssIntoShadowRoot()],
    // The widget's CSS is plain; skip the package's Tailwind PostCSS setup.
    css: { postcss: { plugins: [] } },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    },
    build: {
        outDir: 'dist/widget',
        emptyOutDir: true,
        cssCodeSplit: false,
        sourcemap: false,
        lib: {
            entry: 'src/widget/index.js',
            name: 'EscalatedWidgetBundle',
            formats: ['iife'],
            fileName: () => 'escalated-widget.js',
        },
    },
});
