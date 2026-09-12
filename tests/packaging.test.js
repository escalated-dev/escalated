import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

/**
 * What actually ends up in the published tarball.
 *
 * `exports` and `files` are two independent lists, and nothing checks them
 * against each other: an export can name a path the tarball does not contain,
 * and `npm publish` will not say a word. `pages.json` shipped exactly that way
 * — exported, documented as the thing every backend checks itself against, and
 * absent from the package.
 *
 * `npm pack --dry-run --json` reports the real file list, which is the only
 * answer that counts.
 */
const root = join(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

function packedFiles() {
    const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
        cwd: root,
        encoding: 'utf8',
        shell: process.platform === 'win32',
        stdio: ['ignore', 'pipe', 'ignore'],
    });

    return JSON.parse(output)[0].files.map((file) => file.path);
}

describe('the published package', () => {
    it('contains every path named in exports', () => {
        const files = packedFiles();

        const exported = Object.values(pkg.exports)
            .filter((target) => typeof target === 'string')
            // Wildcard targets stand for a directory; that the directory ships
            // at all is what matters here.
            .map((target) => target.replace(/^\.\//, '').replace(/\*.*$/, ''));

        const missing = exported.filter((target) => !files.some((file) => file === target || file.startsWith(target)));

        expect(missing).toEqual([]);
    });

    it('ships the page manifest', () => {
        // Named explicitly because this one is a contract with eleven other
        // repos: each backend checks its own page names against it in CI, and
        // it can only do that if the file is in the package.
        expect(packedFiles()).toContain('pages.json');
    });

    it('ships the source', () => {
        expect(packedFiles().some((file) => file.startsWith('src/'))).toBe(true);
    });
}, 60_000);
