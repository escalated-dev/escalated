import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import FollowButton from '../../src/components/FollowButton.vue';

// Stub Inertia
vi.mock('@inertiajs/vue3', () => ({
    router: { post: vi.fn() },
}));

function mountButton(props = {}, dark = false) {
    return mount(FollowButton, {
        props: { action: '/follow', ...props },
        global: {
            provide: {
                'esc-dark': computed(() => dark),
            },
        },
    });
}

describe('FollowButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the seeded follow state', () => {
        expect(mountButton({ isFollowing: false }).text()).toContain('Follow');
        expect(mountButton({ isFollowing: true }).text()).toContain('Following');
    });

    // Regression: Inertia reuses this component instance when navigating between
    // tickets, so setup() does not re-run. The button must re-sync to the new
    // prop value — otherwise an already-followed ticket renders as "Follow".
    it('updates the label when the isFollowing prop changes (no remount)', async () => {
        const wrapper = mountButton({ isFollowing: false });
        expect(wrapper.text()).toContain('Follow');
        expect(wrapper.text()).not.toContain('Following');

        await wrapper.setProps({ isFollowing: true });

        expect(wrapper.text()).toContain('Following');
        expect(wrapper.attributes('aria-pressed')).toBe('true');
    });

    it('updates the follower count when the prop changes', async () => {
        const wrapper = mountButton({ isFollowing: true, followersCount: 2 });
        expect(wrapper.text()).toContain('2');

        await wrapper.setProps({ followersCount: 5 });

        expect(wrapper.text()).toContain('5');
    });

    it('optimistically toggles on click via router.post onSuccess', async () => {
        const { router } = await import('@inertiajs/vue3');
        router.post.mockImplementation((url, data, opts) => opts.onSuccess?.());

        const wrapper = mountButton({ isFollowing: false });
        await wrapper.find('button').trigger('click');

        expect(router.post).toHaveBeenCalledTimes(1);
        expect(wrapper.text()).toContain('Following');
    });
});
