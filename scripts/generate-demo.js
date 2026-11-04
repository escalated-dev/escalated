#!/usr/bin/env node
/**
 * Records the README demo GIF (.github/profile/demo.gif) from the
 * `Agent/Demo` Storybook story, which renders the real widget and agent pages.
 *
 * Frames come from Chromium's screencast as lossless PNGs (a recorded video is
 * lossy and blurs small text), each held for as long as it stayed on screen,
 * then ffmpeg builds one palette for the whole clip and encodes the GIF.
 *
 *   DEMO_BASE_URL     Storybook to record (default http://localhost:6006)
 *   DEMO_DEBUG_FRAMES write a few PNG frames next to the GIF for a quick look
 *   KEEP_FRAMES       keep the raw screencast frames in recordings/
 */
import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import { mkdirSync, rmSync, statSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = process.env.DEMO_BASE_URL || 'http://localhost:6006';
const FRAMES_DIR = resolve(ROOT, 'recordings/demo-frames');
const OUTPUT_GIF = resolve(ROOT, '.github/profile/demo.gif');
const VIEWPORT = { width: 1280, height: 800 };
const GIF_WIDTH = VIEWPORT.width;
const GIF_FPS = 12;
const STORY_URL = `${BASE_URL}/iframe.html?id=agent-demo--flow&viewMode=story`;

function checkDependencies() {
    try {
        execFileSync('ffmpeg', ['-version'], { stdio: 'pipe' });
    } catch {
        console.error('[fatal] ffmpeg not found. Install it before running this script.');
        console.error('  macOS:   brew install ffmpeg');
        console.error('  Ubuntu:  sudo apt-get install -y ffmpeg');
        console.error('  Windows: winget install ffmpeg');
        process.exit(1);
    }
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function typeSlowly(locator, text, delay = 40) {
    await locator.pressSequentially(text, { delay });
}

/** Chromium screencast: a PNG each time the page repaints, with its timestamp. */
async function startScreencast(page) {
    const frames = [];
    const session = await page.context().newCDPSession(page);
    session.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
        const file = resolve(FRAMES_DIR, `f${String(frames.length).padStart(5, '0')}.png`);
        writeFileSync(file, Buffer.from(data, 'base64'));
        frames.push({ file, t: metadata.timestamp });
        await session.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    });
    await session.send('Page.startScreencast', {
        format: 'png',
        maxWidth: VIEWPORT.width,
        maxHeight: VIEWPORT.height,
        everyNthFrame: 1,
    });
    return {
        frames,
        async stop() {
            await session.send('Page.stopScreencast').catch(() => {});
            return Date.now() / 1000;
        },
    };
}

async function runDemoFlow(page) {
    // The customer's site with the support widget's launcher.
    const launcher = page.locator('.esc-w-fab');
    await launcher.waitFor({ state: 'visible', timeout: 15000 });
    await pause(1400);

    console.log('[demo] Customer opens the widget and files a ticket...');
    await launcher.hover();
    await pause(300);
    await launcher.click();
    await pause(700);

    const panel = page.locator('[data-widget-panel]');
    const subject = panel.locator('input[type="text"]').nth(1);
    await subject.click();
    await typeSlowly(subject, 'Team invites expire straight away', 45);
    await pause(250);
    const description = panel.locator('textarea');
    await description.click();
    await typeSlowly(
        description,
        "Jordan's invite link says it has expired the moment they open it. We've resent it three times.",
        18,
    );
    await pause(500);
    await panel.locator('.esc-w-btn').click();
    await panel.locator('.esc-w-success').waitFor({ state: 'visible', timeout: 5000 });
    console.log('[demo] Ticket filed; switching to the agent inbox...');

    // The story moves to the agent inbox on its own after the confirmation.
    const row = page.locator('[data-testid="esc-queue-row"]').first();
    await row.waitFor({ state: 'visible', timeout: 10000 });
    await pause(1600);

    console.log('[demo] Agent opens the new ticket...');
    const rowLink = row.locator('a').first();
    await rowLink.hover();
    await pause(450);
    await rowLink.click();
    await page.locator('[data-testid="esc-detail-pane"]').waitFor({ state: 'visible', timeout: 5000 });
    await pause(1500);

    console.log('[demo] Assigning and replying...');
    const assign = page.locator('[data-testid="esc-assign-me"]');
    await assign.hover();
    await pause(250);
    await assign.click();
    await pause(700);

    const input = page.locator('[data-testid="esc-composer-input"]');
    await input.click();
    await pause(200);
    await typeSlowly(
        input,
        "Hi Alex, invite links were expiring early after Tuesday's release. That's fixed now: resend Jordan's invite and it will last 7 days.",
        16,
    );
    await pause(500);
    await page.locator('[data-testid="esc-composer-send"]').click();
    await pause(1400);

    console.log('[demo] Setting the status...');
    const status = page.locator('[data-testid="esc-status"]');
    await status.click();
    await pause(700);
    const waiting = page.getByRole('menuitemradio', { name: /waiting on customer/i });
    await waiting.hover();
    await pause(350);
    await waiting.click();
    await pause(2600);
}

/** Writes an ffmpeg concat list that holds each frame until the next one arrived. */
function writeConcatList(frames, endT) {
    const list = resolve(FRAMES_DIR, 'frames.txt');
    const lines = [];
    frames.forEach((frame, i) => {
        const next = i + 1 < frames.length ? frames[i + 1].t : endT;
        const duration = Math.max(0.001, next - frame.t);
        lines.push(`file '${frame.file.replace(/\\/g, '/')}'`, `duration ${duration.toFixed(3)}`);
    });
    // The concat demuxer ignores the last entry's duration unless it is repeated.
    lines.push(`file '${frames[frames.length - 1].file.replace(/\\/g, '/')}'`);
    writeFileSync(list, lines.join('\n') + '\n');
    return list;
}

function encodeGif(list, output) {
    const palette = resolve(FRAMES_DIR, 'palette.png');
    const scale = `fps=${GIF_FPS},scale=${GIF_WIDTH}:-1:flags=lanczos`;
    const input = ['-f', 'concat', '-safe', '0', '-i', list];
    // One palette for the whole clip. The UI is flat colour and small text, so
    // dithering only adds noise (and bytes); rectangle diffing keeps frames that
    // differ by a caret or a typed character tiny.
    execFileSync('ffmpeg', [
        '-y',
        '-v',
        'error',
        ...input,
        '-vf',
        `${scale},palettegen=max_colors=256:stats_mode=full`,
        palette,
    ]);
    execFileSync('ffmpeg', [
        '-y',
        '-v',
        'error',
        ...input,
        '-i',
        palette,
        '-lavfi',
        `[0:v]${scale}[x];[x][1:v]paletteuse=dither=none:diff_mode=rectangle`,
        '-loop',
        '0',
        output,
    ]);
    rmSync(palette, { force: true });
}

function extractDebugFrames(output) {
    const dir = dirname(output);
    const duration = Number(
        execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', output])
            .toString()
            .trim(),
    );
    const points = { early: 0.12, mid: 0.45, late: 0.7, end: 0.97 };
    for (const [label, fraction] of Object.entries(points)) {
        const file = resolve(dir, `demo_frame_${label}.png`);
        execFileSync('ffmpeg', [
            '-y',
            '-v',
            'error',
            '-ss',
            (duration * fraction).toFixed(2),
            '-i',
            output,
            '-frames:v',
            '1',
            file,
        ]);
        console.log(`[debug] frame ${label}: ${file}`);
    }
}

async function main() {
    checkDependencies();
    rmSync(FRAMES_DIR, { recursive: true, force: true });
    mkdirSync(FRAMES_DIR, { recursive: true });
    mkdirSync(dirname(OUTPUT_GIF), { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: VIEWPORT, colorScheme: 'dark', deviceScaleFactor: 1 });
    const page = await context.newPage();
    // Black from the first paint, and no Storybook loader in the frames.
    await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = `
            html, body, #storybook-root { background: #000 !important; margin: 0; }
            .sb-nopreview, .sb-preparing-story, .sb-preparing-docs, .sb-errordisplay,
            [class*="sb-loader"] { display: none !important; }
        `;
        (document.head || document.documentElement).appendChild(style);
    });

    console.log(`[demo] Loading ${STORY_URL}`);
    await page.goto(STORY_URL, { waitUntil: 'networkidle' });
    await page.locator('.demo-site').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('.esc-w-fab').waitFor({ state: 'visible', timeout: 15000 });
    await pause(300);

    const cast = await startScreencast(page);
    let failure = null;
    try {
        await runDemoFlow(page);
    } catch (err) {
        failure = err;
    }
    const endT = await cast.stop();
    await pause(200);
    await browser.close();

    if (failure) {
        console.error('[fatal] Demo flow failed:', failure.message);
        process.exit(1);
    }
    if (cast.frames.length < 20) {
        console.error(`[fatal] Only ${cast.frames.length} frames captured`);
        process.exit(1);
    }
    console.log(`[record] ${cast.frames.length} frames over ${(endT - cast.frames[0].t).toFixed(1)}s`);

    encodeGif(writeConcatList(cast.frames, endT), OUTPUT_GIF);
    const size = statSync(OUTPUT_GIF).size;
    console.log(`[convert] GIF saved: ${OUTPUT_GIF} (${(size / 1024 / 1024).toFixed(2)} MB)`);
    if (size > 5 * 1024 * 1024) console.warn('[warn] GIF exceeds the 5 MB target');

    if (process.env.DEMO_DEBUG_FRAMES) extractDebugFrames(OUTPUT_GIF);
    if (!process.env.KEEP_FRAMES) rmSync(resolve(ROOT, 'recordings'), { recursive: true, force: true });
    console.log(`[done] ${OUTPUT_GIF}`);
}

main().catch((err) => {
    console.error('[fatal]', err);
    process.exit(1);
});
