#!/usr/bin/env node
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, readdirSync, statSync, rmSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = process.env.DEMO_BASE_URL || 'http://localhost:8000';
const RECORDINGS_DIR = resolve(ROOT, 'recordings');
const OUTPUT_GIF = resolve(ROOT, '.github/profile/demo.gif');
const VIEWPORT = { width: 1280, height: 800 };

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

async function typeSlowly(locator, text, delay = 60) {
    for (const char of text) {
        await locator.pressSequentially(char);
        await pause(delay);
    }
}

async function runDemoFlow(page) {
    console.log(`[demo] Loading demo picker at ${BASE_URL}/demo ...`);
    await page.goto(`${BASE_URL}/demo`, { waitUntil: 'networkidle' });
    await pause(1000);

    console.log('[demo] Logging in as Alice Admin...');
    const aliceBtn = page.locator('button.user').filter({ hasText: 'Alice Admin' });
    await aliceBtn.waitFor({ state: 'visible', timeout: 15000 });
    await aliceBtn.click();

    console.log('[demo] Waiting for ticket list...');
    await page.waitForURL('**/admin/tickets**', { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    await pause(1500);

    console.log('[demo] Clicking into first ticket...');
    // Wait for Inertia to hydrate and render at least one ticket reference link
    const firstTicketLink = page.locator('a[href*="/tickets/ESC"]').first();
    await firstTicketLink.waitFor({ state: 'visible', timeout: 20000 });
    await firstTicketLink.click();
    await page.waitForLoadState('networkidle');
    await pause(1200);

    console.log('[demo] Typing reply...');
    const replyTextarea = page.locator('textarea[aria-label="Reply message"]').first();
    await replyTextarea.waitFor({ state: 'visible', timeout: 10000 });
    await replyTextarea.click();
    await typeSlowly(
        replyTextarea,
        "Thanks for reaching out! We've identified the issue and a fix is being deployed. I'll follow up once it's live.",
        45,
    );
    await pause(800);

    console.log('[demo] Sending reply...');
    const sendBtn = page.getByRole('button', { name: /send reply/i }).first();
    await sendBtn.waitFor({ state: 'visible', timeout: 5000 });
    await sendBtn.click();
    await pause(2000);
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
