import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startFrameBridge } from '../../src/embed/frameBridge';
import { connectEscalatedFrame } from '../../src/embed/frameHost';
import { isPathUnder, normaliseOrigins } from '../../src/embed/protocol';

/**
 * The iframe embed protocol (ADR 2026-11-05). The security rules are the
 * point: never post to '*', never post to a parent that is not allow-listed,
 * never act on a message from anywhere else.
 */
function fakeWindow({ parentOrigin = 'https://admin.example.com', ancestor = true } = {}) {
    const listeners = new Set();
    const parent = { postMessage: vi.fn() };
    const win = {
        parent,
        location: { ancestorOrigins: ancestor ? [parentOrigin] : undefined },
        document: { referrer: ancestor ? '' : `${parentOrigin}/admin/page`, documentElement: { scrollHeight: 640 } },
        addEventListener: (type, fn) => type === 'message' && listeners.add(fn),
        removeEventListener: (type, fn) => listeners.delete(fn),
        dispatch(event) {
            listeners.forEach((fn) => fn(event));
        },
        listenerCount: () => listeners.size,
    };
    return win;
}

const ALLOWED = ['https://admin.example.com'];
const state = () => ({ url: '/admin/support/tickets', route: 'escalated.admin.tickets.index', title: 'Tickets' });

describe('startFrameBridge', () => {
    let win;
    beforeEach(() => {
        win = fakeWindow();
    });

    it('announces itself and its height to an allow-listed parent, at that exact origin', () => {
        startFrameBridge({ win, allowedOrigins: ALLOWED, baseUrl: '/admin/support', getState: state });

        const calls = win.parent.postMessage.mock.calls;
        expect(calls.map(([msg]) => msg.type)).toEqual(['ready', 'resize']);
        expect(calls[0][0]).toEqual({
            source: 'escalated',
            version: 1,
            type: 'ready',
            url: '/admin/support/tickets',
            route: 'escalated.admin.tickets.index',
            title: 'Tickets',
        });
        expect(calls[1][0]).toMatchObject({ type: 'resize', height: 640 });
        for (const [, target] of calls) expect(target).toBe('https://admin.example.com');
    });

    it('falls back to the referrer origin when ancestorOrigins is unavailable', () => {
        win = fakeWindow({ ancestor: false });
        startFrameBridge({ win, allowedOrigins: ALLOWED, baseUrl: '/admin/support', getState: state });
        expect(win.parent.postMessage).toHaveBeenCalled();
        expect(win.parent.postMessage.mock.calls[0][1]).toBe('https://admin.example.com');
    });

    it('stays silent when the parent is not allow-listed', () => {
        win = fakeWindow({ parentOrigin: 'https://evil.example' });
        startFrameBridge({ win, allowedOrigins: ALLOWED, baseUrl: '/admin/support', getState: state });
        expect(win.parent.postMessage).not.toHaveBeenCalled();
        expect(win.listenerCount()).toBe(0);
    });

    it('stays silent with an empty or wildcard allow-list', () => {
        startFrameBridge({ win, allowedOrigins: [], baseUrl: '/admin/support', getState: state });
        startFrameBridge({ win, allowedOrigins: ['*'], baseUrl: '/admin/support', getState: state });
        expect(win.parent.postMessage).not.toHaveBeenCalled();
    });

    it('does nothing when not framed', () => {
        const top = fakeWindow();
        top.parent = top;
        expect(() => startFrameBridge({ win: top, allowedOrigins: ALLOWED, getState: state })).not.toThrow();
    });

    it('reports navigations', () => {
        let fire;
        startFrameBridge({
            win,
            allowedOrigins: ALLOWED,
            baseUrl: '/admin/support',
            getState: () => ({ url: '/admin/support/tags', route: 'escalated.admin.tags.index', title: 'Tags' }),
            subscribeNavigate: (cb) => {
                fire = cb;
                return () => {};
            },
        });
        win.parent.postMessage.mockClear();
        fire();
        expect(win.parent.postMessage.mock.calls[0][0]).toMatchObject({
            type: 'navigate',
            url: '/admin/support/tags',
            title: 'Tags',
        });
    });

    it('applies a theme and navigates only for messages from the allow-listed parent', () => {
        const visit = vi.fn();
        const onTheme = vi.fn();
        startFrameBridge({ win, allowedOrigins: ALLOWED, baseUrl: '/admin/support', getState: state, visit, onTheme });

        const msg = (data, origin = 'https://admin.example.com', source = win.parent) =>
            win.dispatch({ origin, source, data: { source: 'escalated-host', version: 1, ...data } });

        msg({ type: 'theme', mode: 'light', tokens: { accent: '#ff0000', bad: 3 } });
        expect(onTheme).toHaveBeenCalledWith({ mode: 'light', tokens: { accent: '#ff0000' } });

        msg({ type: 'navigate', url: '/admin/support/tags' });
        expect(visit).toHaveBeenCalledWith('/admin/support/tags');

        visit.mockClear();
        onTheme.mockClear();
        msg({ type: 'navigate', url: '/admin/support/tags' }, 'https://evil.example');
        msg({ type: 'navigate', url: '/admin/support/tags' }, 'https://admin.example.com', { postMessage() {} });
        msg({ type: 'navigate', url: 'https://evil.example/' });
        msg({ type: 'navigate', url: '//evil.example/admin/support' });
        msg({ type: 'navigate', url: '/admin/other' });
        msg({ type: 'navigate', url: '/admin/support/../../logout' });
        msg({ type: 'theme', mode: 'purple' });
        win.dispatch({
            origin: 'https://admin.example.com',
            source: win.parent,
            data: { type: 'navigate', url: '/admin/support' },
        });
        expect(visit).not.toHaveBeenCalled();
        expect(onTheme).not.toHaveBeenCalled();
    });

    it('stops listening when stopped', () => {
        const stop = startFrameBridge({ win, allowedOrigins: ALLOWED, baseUrl: '/admin/support', getState: state });
        expect(win.listenerCount()).toBe(1);
        stop();
        expect(win.listenerCount()).toBe(0);
    });
});

describe('connectEscalatedFrame', () => {
    function setup(options = {}) {
        const listeners = new Set();
        const win = {
            addEventListener: (type, fn) => listeners.add(fn),
            removeEventListener: (type, fn) => listeners.delete(fn),
        };
        const contentWindow = { postMessage: vi.fn() };
        const iframe = { contentWindow, style: {} };
        const frame = connectEscalatedFrame(iframe, { win, origin: 'https://support.example.com/', ...options });
        const send = (data, origin = 'https://support.example.com', source = contentWindow) =>
            listeners.forEach((fn) => fn({ origin, source, data: { source: 'escalated', version: 1, ...data } }));
        return { frame, iframe, contentWindow, send, listeners };
    }

    it('sizes the iframe and reports navigations from Escalated only', () => {
        const onNavigate = vi.fn();
        const { iframe, send } = setup({ onNavigate });

        send({ type: 'resize', height: 812.4 });
        expect(iframe.style.height).toBe('813px');

        send({ type: 'navigate', url: '/admin/support/tags', route: 'escalated.admin.tags.index', title: 'Tags' });
        expect(onNavigate).toHaveBeenCalledWith({
            url: '/admin/support/tags',
            route: 'escalated.admin.tags.index',
            title: 'Tags',
        });

        onNavigate.mockClear();
        send({ type: 'navigate', url: '/x' }, 'https://evil.example');
        send({ type: 'navigate', url: '/x' }, 'https://support.example.com', {});
        send({ type: 'resize', height: 'tall' });
        expect(onNavigate).not.toHaveBeenCalled();
        expect(iframe.style.height).toBe('813px');
    });

    it("posts theme and navigation to Escalated's exact origin", () => {
        const { frame, contentWindow } = setup();
        frame.setTheme('dark');
        frame.navigate('/admin/support/tags');
        expect(contentWindow.postMessage.mock.calls).toEqual([
            [{ source: 'escalated-host', version: 1, type: 'theme', mode: 'dark' }, 'https://support.example.com'],
            [
                { source: 'escalated-host', version: 1, type: 'navigate', url: '/admin/support/tags' },
                'https://support.example.com',
            ],
        ]);
    });

    it('refuses a missing or wildcard origin', () => {
        expect(() => connectEscalatedFrame({ contentWindow: {} }, { origin: '*' })).toThrow(/origin/);
        expect(() => connectEscalatedFrame({ contentWindow: {} }, {})).toThrow(/origin/);
    });

    it('disconnects', () => {
        const { frame, listeners } = setup();
        frame.disconnect();
        expect(listeners.size).toBe(0);
    });
});

describe('protocol helpers', () => {
    it('normalises origins and drops wildcards and junk', () => {
        expect(
            normaliseOrigins([
                'https://a.example/',
                '*',
                'null',
                'javascript:alert(1)',
                'https://a.example',
                'http://b.example:8080/x',
            ]),
        ).toEqual(['https://a.example', 'http://b.example:8080']);
    });

    it('accepts only same-origin paths under the base', () => {
        expect(isPathUnder('/admin/support', '/admin/support')).toBe(true);
        expect(isPathUnder('/admin/support/tickets?status=open', '/admin/support/')).toBe(true);
        expect(isPathUnder('/admin/supportx', '/admin/support')).toBe(false);
        expect(isPathUnder('//evil.example', '/')).toBe(false);
        expect(isPathUnder('/admin\\support', '/admin')).toBe(false);
        expect(isPathUnder(42, '/admin')).toBe(false);
    });
});
