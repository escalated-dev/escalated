import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './screenshots',
    outputDir: './screenshot-results',
    timeout: 60000,
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.01,
        },
    },
    use: {
        baseURL: 'http://localhost:6006',
        screenshot: 'on',
    },
    webServer: {
        command: 'npx storybook build --output-dir storybook-static && npx http-server storybook-static -p 6006 -s',
        port: 6006,
        timeout: 120000,
        reuseExistingServer: true,
    },
    projects: [
        {
            name: 'screenshots',
            use: {
                viewport: { width: 1280, height: 720 },
            },
        },
    ],
});
