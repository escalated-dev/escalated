import { describe, it, expect, afterEach } from 'vitest';
import { updateScrollEdges, watchScrollAffordance } from '../../src/utils/scrollAffordance';

function box({ scrollWidth, clientWidth, scrollLeft = 0 }) {
    const el = document.createElement('div');
    el.className = 'esc-table-scroll';
    Object.defineProperty(el, 'scrollWidth', { configurable: true, value: scrollWidth });
    Object.defineProperty(el, 'clientWidth', { configurable: true, value: clientWidth });
    el.scrollLeft = scrollLeft;
    return el;
}

describe('updateScrollEdges', () => {
    it('marks nothing when the content fits', () => {
        const el = box({ scrollWidth: 300, clientWidth: 300 });
        expect(updateScrollEdges(el)).toEqual([]);
        expect(el.hasAttribute('data-esc-overflow')).toBe(false);
    });

    it('marks the end at the start of a wide table', () => {
        const el = box({ scrollWidth: 900, clientWidth: 300 });
        updateScrollEdges(el);
        expect(el.getAttribute('data-esc-overflow')).toBe('end');
    });

    it('marks both edges part way through', () => {
        const el = box({ scrollWidth: 900, clientWidth: 300, scrollLeft: 200 });
        updateScrollEdges(el);
        expect(el.getAttribute('data-esc-overflow')).toBe('start end');
    });

    it('marks only the start once scrolled to the end, allowing a sub-pixel shortfall', () => {
        const el = box({ scrollWidth: 900, clientWidth: 300, scrollLeft: 599.5 });
        updateScrollEdges(el);
        expect(el.getAttribute('data-esc-overflow')).toBe('start');
    });

    it('clears a stale mark when the content comes to fit', () => {
        const el = box({ scrollWidth: 300, clientWidth: 300 });
        el.setAttribute('data-esc-overflow', 'end');
        updateScrollEdges(el);
        expect(el.hasAttribute('data-esc-overflow')).toBe(false);
    });
});

describe('watchScrollAffordance', () => {
    let stop = () => {};
    afterEach(() => stop());

    it('marks containers present at start and follows their scrolling', () => {
        const root = document.createElement('div');
        const el = box({ scrollWidth: 900, clientWidth: 300 });
        root.appendChild(el);
        stop = watchScrollAffordance(root);
        expect(el.getAttribute('data-esc-overflow')).toBe('end');

        el.scrollLeft = 600;
        el.dispatchEvent(new window.Event('scroll'));
        expect(el.getAttribute('data-esc-overflow')).toBe('start');
    });

    it('stops listening once stopped', () => {
        const root = document.createElement('div');
        const el = box({ scrollWidth: 900, clientWidth: 300 });
        root.appendChild(el);
        stop = watchScrollAffordance(root);
        stop();
        el.scrollLeft = 600;
        el.dispatchEvent(new window.Event('scroll'));
        expect(el.getAttribute('data-esc-overflow')).toBe('end');
    });

    it('is a no-op without a root', () => {
        expect(() => watchScrollAffordance(null)()).not.toThrow();
    });
});
