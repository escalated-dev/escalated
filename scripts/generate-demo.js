#!/usr/bin/env node
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, readdirSync, statSync, rmSync } from 'fs';
import { join, resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = process.env.DEMO_BASE_URL || 'http://localhost:3000';
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
    console.log(`[demo] Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await pause(1000);

    console.log('[demo] Viewing dashboard...');
    await pause(1200);

    console.log('[demo] Opening new ticket form...');
    const newTicketBtn = page
        .getByRole('button', { name: /new ticket/i })
        .or(page.getByRole('link', { name: /new ticket/i }))
        .or(page.locator('[data-testid="new-ticket"]'))
        .first();

    await newTicketBtn.waitFor({ timeout: 10000 });
    await newTicketBtn.click();
    await pause(700);

    const subjectField = page
        .getByLabel(/subject/i)
        .or(page.getByPlaceholder(/subject/i))
        .or(page.locator('input[name="subject"]'))
        .first();

    await subjectField.waitFor({ timeout: 8000 });
    await subjectField.click();
    await typeSlowly(subjectField, 'Login page returns 500 error');
    await pause(500);

    const bodyField = page
        .getByLabel(/message|description|body/i)
        .or(page.getByPlaceholder(/describe|message/i))
        .or(page.locator('textarea[name="body"]'))
        .first();

    await bodyField.waitFor({ state: 'visible', timeout: 5000 });
    await bodyField.click();
    await typeSlowly(
        bodyField,
        'Users are unable to log in since the last deployment. The login page returns a 500 error intermittently.',
        40,
    );
    await pause(600);

    console.log('[demo] Submitting ticket...');
    const submitBtn = page.getByRole('button', { name: /submit|create|save/i }).first();
    await submitBtn.click();
    // demo-server auto-opens the thread 600ms after submit — wait for it
    await pause(1400);

    console.log('[demo] Ticket thread opened, typing reply...');
    const replyBox = page
        .getByPlaceholder(/type a reply/i)
        .or(page.locator('#reply-box'))
        .or(page.locator('[data-testid="reply-composer"] textarea'))
        .first();

    await replyBox.waitFor({ state: 'visible', timeout: 5000 });
    await replyBox.click();
    await typeSlowly(
        replyBox,
        "Thanks for reporting this. We've identified the issue and a fix is being deployed now.",
        45,
    );
    await pause(700);

    const sendBtn = page.getByRole('button', { name: /send|reply/i }).first();
    await sendBtn.waitFor({ state: 'visible', timeout: 5000 });
    await sendBtn.click();
    await pause(1000);

    console.log('[demo] Showing notification...');
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
