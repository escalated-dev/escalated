import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EscalatedWidget from '../../src/widget/EscalatedWidget.vue';

// Mock global fetch for config loading
const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
        Promise.resolve({
            color: '#4F46E5',
            position: 'bottom-right',
            greeting: 'Hi there! How can we help?',
            departments: [],
            kb_enabled: true,
        }),
});
vi.stubGlobal('fetch', mockFetch);

function mountWidget(props = {}) {
    return mount(EscalatedWidget, {
        props: {
            baseUrl: 'https://example.com',
            ...props,
        },
    });
}

describe('EscalatedWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Re-setup default fetch mock
        mockFetch.mockResolvedValue({
            ok: true,
            json: () =>
                Promise.resolve({
                    color: '#4F46E5',
                    position: 'bottom-right',
                    greeting: 'Hi there!',
                    departments: [],
                    kb_enabled: true,
                }),
        });
    });

    // ----------------------------------------------------------------
    // Floating button rendering
    // ----------------------------------------------------------------
    describe('floating button', () => {
        it('renders the FAB button', () => {
            const wrapper = mountWidget();
            const fab = wrapper.find('.esc-w-fab');
            expect(fab.exists()).toBe(true);
        });

        it('has "Open support widget" label when closed', () => {
            const wrapper = mountWidget();
            const fab = wrapper.find('.esc-w-fab');
            expect(fab.attributes('aria-label')).toBe('Open support widget');
        });

        it('applies custom color to FAB', () => {
            const wrapper = mountWidget({ initialColor: '#ff0000' });
            const fab = wrapper.find('.esc-w-fab');
            expect(fab.attributes('style')).toContain('background-color');
        });
    });

    // ----------------------------------------------------------------
    // Open / close panel
    // ----------------------------------------------------------------
    describe('open/close panel', () => {
        it('panel is closed by default', () => {
            const wrapper = mountWidget();
            const panel = wrapper.find('[data-widget-panel]');
            expect(panel.classes()).not.toContain('esc-open');
        });

        it('opens panel on FAB click', async () => {
            const wrapper = mountWidget();
            await wrapper.find('.esc-w-fab').trigger('click');
            const panel = wrapper.find('[data-widget-panel]');
            expect(panel.classes()).toContain('esc-open');
        });

        it('closes panel on second FAB click', async () => {
            const wrapper = mountWidget();
            const fab = wrapper.find('.esc-w-fab');
            await fab.trigger('click');
            await fab.trigger('click');
            const panel = wrapper.find('[data-widget-panel]');
            expect(panel.classes()).not.toContain('esc-open');
        });

        it('changes aria-label when open', async () => {
            const wrapper = mountWidget();
            await wrapper.find('.esc-w-fab').trigger('click');
            expect(wrapper.find('.esc-w-fab').attributes('aria-label')).toBe('Close support widget');
        });
    });

    // ----------------------------------------------------------------
    // Tab switching
    // ----------------------------------------------------------------
    describe('tabs', () => {
        it('renders Help, Contact, and Check Status tabs', async () => {
            const wrapper = mountWidget();
            await wrapper.find('.esc-w-fab').trigger('click');
            const tabs = wrapper.findAll('.esc-w-tab');
            const tabTexts = tabs.map((t) => t.text());
            expect(tabTexts).toContain('Help');
            expect(tabTexts).toContain('Contact');
            expect(tabTexts).toContain('Check Status');
        });

        it('Help tab is active by default', () => {
            const wrapper = mountWidget();
            const tabs = wrapper.findAll('.esc-w-tab');
            const helpTab = tabs.find((t) => t.text() === 'Help');
            expect(helpTab.classes()).toContain('active');
        });

        it('switches to Contact tab on click', async () => {
            const wrapper = mountWidget();
            const contactTab = wrapper.findAll('.esc-w-tab').find((t) => t.text() === 'Contact');
            await contactTab.trigger('click');
            expect(contactTab.classes()).toContain('active');

            // Should show form fields for contact
            expect(wrapper.text()).toContain('Name');
            expect(wrapper.text()).toContain('Email');
            expect(wrapper.text()).toContain('Subject');
            expect(wrapper.text()).toContain('Description');
        });

        it('switches to Check Status tab on click', async () => {
            const wrapper = mountWidget();
            const statusTab = wrapper.findAll('.esc-w-tab').find((t) => t.text() === 'Check Status');
            await statusTab.trigger('click');
            expect(statusTab.classes()).toContain('active');

            expect(wrapper.text()).toContain('Email Address');
            expect(wrapper.text()).toContain('Ticket Reference');
        });
    });

    // ----------------------------------------------------------------
    // Contact form validation
    // ----------------------------------------------------------------
    describe('contact form required fields', () => {
        it('renders required attribute on name, email, subject, description', async () => {
            const wrapper = mountWidget();
            const contactTab = wrapper.findAll('.esc-w-tab').find((t) => t.text() === 'Contact');
            await contactTab.trigger('click');

            const nameInput = wrapper.findAll('input').find((i) => i.attributes('type') === 'text');
            const emailInput = wrapper.findAll('input').find((i) => i.attributes('type') === 'email');
            const textarea = wrapper.find('textarea');

            expect(nameInput.attributes('required')).toBeDefined();
            expect(emailInput.attributes('required')).toBeDefined();
            expect(textarea.attributes('required')).toBeDefined();
        });

        it('submit button says "Submit Ticket"', async () => {
            const wrapper = mountWidget();
            const contactTab = wrapper.findAll('.esc-w-tab').find((t) => t.text() === 'Contact');
            await contactTab.trigger('click');

            const submitBtn = wrapper.find('.esc-w-btn');
            expect(submitBtn.text()).toBe('Submit Ticket');
        });
    });

    // ----------------------------------------------------------------
    // KB search triggers API call
    // ----------------------------------------------------------------
    describe('KB search', () => {
        it('does not trigger fetch for queries shorter than 2 characters', async () => {
            const wrapper = mountWidget();
            // Clear the config fetch call
            mockFetch.mockClear();

            const searchInput = wrapper.find('input[placeholder="Search for help..."]');
            await searchInput.setValue('a');

            // Wait for debounce
            await new Promise((resolve) => setTimeout(resolve, 350));

            // Should not have called fetch for search (only config call happened earlier)
            expect(mockFetch).not.toHaveBeenCalled();
        });

        it('triggers API call for queries of 2+ characters after debounce', async () => {
            const wrapper = mountWidget();

            // Clear the config fetch
            mockFetch.mockClear();
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ articles: [{ slug: 'test', title: 'Test', excerpt: 'excerpt' }] }),
            });

            const searchInput = wrapper.find('input[placeholder="Search for help..."]');
            await searchInput.setValue('he');

            // Wait for debounce (300ms + buffer)
            await new Promise((resolve) => setTimeout(resolve, 400));

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/support/widget/articles?q=he'),
                expect.any(Object),
            );
        });
    });
});
