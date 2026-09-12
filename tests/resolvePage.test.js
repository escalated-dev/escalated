import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveEscalatedPage, isEscalatedPage, escalatedPages, suggestPages } from '../src/resolvePage';
import manifest from '../pages.json';

/**
 * A page name with no component behind it resolves to nothing in Inertia. Not
 * a 500, not a console error — `resolve()` returns undefined, Vue renders
 * nothing, and the panel comes up blank. It reads as a permissions problem or
 * an empty dataset, and the request was a 200 the whole time.
 *
 * That is how four screens shipped blank across this package and its backends.
 * These tests pin the behaviour that makes the next one say so.
 */
afterEach(() => {
    vi.restoreAllMocks();
});

describe('resolveEscalatedPage', () => {
    it('resolves a page this package ships', async () => {
        const component = await resolveEscalatedPage('Escalated/Admin/Automations/Index');

        expect(component).toBeTruthy();
    });

    it('throws rather than resolving to nothing when the name is unknown', () => {
        expect(() => resolveEscalatedPage('Escalated/Admin/Nonexistent/Index')).toThrow(/no page component/);
    });

    it('names what was asked for', () => {
        expect(() => resolveEscalatedPage('Escalated/Admin/Nonexistent/Index')).toThrow(
            /Escalated\/Admin\/Nonexistent\/Index/,
        );
    });

    it('suggests the page that was probably meant', () => {
        // Every real instance of this has been a naming difference rather than
        // an absent screen, so the message is far more useful pointing at one.
        expect(() => resolveEscalatedPage('Escalated/Admin/Reports/CohortAnalysis')).toThrow(/Did you mean/);
    });

    it('hands a name it does not own to the fallback', async () => {
        const fallback = vi.fn(() => Promise.resolve({ name: 'HostPage' }));
        const component = await resolveEscalatedPage('App/Dashboard', fallback);

        expect(fallback).toHaveBeenCalledWith('App/Dashboard');
        expect(component).toEqual({ name: 'HostPage' });
    });

    it('still complains about an unknown Escalated name even with a fallback', () => {
        // A host resolver cannot supply an Escalated page, so falling through
        // would just move the blank screen somewhere harder to find.
        const fallback = vi.fn();

        expect(() => resolveEscalatedPage('Escalated/Admin/Nope', fallback)).toThrow();
        expect(fallback).not.toHaveBeenCalled();
    });

    it('logs instead of throwing when asked not to throw', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const component = resolveEscalatedPage('Escalated/Admin/Nonexistent/Index', null, {
            throwOnMissing: false,
        });

        expect(error).toHaveBeenCalled();
        expect(component.__escalatedMissing).toMatch(/no page component/);
    });

    it('renders nothing rather than crashing when it does not throw', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const component = resolveEscalatedPage('Escalated/Admin/Nonexistent/Index', null, {
            throwOnMissing: false,
        });

        expect(component.render()).toBeNull();
    });

    it('copes with no name at all', () => {
        expect(() => resolveEscalatedPage(undefined)).toThrow(/no page component/);
    });
});

describe('isEscalatedPage', () => {
    it('claims only names under Escalated/', () => {
        expect(isEscalatedPage('Escalated/Admin/Tickets/Index')).toBe(true);
        expect(isEscalatedPage('App/Dashboard')).toBe(false);
        expect(isEscalatedPage(undefined)).toBe(false);
    });
});

describe('the page manifest', () => {
    it('lists every page the package ships', () => {
        // Generated from src/pages, so a mismatch means the committed file is
        // stale — `npm run pages:check` is the same assertion in CI.
        expect(escalatedPages()).toEqual(manifest.pages);
        expect(manifest.pages.length).toBeGreaterThan(80);
    });

    it('every name in it actually resolves', async () => {
        // The manifest is what the backends check themselves against, so a
        // name in it that does not resolve would send them looking for a bug
        // that is really here.
        for (const name of manifest.pages) {
            await expect(resolveEscalatedPage(name)).resolves.toBeTruthy();
        }
    });

    it('names are all namespaced', () => {
        expect(manifest.pages.every((page) => page.startsWith('Escalated/'))).toBe(true);
    });
});

describe('suggestPages', () => {
    it('prefers a differently named screen in the right folder', () => {
        expect(suggestPages('Escalated/Admin/Reports/CohortAnalysis')).toContain('Escalated/Admin/Reports/Cohorts');
    });

    it('finds the same leaf under a different path', () => {
        expect(suggestPages('Escalated/Admin/KB/Articles/Index')).toContain(
            'Escalated/Admin/KnowledgeBase/Articles/Index',
        );
    });

    it('returns nothing rather than noise when there is no near match', () => {
        expect(suggestPages('Totally/Unrelated/Thing')).toEqual([]);
    });
});
