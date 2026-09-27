import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import EscalatedLayout from '../../src/components/EscalatedLayout.vue';

const usePage = vi.fn();

vi.mock('@inertiajs/vue3', () => ({
    usePage: (...args) => usePage(...args),
    Link: { props: ['href'], template: '<a :href="href"><slot /></a>' },
}));

vi.mock('../../src/composables/usePluginExtensions', () => ({
    usePluginExtensions: () => ({ menuItems: { value: [] } }),
}));

function pageAt(url, escalated = {}) {
    usePage.mockReturnValue({
        url,
        props: {
            auth: { user: { id: 1, name: 'Avery Agent' } },
            escalated: {
                prefix: 'support',
                is_admin: true,
                is_agent: true,
                show_powered_by: false,
                permissions: [],
                ...escalated,
            },
        },
    });
}

let wrapper;

function mountLayout(url, slot = '<p>content</p>') {
    pageAt(url);
    wrapper = mount(EscalatedLayout, {
        props: { title: 'Tickets' },
        slots: { default: slot },
        attachTo: document.body,
        global: { mocks: { $t: (key) => key } },
    });
    return wrapper;
}

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
});

beforeEach(() => {
    usePage.mockReset();
});

describe('EscalatedLayout — admin sidebar below lg', () => {
    it('renders a menu button that controls the sidebar, closed by default', () => {
        mountLayout('/support/admin/tickets');
        const toggle = wrapper.get('[data-testid="esc-nav-toggle"]');
        expect(toggle.attributes('aria-controls')).toBe('esc-admin-sidebar');
        expect(toggle.attributes('aria-expanded')).toBe('false');
        expect(toggle.classes()).toContain('lg:hidden');

        const sidebar = wrapper.get('[data-testid="esc-admin-sidebar"]');
        expect(sidebar.attributes('id')).toBe('esc-admin-sidebar');
        expect(sidebar.classes()).toEqual(expect.arrayContaining(['-translate-x-full', 'invisible']));
        // Always shown from lg up, whatever the toggle says.
        expect(sidebar.classes()).toEqual(expect.arrayContaining(['lg:translate-x-0', 'lg:visible']));
        expect(wrapper.find('[data-testid="esc-nav-backdrop"]').exists()).toBe(false);
    });

    it('only reserves the sidebar column from lg up', () => {
        mountLayout('/support/admin/tickets');
        const column = wrapper.get('main').element.parentElement;
        expect(column.className).toContain('lg:pl-64');
        expect(column.className.split(/\s+/)).not.toContain('pl-64');
        expect(column.className).toContain('min-w-0');
    });

    it('opens the drawer with a backdrop, and the backdrop closes it', async () => {
        mountLayout('/support/admin/tickets');
        await wrapper.get('[data-testid="esc-nav-toggle"]').trigger('click');

        expect(wrapper.get('[data-testid="esc-nav-toggle"]').attributes('aria-expanded')).toBe('true');
        const sidebar = wrapper.get('[data-testid="esc-admin-sidebar"]');
        expect(sidebar.classes()).toEqual(expect.arrayContaining(['translate-x-0', 'visible']));
        expect(sidebar.classes()).not.toContain('-translate-x-full');

        await wrapper.get('[data-testid="esc-nav-backdrop"]').trigger('click');
        expect(wrapper.get('[data-testid="esc-admin-sidebar"]').classes()).toContain('-translate-x-full');
    });

    it('closes the drawer on Escape, the close button, and following a link', async () => {
        mountLayout('/support/admin/tickets');
        const toggle = () => wrapper.get('[data-testid="esc-nav-toggle"]');
        const isOpen = () => toggle().attributes('aria-expanded') === 'true';

        await toggle().trigger('click');
        window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        await wrapper.vm.$nextTick();
        expect(isOpen()).toBe(false);

        await toggle().trigger('click');
        await wrapper.get('[data-testid="esc-nav-close"]').trigger('click');
        expect(isOpen()).toBe(false);

        await toggle().trigger('click');
        await wrapper.get('nav[aria-label="Admin navigation"] a').trigger('click');
        expect(isOpen()).toBe(false);
    });
});

describe('EscalatedLayout — agent top nav below lg', () => {
    it('hides the inline links below lg and shows a menu button instead', () => {
        mountLayout('/support/agent/tickets');
        const toggle = wrapper.get('[data-testid="esc-nav-toggle"]');
        expect(toggle.attributes('aria-controls')).toBe('esc-agent-menu');
        expect(toggle.classes()).toContain('lg:hidden');
        expect(wrapper.find('[data-testid="esc-agent-menu"]').exists()).toBe(false);

        const inline = wrapper.findAll('.hidden.lg\\:flex');
        expect(inline.length).toBe(2);
        expect(inline.map((el) => el.text()).join(' ')).toContain('Back to App');
    });

    it('never wraps Back to App', () => {
        mountLayout('/support/agent/tickets');
        const backLinks = wrapper.findAll('a').filter((a) => a.text() === 'Back to App');
        expect(backLinks.length).toBeGreaterThan(0);
        for (const link of backLinks) expect(link.classes()).toContain('whitespace-nowrap');
    });

    it('opens a menu with every destination, and following one closes it', async () => {
        mountLayout('/support/agent/tickets');
        await wrapper.get('[data-testid="esc-nav-toggle"]').trigger('click');

        const menu = wrapper.get('[data-testid="esc-agent-menu"]');
        expect(menu.attributes('id')).toBe('esc-agent-menu');
        const labels = menu.findAll('a').map((a) => a.text());
        expect(labels).toEqual(['Dashboard', 'Tickets', 'Admin', 'Back to App']);
        expect(menu.find('a[aria-current="page"]').text()).toBe('Tickets');

        await menu.findAll('a')[0].trigger('click');
        expect(wrapper.find('[data-testid="esc-agent-menu"]').exists()).toBe(false);
    });
});

describe('EscalatedLayout — theme hooks', () => {
    it('reads the header, active-nav and logo-tile hooks with fallbacks to the older tokens', () => {
        mountLayout('/support/admin/tickets');
        const html = wrapper.html();
        expect(wrapper.get('header').classes()).toContain('bg-[var(--esc-panel-header-bg,var(--esc-panel-topbar-bg))]');
        expect(wrapper.get('[data-testid="esc-logo-tile"]').classes()).toContain(
            'bg-[var(--esc-panel-logo-tile-bg,var(--esc-panel-border-input))]',
        );
        expect(wrapper.get('a[aria-current="page"]').classes()).toContain(
            'text-[var(--esc-panel-active-text,var(--esc-panel-text))]',
        );
        expect(html).toContain('text-[var(--esc-panel-header-text,var(--esc-panel-text))]');
    });

    it('uses the header hook for the agent nav, falling back to the sidebar colour it had', () => {
        mountLayout('/support/agent');
        expect(wrapper.get('nav[aria-label="Agent navigation"]').classes()).toContain(
            'bg-[var(--esc-panel-header-bg,var(--esc-panel-sidebar-bg))]',
        );
    });
});

describe('EscalatedLayout — table scroll affordance', () => {
    it('marks a table container that has more to the right', async () => {
        mountLayout('/support/admin/tickets', '<div class="esc-table-scroll" id="t"><table></table></div>');
        const el = wrapper.get('#t').element;
        Object.defineProperty(el, 'scrollWidth', { configurable: true, value: 900 });
        Object.defineProperty(el, 'clientWidth', { configurable: true, value: 350 });
        el.scrollLeft = 0;
        el.dispatchEvent(new window.Event('scroll'));
        expect(el.getAttribute('data-esc-overflow')).toBe('end');
    });
});

describe('EscalatedLayout — server rendering', () => {
    it('renders on the server with the navigation closed and no window access', async () => {
        pageAt('/support/admin/tickets');
        const app = createSSRApp({ render: () => h(EscalatedLayout, { title: 'Tickets' }) });
        app.config.globalProperties.$t = (key) => key;
        const html = await renderToString(app);
        expect(html).toContain('aria-expanded="false"');
        expect(html).toContain('-translate-x-full');
        expect(html).not.toContain('data-testid="esc-nav-backdrop"');
    });
});
