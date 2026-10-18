import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import { startFlashServer } from '../tests/browser/inertia-flash-server.mjs';

const execute = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const npmCli = process.env.npm_execpath ?? join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
const versions = { 1: '1.3.0', 2: '2.3.29', 3: '3.9.1' };
const requested = process.argv[2] ?? 'all';
const majors = requested === 'all' ? Object.keys(versions) : [requested];
assert(
    majors.every((major) => versions[major]),
    'Choose adapter 1, 2, 3, or all',
);
const output = resolve(process.env.INERTIA_CONTRACT_OUTPUT_DIR ?? join(root, 'test-results/inertia-flash'));
await mkdir(output, { recursive: true });
const temporaryParent = await realpath(tmpdir());
const temporary = await mkdtemp(join(temporaryParent, 'escalated-inertia-flash-'));
const report = { state: 'running', node: process.version, adapters: [], checks: [], diagnostics: [] };
let browser;

async function npm(args, cwd) {
    const result = await execute(process.execPath, [npmCli, ...args], {
        cwd,
        env: { ...process.env, CI: '1' },
        maxBuffer: 8 * 1024 * 1024,
    });
    return JSON.parse(result.stdout);
}

async function check(name, page, action) {
    try {
        await action();
        report.checks.push({ name, status: 'passed' });
        console.log(`PASS ${name}`);
    } catch (error) {
        report.checks.push({ name, status: 'failed', error: error.message });
        await writeFile(join(output, `${name.replaceAll('/', '-')}-failure.html`), await page.content());
        await page.screenshot({ path: join(output, `${name.replaceAll('/', '-')}-failure.png`), fullPage: true });
        throw error;
    }
}

async function createToken(page) {
    await page.getByRole('button', { name: 'Create Token', exact: true }).first().click();
    await page.getByPlaceholder('e.g. Desktop App - Work Laptop').fill('Synthetic fixture token');
    await page.locator('select').first().selectOption('42');
    await page.getByRole('button', { name: 'Create Token', exact: true }).last().click();
}

try {
    const [packed] = await npm(['pack', '--json', '--pack-destination', temporary], root);
    report.packageIntegrity = packed.integrity;
    const vue = JSON.parse(await readFile(join(root, 'node_modules/vue/package.json'), 'utf8')).version;
    for (const major of majors) {
        const consumer = join(temporary, `adapter-${major}`);
        await mkdir(consumer);
        await writeFile(
            join(consumer, 'package.json'),
            JSON.stringify({
                name: `inertia-${major}-contract`,
                private: true,
                version: '1.0.0',
                dependencies: {
                    '@escalated-dev/escalated': `file:${join(temporary, packed.filename).replaceAll('\\', '/')}`,
                    '@inertiajs/vue3': versions[major],
                    vue,
                },
            }),
        );
        console.log(`Installing packaged consumer with Inertia ${versions[major]}`);
        await npm(['install', '--strict-peer-deps', '--engine-strict', '--no-progress', '--json'], consumer);
        const audit = await npm(['audit', '--json'], consumer);
        assert.equal(audit.metadata.vulnerabilities.total, 0);
        const lock = JSON.parse(await readFile(join(consumer, 'package-lock.json'), 'utf8'));
        assert.equal(lock.packages['node_modules/@escalated-dev/escalated'].integrity, packed.integrity);
        report.adapters.push({ version: versions[major], vue, packageIntegrity: packed.integrity, audit: 0 });
        const fixture = await startFlashServer({ root, consumer, cacheDir: join(consumer, '.vite'), major });
        try {
            browser = await chromium.launch({ headless: true });
            for (const [viewport, size] of Object.entries({
                desktop: { width: 1280, height: 900 },
                mobile: { width: 390, height: 844 },
            })) {
                const context = await browser.newContext({ viewport: size });
                await context.addInitScript(() => {
                    globalThis.__fixtureCopies = [];
                    globalThis.__fixtureRejectCopy = false;
                    Object.defineProperty(navigator, 'clipboard', {
                        configurable: true,
                        value: {
                            writeText: async (text) => {
                                if (globalThis.__fixtureRejectCopy)
                                    throw new Error('Fixture clipboard permission denied');
                                globalThis.__fixtureCopies.push(text);
                            },
                        },
                    });
                });
                const page = await context.newPage();
                const errors = [];
                const external = [];
                const diagnosticStart = report.diagnostics.length;
                page.on('pageerror', (error) => {
                    errors.push(error.message);
                    report.diagnostics.push({ adapter: major, viewport, type: 'pageerror', message: error.message });
                    console.error('Browser runtime error:', error.message);
                });
                page.on('console', (message) => {
                    if (message.type() === 'error') {
                        report.diagnostics.push({ adapter: major, viewport, type: 'console', message: message.text() });
                        console.error('Browser console error:', message.text());
                    }
                });
                page.on('response', (response) => {
                    if (response.status() >= 400) {
                        report.diagnostics.push({
                            adapter: major,
                            viewport,
                            type: 'http',
                            status: response.status(),
                            url: response.url(),
                        });
                        console.error('HTTP failure:', response.status(), response.url());
                    }
                });
                page.on('requestfailed', (request) => {
                    report.diagnostics.push({
                        adapter: major,
                        viewport,
                        type: 'requestfailed',
                        url: request.url(),
                        message: request.failure()?.errorText,
                    });
                });
                await context.route('**/*', (route) => {
                    const url = new URL(route.request().url());
                    if (['127.0.0.1', 'localhost'].includes(url.hostname)) return route.continue();
                    external.push(url.origin);
                    return route.abort();
                });
                const prefix = `adapter-${major}/${viewport}`;
                try {
                    await check(`${prefix}/native-token`, page, async () => {
                        await page.goto(`${fixture.origin}/case/native/support/admin/api-tokens`);
                        await createToken(page);
                        const token = `fixture-token-${major}-1`;
                        await expect(page.getByText(token, { exact: true })).toBeVisible();
                        await page.getByRole('button', { name: 'Copy', exact: true }).click();
                        assert.equal(await page.evaluate(() => globalThis.__fixtureCopies.at(-1)), token);
                        if (major === '3')
                            assert(!(await page.evaluate(() => JSON.stringify(history.state))).includes(token));
                        await page.screenshot({
                            path: join(output, `adapter-${major}-${viewport}-token.png`),
                            fullPage: true,
                        });
                        await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
                        await expect(page.getByText(token, { exact: true })).toHaveCount(0);
                        await page.getByRole('link', { name: 'Other page', exact: true }).click();
                        await expect(page.getByRole('heading', { name: 'Other page', exact: true })).toBeVisible();
                        await page.goBack();
                        await expect(
                            page.getByRole('button', { name: 'Create Token', exact: true }).first(),
                        ).toBeVisible();
                        await expect(page.getByText(token, { exact: true })).toHaveCount(0);
                    });
                    await check(`${prefix}/native-two-factor`, page, async () => {
                        await page.goto(`${fixture.origin}/case/native/support/admin/two-factor`);
                        await page
                            .getByRole('button', { name: 'Set Up Two-Factor Authentication', exact: true })
                            .click();
                        await expect(page.getByText(/otpauth:\/\/totp\/Fixture-/)).toBeVisible();
                        await page.screenshot({
                            path: join(output, `adapter-${major}-${viewport}-setup.png`),
                            fullPage: true,
                        });
                        await page.getByRole('button', { name: 'Next: Verify Code', exact: true }).click();
                        await page.getByRole('button', { name: 'Cancel', exact: true }).click();
                        await expect(
                            page.getByRole('button', { name: 'Set Up Two-Factor Authentication', exact: true }),
                        ).toBeVisible();
                        await expect(page.locator('input[inputmode="numeric"]')).toHaveCount(0);
                        await page
                            .getByRole('button', { name: 'Set Up Two-Factor Authentication', exact: true })
                            .click();
                        await expect(page.getByText(/secret=JBSWY3DPEHPK3PXQ/)).toBeVisible();
                        await page.getByRole('button', { name: 'Next: Verify Code', exact: true }).click();
                        for (const [index, value] of [...'123456'].entries())
                            await page.locator('input[inputmode="numeric"]').nth(index).fill(value);
                        await page.getByRole('button', { name: 'Confirm & Enable 2FA', exact: true }).click();
                        await expect(page.getByText('fixture-recovery-one', { exact: true })).toBeVisible();
                        await page.getByRole('button', { name: 'Copy Codes', exact: true }).click();
                        assert.equal(
                            await page.evaluate(() => globalThis.__fixtureCopies.at(-1)),
                            'fixture-recovery-one\nfixture-recovery-two',
                        );
                        await page.evaluate(() => {
                            globalThis.__fixtureRejectCopy = true;
                        });
                        await page.getByRole('button', { name: 'Copy Codes', exact: true }).click();
                        await expect(page.getByRole('alert')).toContainText('Select and copy the codes below');
                        await page.evaluate(() => {
                            globalThis.__fixtureRejectCopy = false;
                        });
                        await page.getByRole('button', { name: 'Copy Codes', exact: true }).click();
                        await expect(page.getByRole('alert')).toHaveCount(0);
                        if (major === '3') {
                            const history = await page.evaluate(() => JSON.stringify(window.history.state));
                            assert(!history.includes('fixture-recovery-one') && !history.includes('JBSWY3DPEHPK3PX'));
                        }
                        await page.screenshot({
                            path: join(output, `adapter-${major}-${viewport}-recovery.png`),
                            fullPage: true,
                        });
                        await page.reload();
                        await expect(page.getByRole('button', { name: 'Disable 2FA', exact: true })).toBeVisible();
                        await expect(page.getByText('fixture-recovery-one', { exact: true })).toHaveCount(0);
                    });
                    await check(`${prefix}/legacy-shared-flash`, page, async () => {
                        await page.goto(`${fixture.origin}/case/mixed/support/admin/api-tokens`);
                        await createToken(page);
                        await expect(page.getByText(`fixture-token-${major}-1`, { exact: true })).toBeVisible();
                    });
                    if (major === '3')
                        await check(`${prefix}/explicit-clear`, page, async () => {
                            await page.goto(`${fixture.origin}/case/clear/support/admin/two-factor`);
                            await expect(
                                page.getByRole('button', { name: 'Set Up Two-Factor Authentication', exact: true }),
                            ).toBeVisible();
                            await expect(page.getByText('stale-uri', { exact: true })).toHaveCount(0);
                            await expect(page.getByText('stale-code', { exact: true })).toHaveCount(0);
                        });
                    assert.deepEqual(errors, [], 'No browser runtime errors');
                    assert.deepEqual(external, [], 'No external requests from security pages');
                    assert.deepEqual(report.diagnostics.slice(diagnosticStart), [], 'No console or HTTP errors');
                } finally {
                    await context.close();
                }
            }
        } finally {
            await browser?.close();
            browser = null;
            await fixture.close();
        }
    }
    report.state = 'passed';
} catch (error) {
    report.state = 'failed';
    report.error = error.stack;
    console.error(error);
    process.exitCode = 1;
} finally {
    await browser?.close();
    report.completedAt = new Date().toISOString();
    await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
    assert.equal(dirname(temporary), temporaryParent);
    assert(basename(temporary).startsWith('escalated-inertia-flash-'));
    await rm(temporary, { recursive: true, force: true });
}
