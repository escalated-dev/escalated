// Tables in the admin and agent panels sit in `.esc-table-scroll` containers,
// which scroll sideways when a table is wider than the screen. A scroll
// container on its own gives no sign there is more to see -- touch devices and
// overlay scrollbars hide the bar until you are already scrolling -- so this
// marks each container with the edges that have content past them, and the
// layout draws a shadow on those edges.

export const SCROLL_CONTAINER_SELECTOR = '.esc-table-scroll';

// A pixel of slack: fractional widths leave scrollLeft a hair short of the end.
const SLACK = 1;

/**
 * Set `data-esc-overflow` on a container to the edges with hidden content:
 * "start", "end", "start end", or nothing.
 */
export function updateScrollEdges(el) {
    const hidden = el.scrollWidth - el.clientWidth;
    const edges = [];
    if (hidden > SLACK) {
        if (el.scrollLeft > SLACK) edges.push('start');
        if (el.scrollLeft < hidden - SLACK) edges.push('end');
    }
    if (edges.length) {
        el.setAttribute('data-esc-overflow', edges.join(' '));
    } else {
        el.removeAttribute('data-esc-overflow');
    }
    return edges;
}

/**
 * Keep every scroll container under `root` marked as it scrolls, as the
 * window resizes, and as pages add or replace content. Returns a function
 * that stops watching.
 */
export function watchScrollAffordance(root) {
    if (!root || typeof window === 'undefined') return () => {};

    const watched = new Set();
    let stopped = false;
    const onScroll = (event) => updateScrollEdges(event.currentTarget);

    const scan = () => {
        const found = new Set(root.querySelectorAll(SCROLL_CONTAINER_SELECTOR));
        for (const el of watched) {
            if (!found.has(el)) {
                el.removeEventListener('scroll', onScroll);
                watched.delete(el);
            }
        }
        for (const el of found) {
            if (!watched.has(el)) {
                el.addEventListener('scroll', onScroll, { passive: true });
                watched.add(el);
            }
            updateScrollEdges(el);
        }
    };

    let frame = null;
    const schedule = () => {
        if (frame !== null) return;
        const raf = window.requestAnimationFrame || ((fn) => setTimeout(fn, 16));
        frame = raf(() => {
            frame = null;
            if (!stopped) scan();
        });
    };

    scan();
    window.addEventListener('resize', schedule);

    let observer = null;
    if (typeof window.MutationObserver !== 'undefined') {
        observer = new window.MutationObserver(schedule);
        observer.observe(root, { childList: true, subtree: true });
    }

    return () => {
        stopped = true;
        window.removeEventListener('resize', schedule);
        observer?.disconnect();
        for (const el of watched) el.removeEventListener('scroll', onScroll);
        watched.clear();
    };
}
