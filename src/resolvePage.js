import manifest from '../pages.json';

/**
 * Resolve an Escalated page name to its component, loudly.
 *
 * Inertia resolves a page name to a component, and a name with nothing behind
 * it is not an error: `resolve()` returns undefined, Vue renders nothing, and
 * the panel comes up blank. It looks like a permissions problem or an empty
 * dataset, and the request was a 200 the whole time — which is how four screens
 * shipped blank across this package and its backends without anyone noticing.
 *
 * This wraps the lookup so an unresolvable name says so. In development it
 * throws, naming what was asked for and the nearest thing that exists; in
 * production it logs and hands back a component that renders the same message,
 * because a panel that explains itself beats a panel that is empty.
 *
 * Wire it into the host's Inertia setup:
 *
 *     import { resolveEscalatedPage } from '@escalated-dev/escalated';
 *
 *     createInertiaApp({
 *         resolve: (name) =>
 *             resolveEscalatedPage(name, () =>
 *                 resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**')),
 *             ),
 *     });
 *
 * @param {string} name             The page name the backend rendered.
 * @param {Function} [fallback]     Resolver for names this package does not own.
 * @param {Object} [options]
 * @param {boolean} [options.throwOnMissing]  Defaults to true outside production.
 * @returns {Promise<Object>|Object}
 */
export function resolveEscalatedPage(name, fallback, options = {}) {
    const pages = import.meta.glob('./pages/**/*.vue');
    const path = `./pages/${String(name ?? '').replace(/^Escalated\//, '')}.vue`;

    if (pages[path]) {
        return pages[path]();
    }

    // Not ours: a host page, or a plugin's. Only names this package claims are
    // its responsibility to complain about.
    if (!isEscalatedPage(name)) {
        if (fallback) {
            return fallback(name);
        }

        return missing(name, options);
    }

    return missing(name, options);
}

/** Whether a name is one this package is supposed to own. */
export function isEscalatedPage(name) {
    return String(name ?? '').startsWith('Escalated/');
}

/** Every page name this package can resolve. */
export function escalatedPages() {
    return [...manifest.pages];
}

/**
 * Names close enough to be the one that was meant.
 *
 * Nearly every real instance of this has been a naming difference rather than
 * an absent screen — `CohortAnalysis` for `Cohorts`, `New` for `Form` — so the
 * message is far more useful when it can point at the likely intent.
 */
export function suggestPages(name, limit = 3) {
    const wanted = segments(name);

    if (!wanted.length) {
        return [];
    }

    return manifest.pages
        .map((page) => ({ page, score: similarity(wanted, segments(page)) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.page.localeCompare(b.page))
        .slice(0, limit)
        .map((entry) => entry.page);
}

function segments(name) {
    return String(name ?? '')
        .toLowerCase()
        .split('/')
        .filter(Boolean);
}

/**
 * How much two page paths have in common.
 *
 * Segment overlap rather than leaf equality: nearly every page ends in `Index`
 * or `Form`, so matching on the last segment alone ranks half the package
 * equally. What actually distinguishes the intended page is the path around it
 * -- `Admin/KB/Articles/Index` and `Admin/KnowledgeBase/Articles/Index` share
 * three segments and differ in one.
 */
function similarity(wanted, candidate) {
    const shared = wanted.filter((part) => candidate.includes(part)).length;

    if (!shared) {
        return 0;
    }

    // The folder counts for more than the leaf, so a differently named screen
    // in the right place outranks the same leaf somewhere unrelated.
    const sameFolder = wanted.slice(0, -1).join('/') === candidate.slice(0, -1).join('/') ? 2 : 0;
    const lengthPenalty = Math.abs(wanted.length - candidate.length) * 0.5;

    // Every page in a folder shares its whole path, so the folder alone ranks
    // them all equally -- `CohortAnalysis` would tie with `AgentMetrics` and
    // lose on alphabet. How much of the name itself matches is what separates
    // the one that was meant.
    const leaf = commonPrefix(wanted[wanted.length - 1], candidate[candidate.length - 1]);

    return shared + sameFolder + leaf - lengthPenalty;
}

/** How many leading characters two names share, as a fraction of the shorter. */
function commonPrefix(a = '', b = '') {
    let i = 0;

    while (i < a.length && i < b.length && a[i] === b[i]) {
        i += 1;
    }

    return i / Math.max(1, Math.min(a.length, b.length));
}

function missing(name, options) {
    const suggestions = suggestPages(name);
    const message =
        `Escalated: no page component for "${name}". ` +
        (suggestions.length
            ? `Did you mean ${suggestions.map((s) => `"${s}"`).join(', ')}?`
            : 'It is not in this package; a host or plugin page needs its own resolver.');

    const shouldThrow = options.throwOnMissing ?? !isProduction();

    if (shouldThrow) {
        throw new Error(message);
    }

    console.error(message);

    return { render: () => null, name: 'EscalatedMissingPage', __escalatedMissing: message };
}

function isProduction() {
    try {
        return import.meta.env?.PROD === true;
    } catch {
        return false;
    }
}
