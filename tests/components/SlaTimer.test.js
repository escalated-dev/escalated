import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import SlaTimer from '../../src/components/SlaTimer.vue';
import { earliest, resolutionStoppedAt, slaOutcome } from '../../src/utils/sla';

const hoursFromNow = (h) => new Date(Date.now() + h * 3600000).toISOString();

function mountTimer(props, dark) {
    return mount(SlaTimer, {
        props: { label: 'Resolution', ...props },
        global: dark === undefined ? {} : { provide: { 'esc-dark': computed(() => dark) } },
    });
}

describe('SlaTimer colours', () => {
    it('uses light colours when the layout says light mode', () => {
        // The layout provides a computed ref, and a ref object is always
        // truthy, so testing it instead of its value drew dark colours here.
        const wrapper = mountTimer({ dueAt: hoursFromNow(10) }, false);
        expect(wrapper.classes()).toContain('bg-green-50');
        expect(wrapper.classes()).not.toContain('bg-emerald-500/10');
    });

    it('uses dark colours in dark mode', () => {
        const wrapper = mountTimer({ dueAt: hoursFromNow(10) }, true);
        expect(wrapper.classes()).toContain('bg-emerald-500/10');
    });

    it('uses light colours with no layout around it', () => {
        expect(mountTimer({ dueAt: hoursFromNow(1) }).classes()).toContain('bg-yellow-50');
    });
});

describe('SlaTimer clock', () => {
    it('counts down while the clock runs', () => {
        const wrapper = mountTimer({ dueAt: hoursFromNow(5) });
        expect(wrapper.text()).toMatch(/\dh \d+m/);
        expect(wrapper.attributes('data-sla-outcome')).toBeUndefined();
    });

    it('shows Met, not a countdown, once stopped before the due time', () => {
        const wrapper = mountTimer({ dueAt: hoursFromNow(5), stoppedAt: hoursFromNow(-1) });
        expect(wrapper.text()).toContain('Met');
        expect(wrapper.text()).not.toMatch(/\dh \d+m/);
        expect(wrapper.classes()).toContain('bg-green-50');
    });

    it('shows Missed once stopped after the due time', () => {
        const wrapper = mountTimer({ dueAt: hoursFromNow(-3), stoppedAt: hoursFromNow(-1) });
        expect(wrapper.text()).toContain('Missed');
        expect(wrapper.text()).not.toContain('Overdue');
        expect(wrapper.classes()).toContain('bg-red-50');
    });

    it('shows Missed when the backend already says breached', () => {
        const wrapper = mountTimer({ dueAt: hoursFromNow(5), stoppedAt: hoursFromNow(-1), breached: true });
        expect(wrapper.text()).toContain('Missed');
    });
});

describe('sla helpers', () => {
    it('stops the resolution clock at whichever of resolved_at and closed_at came first', () => {
        expect(resolutionStoppedAt({ resolved_at: '2026-01-02T00:00:00Z', closed_at: '2026-01-01T00:00:00Z' })).toBe(
            '2026-01-01T00:00:00Z',
        );
        expect(resolutionStoppedAt({ resolved_at: '2026-01-02T00:00:00Z', closed_at: null })).toBe(
            '2026-01-02T00:00:00Z',
        );
        expect(resolutionStoppedAt({})).toBeNull();
        expect(earliest(null, 'not a date')).toBeNull();
    });

    it('judges a stop at the due time as met', () => {
        expect(slaOutcome('2026-01-01T10:00:00Z', '2026-01-01T10:00:00Z')).toBe('met');
        expect(slaOutcome('2026-01-01T10:00:00Z', '2026-01-01T10:00:01Z')).toBe('missed');
        expect(slaOutcome('2026-01-01T10:00:00Z', null)).toBeNull();
    });
});
