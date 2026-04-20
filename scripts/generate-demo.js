#!/usr/bin/env node
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, readdirSync, statSync, rmSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = process.env.DEMO_BASE_URL || 'http://localhost:6006';
const RECORDINGS_DIR = resolve(ROOT, 'recordings');
const OUTPUT_GIF = resolve(ROOT, '.github/profile/demo.gif');
const VIEWPORT = { width: 1280, height: 800 };

// Single story — list ↔ detail transitions happen via reactive state,
// so there are no iframe navigations (and therefore no flashes).
const STORY_URL = `${BASE_URL}/iframe.html?id=pages-admindashboard--demo-flow&viewMode=story`;

function checkDependencies() {
    try {
        execSync('ffmpeg -version', { stdio: 'pipe' });
    } catch {
        console.error('[fatal] ffmpeg not found. Install it before running this script.');
        console.error('  macOS:   brew install ffmpeg');
        console.error('  Ubuntu:  sudo apt-get install -y ffmpeg');
        console.error('  Windows: winget install ffmpeg');
        process.exit(1);
    }
    console.log('[check] ffmpeg found');
}

async function setup() {
    console.log('[setup] Launching Chromium...');
    mkdirSync(RECORDINGS_DIR, { recursive: true });
    mkdirSync(resolve(ROOT, '.github/profile'), { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: VIEWPORT,
        recordVideo: { dir: RECORDINGS_DIR, size: VIEWPORT },
        colorScheme: 'dark',
    });
    const page = await context.newPage();

    // Force a black background before the story mounts so there's no
    // initial white flash when the iframe first loads.
    await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = 'html, body, #storybook-root { background: #000 !important; margin: 0; }';
        (document.head || document.documentElement).appendChild(style);
    });

    return { browser, context, page };
}

async function pause(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function typeSlowly(locator, text, delay = 55) {
    for (const char of text) {
        await locator.pressSequentially(char);
        await pause(delay);
    }
}

async function runDemoFlow(page) {
    console.log(`[demo] Loading DemoFlow story...`);
    await page.goto(STORY_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.demo-root', { state: 'visible', timeout: 15000 });
    await pause(1600);

    console.log('[demo] Viewing ticket list...');
    await pause(800);

    console.log('[demo] Opening ticket ESC-1042...');
    const firstRow = page.locator('[data-testid="demo-ticket-row"]').first();
    await firstRow.waitFor({ state: 'visible', timeout: 8000 });
    // Hover briefly to show the pointer interaction
    await firstRow.hover();
    await pause(400);
    await firstRow.click();
    // Fade transition is 220ms — let it complete before interacting
    await pause(900);

    console.log('[demo] Reading conversation thread...');
    await pause(1600);

    console.log('[demo] Typing reply...');
    const textarea = page.locator('[data-testid="demo-reply-textarea"]');
    await textarea.waitFor({ state: 'visible', timeout: 5000 });
    await textarea.click();
    await pause(300);
    await typeSlowly(
        textarea,
        'The fix has shipped — full quarter exports should work again. Let me know if anything else comes up!',
        48,
    );
    await pause(800);

    console.log('[demo] Sending reply...');
    const sendBtn = page.locator('[data-testid="demo-send-reply"]');
    await sendBtn.click();
    // Toast + new message animation
    await pause(2200);
}

async function teardown(browser, context, page) {
    console.log('[teardown] Closing browser...');
    const video = page.video();
    await context.close();
    await browser.close();
    return video ? await video.path() : undefined;
}

function convertToGif(inputPath, outputPath) {
    console.log(`[convert] Converting ${inputPath} → ${outputPath}`);
    const palette = resolve(dirname(inputPath), `${basename(inputPath, '.webm')}_palette.png`);

    try {
        // stats_mode=full samples every pixel (not just diffs between frames),
        // so low-contrast static UI chrome keeps palette slots instead of
        // being flattened into the background by quantization.
        execSync(
            `ffmpeg -y -i "${inputPath}" -vf "fps=10,scale=800:-1:flags=lanczos,palettegen=stats_mode=full" "${palette}"`,
            { stdio: 'inherit' },
        );
        execSync(
            `ffmpeg -y -i "${inputPath}" -i "${palette}" -lavfi "fps=10,scale=800:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5" "${outputPath}"`,
            { stdio: 'inherit' },
        );
    } finally {
        rmSync(palette, { force: true });
    }

    const sizeBytes = statSync(outputPath).size;
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
    console.log(`[convert] GIF saved: ${outputPath} (${sizeMB} MB)`);
    if (sizeBytes > 5 * 1024 * 1024) {
        console.warn(`[warn] GIF exceeds 5 MB target (${sizeMB} MB) — consider reducing fps or scale`);
    }
}

function findLatestWebm(dir) {
    const files = readdirSync(dir)
        .filter((f) => f.endsWith('.webm'))
        .map((f) => {
            const p = join(dir, f);
            return { path: p, mtime: statSync(p).mtimeMs };
        })
        .sort((a, b) => b.mtime - a.mtime);
    if (files.length === 0) throw new Error('No .webm recordings found in ' + dir);
    return files[0].path;
}

async function main() {
    console.log('[start] Demo recording pipeline starting...');
    checkDependencies();
    const { browser, context, page } = await setup();

    try {
        await runDemoFlow(page);
    } catch (err) {
        console.error('[error] Demo flow failed:', err.message);
        console.log('[info] Continuing to export whatever was recorded...');
    }

    const videoPath = await teardown(browser, context, page);
    const webmPath = videoPath || findLatestWebm(RECORDINGS_DIR);

    console.log(`[record] Video saved: ${webmPath}`);
    convertToGif(webmPath, OUTPUT_GIF);

    if (!process.env.KEEP_WEBM) {
        rmSync(webmPath, { force: true });
        console.log(`[cleanup] Removed source recording: ${webmPath}`);
    }

    console.log(`[done] GIF ready: ${OUTPUT_GIF}`);
}

main().catch((err) => {
    console.error('[fatal]', err);
    process.exit(1);
});
