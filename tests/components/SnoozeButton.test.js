import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import SnoozeButton from '../../src/components/SnoozeButton.vue';

// Stub Inertia
vi.mock('@inertiajs/vue3', () => {
    const formInstance = {
        snoozed_until: '',
        post: vi.fn(),
    };
    return {
        router: { post: vi.fn() },
        useForm: vi.fn(() => formInstance),
        __formInstance: formInstance,
    };
});

vi.stubGlobal(
    'route',
    vi.fn((...args) => `/mocked/${args.join('/')}`),
);

function makeTicket(overrides = {}) {
    return {
        reference: 'TK-100',
        is_snoozed: false,
        snoozed_until: null,
        ...overrides,
    };
}

function mountSnooze(ticket = makeTicket(), dark = false) {
    return mount(SnoozeButton, {
        props: { ticket },
        global: {
            provide: {
                'esc-dark': computed(() => dark),
            },
        },
    });
}

describe('SnoozeButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ----------------------------------------------------------------
    // Dropdown with preset options
    // ----------------------------------------------------------------
    describe('snooze dropdown', () => {
        it('renders the snooze trigger button when ticket is not snoozed', () => {
            const wrapper = mountSnooze();
            expect(wrapper.text()).toContain('Snooze');
        });

        it('shows dropdown with preset options on click', async () => {
            const wrapper = mountSnooze();
            const triggerBtn = wrapper.find('button');
            await triggerBtn.trigger('click');

            expect(wrapper.text()).toContain('1 hour');
            expect(wrapper.text()).toContain('4 hours');
            expect(wrapper.text()).toContain('Tomorrow 9am');
            expect(wrapper.text()).toContain('Next Monday 9am');
            expect(wrapper.text()).toContain('Custom date/time...');
        });

        it('hides dropdown by default', () => {
            const wrapper = mountSnooze();
            // Dropdown menu items should not be visible
            expect(wrapper.text()).not.toContain('1 hour');
            expect(wrapper.text()).not.toContain('4 hours');
        });
    });

    // ----------------------------------------------------------------
    // Snoozed banner
    // ----------------------------------------------------------------
    describe('snoozed banner', () => {
        it('shows snoozed banner when ticket is_snoozed', () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            const wrapper = mountSnooze(makeTicket({ is_snoozed: true, snoozed_until: futureDate }));
            expect(wrapper.text()).toContain('Snoozed until');
        });

        it('shows snoozed banner when snoozed_until is in the future', () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            const wrapper = mountSnooze(makeTicket({ is_snoozed: false, snoozed_until: futureDate }));
            expect(wrapper.text()).toContain('Snoozed until');
        });

        it('does not show snoozed banner for non-snoozed ticket', () => {
            const wrapper = mountSnooze();
            expect(wrapper.text()).not.toContain('Snoozed until');
        });
    });

    // ----------------------------------------------------------------
    // Preset date calculations
    // ----------------------------------------------------------------
    describe('preset date calculations', () => {
        it('1-hour preset calculates ~1 hour from now', async () => {
            const { __formInstance } = await import('@inertiajs/vue3');
            const now = Date.now();
            vi.spyOn(Date, 'now').mockReturnValue(now);

            const wrapper = mountSnooze();
            await wrapper.find('button').trigger('click');

            const hourBtn = wrapper.findAll('button').find((b) => b.text().trim() === '1 hour');
            await hourBtn.trigger('click');

            const posted = new Date(__formInstance.snoozed_until).getTime();
            // Should be ~1 hour (3600000ms) from now
            expect(posted).toBeCloseTo(now + 3600 * 1000, -3);
            vi.restoreAllMocks();
        });

        it('4-hour preset calculates ~4 hours from now', async () => {
            const { __formInstance } = await import('@inertiajs/vue3');
            const now = Date.now();
            vi.spyOn(Date, 'now').mockReturnValue(now);

            const wrapper = mountSnooze();
            await wrapper.find('button').trigger('click');

            const btn = wrapper.findAll('button').find((b) => b.text().trim() === '4 hours');
            await btn.trigger('click');

            const posted = new Date(__formInstance.snoozed_until).getTime();
            expect(posted).toBeCloseTo(now + 4 * 3600 * 1000, -3);
            vi.restoreAllMocks();
        });

        it('tomorrow 9am preset sets to next day at 09:00', async () => {
            const { __formInstance } = await import('@inertiajs/vue3');

            const wrapper = mountSnooze();
            await wrapper.find('button').trigger('click');

            const btn = wrapper.findAll('button').find((b) => b.text().trim() === 'Tomorrow 9am');
            await btn.trigger('click');

            const posted = new Date(__formInstance.snoozed_until);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            expect(posted.getDate()).toBe(tomorrow.getDate());
            expect(posted.getHours()).toBe(9);
            expect(posted.getMinutes()).toBe(0);
        });

        it('next Monday 9am preset sets to next Monday at 09:00', async () => {
            const { __formInstance } = await import('@inertiajs/vue3');

            const wrapper = mountSnooze();
            await wrapper.find('button').trigger('click');

            const btn = wrapper.findAll('button').find((b) => b.text().trim() === 'Next Monday 9am');
            await btn.trigger('click');

            const posted = new Date(__formInstance.snoozed_until);
            expect(posted.getDay()).toBe(1); // Monday
            expect(posted.getHours()).toBe(9);
            expect(posted.getMinutes()).toBe(0);
        });
    });

    // ----------------------------------------------------------------
    // Unsnooze
    // ----------------------------------------------------------------
    describe('unsnooze', () => {
        it('shows unsnooze button when snoozed', () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            const wrapper = mountSnooze(makeTicket({ is_snoozed: true, snoozed_until: futureDate }));
            const unsnoozeBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Unsnooze');
            expect(unsnoozeBtn).toBeDefined();
            expect(unsnoozeBtn.exists()).toBe(true);
        });

        it('calls router.post on unsnooze click', async () => {
            const { router } = await import('@inertiajs/vue3');
            const futureDate = new Date(Date.now() + 86400000).toISOString();
            const wrapper = mountSnooze(makeTicket({ is_snoozed: true, snoozed_until: futureDate }));

            const unsnoozeBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Unsnooze');
            await unsnoozeBtn.trigger('click');

            expect(router.post).toHaveBeenCalledTimes(1);
        });

        it('does not show unsnooze button when not snoozed', () => {
            const wrapper = mountSnooze();
            const unsnoozeBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Unsnooze');
            expect(unsnoozeBtn).toBeUndefined();
        });
    });
});
