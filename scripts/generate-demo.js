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

// Storybook iframe story URLs — rendered without Storybook chrome
const STORIES = {
    dashboard: `${BASE_URL}/iframe.html?id=pages-admindashboard--full-dashboard&viewMode=story`,
    ticketList: `${BASE_URL}/iframe.html?id=pages-admindashboard--ticket-list-view&viewMode=story`,
    ticketDetail: `${BASE_URL}/iframe.html?id=pages-admindashboard--ticket-detail-view&viewMode=story`,
};

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
        recordVideo: {
            dir: RECORDINGS_DIR,
            size: VIEWPORT,
        },
    });
    const page = await context.newPage();
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

async function loadStory(page, url) {
    await page.goto(url, { waitUntil: 'networkidle' });
    // Wait for Storybook to mount the story root
    await page.waitForSelector('#storybook-root', { state: 'attached', timeout: 15000 });
    await pause(400);
}

async function runDemoFlow(page) {
    // 1. Admin dashboard overview
    console.log('[demo] Showing admin dashboard...');
    await loadStory(page, STORIES.dashboard);
    await pause(2000);

    // 2. Ticket list
    console.log('[demo] Showing ticket list...');
    await loadStory(page, STORIES.ticketList);
    await pause(1500);

    // Click "Urgent+" filter chip to show filtering in action
    const urgentChip = page
        .locator('button, span, div')
        .filter({ hasText: /^Urgent\+$/ })
        .first();
    if (await urgentChip.isVisible()) {
        await urgentChip.click();
        await pause(800);
    }

    // 3. Ticket detail view
    console.log('[demo] Showing ticket detail...');
    await loadStory(page, STORIES.ticketDetail);
    await pause(1500);

    // Click "Internal Note" tab to show it, then switch back to Reply
    const noteTab = page.locator('button').filter({ hasText: 'Internal Note' }).first();
    if (await noteTab.isVisible()) {
        await noteTab.click();
        await pause(700);
        const replyTab = page
            .locator('button')
            .filter({ hasText: /^Reply$/ })
            .first();
        await replyTab.click();
        await pause(400);
    }

    // Type a reply in the composer textarea
    console.log('[demo] Typing reply...');
    const textarea = page.locator('textarea').first();
    await textarea.waitFor({ state: 'visible', timeout: 8000 });
    await textarea.click();
    await typeSlowly(
        textarea,
        'Great news — the fix has been deployed. Full quarter exports should work again. Let me know if you run into anything else!',
        48,
    );
    await pause(800);

    // Click the Send Reply span/button
    console.log('[demo] Sending reply...');
    const sendBtn = page.locator('span, button').filter({ hasText: 'Send Reply' }).first();
    await sendBtn.waitFor({ state: 'visible', timeout: 5000 });
    await sendBtn.click();
    await pause(1500);
}

async function teardown(browser, context, page) {
    console.log('[teardown] Closing browser...');
    const video = page.video();
    await context.close(); // video is fully written only after context closes
    await browser.close();
    return video ? await video.path() : undefined;
}

function convertToGif(inputPath, outputPath) {
    console.log(`[convert] Converting ${inputPath} → ${outputPath}`);
    const palette = resolve(dirname(inputPath), `${basename(inputPath, '.webm')}_palette.png`);

    try {
        execSync(
            `ffmpeg -y -i "${inputPath}" -vf "fps=10,scale=800:-1:flags=lanczos,palettegen=stats_mode=diff" "${palette}"`,
            { stdio: 'inherit' },
        );
        execSync(
            `ffmpeg -y -i "${inputPath}" -i "${palette}" -lavfi "fps=10,scale=800:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" "${outputPath}"`,
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
