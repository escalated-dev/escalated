import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Settings from '../../src/pages/Admin/Settings.vue';

let initialData;
let submittedData;

// Stub Inertia
const mockForm = {
    guest_tickets_enabled: true,
    allow_customer_close: false,
    auto_close_resolved_after_days: 7,
    max_attachments_per_reply: 5,
    max_attachment_size_kb: 10240,
    ticket_reference_prefix: 'ESC',
    inbound_email_enabled: false,
    inbound_email_adapter: 'mailgun',
    inbound_email_address: '',
    mailgun_signing_key: '',
    postmark_inbound_token: '',
    ses_region: '',
    ses_topic_arn: '',
    imap_host: '',
    imap_port: 993,
    imap_encryption: 'ssl',
    imap_username: '',
    imap_password: '',
    imap_mailbox: 'INBOX',
    show_powered_by: true,
    knowledge_base_enabled: true,
    knowledge_base_public: true,
    knowledge_base_feedback_enabled: true,
    processing: false,
    recentlySuccessful: false,
    post: vi.fn(),
    cancel: vi.fn(),
    clearErrors: vi.fn(),
    defaults: vi.fn((data) => {
        initialData = data;
    }),
    reset: vi.fn(() => {
        Object.assign(mockForm, initialData);
    }),
    transform: vi.fn((callback) => {
        mockForm.submitTransform = callback;
        return mockForm;
    }),
};

vi.mock('@inertiajs/vue3', () => ({
    useForm: vi.fn((data) => {
        // Copy initial data into mockForm
        Object.assign(mockForm, data);
        initialData = data;
        mockForm.post.mockImplementation(() => {
            const values = Object.fromEntries(Object.keys(initialData).map((key) => [key, mockForm[key]]));
            submittedData = mockForm.submitTransform ? mockForm.submitTransform(values) : values;
        });
        return mockForm;
    }),
    usePage: vi.fn(() => ({
        props: { escalated: { prefix: 'support' } },
    })),
}));

vi.stubGlobal(
    'route',
    vi.fn(() => '/mocked-route'),
);

function mountSettings(settingsOverrides = {}, extraProps = {}) {
    return mount(Settings, {
        props: {
            settings: {
                guest_tickets_enabled: true,
                allow_customer_close: false,
                auto_close_resolved_after_days: 7,
                max_attachments_per_reply: 5,
                max_attachment_size_kb: 10240,
                ticket_reference_prefix: 'ESC',
                knowledge_base_enabled: true,
                knowledge_base_public: true,
                knowledge_base_feedback_enabled: true,
                show_powered_by: true,
                ...settingsOverrides,
            },
            ...extraProps,
        },
        global: {
            stubs: {
                EscalatedLayout: {
                    template: '<div><slot /></div>',
                },
                PluginSlot: true,
            },
        },
    });
}

describe('Admin/Settings - Knowledge Base toggles', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset form state
        mockForm.knowledge_base_enabled = true;
        mockForm.knowledge_base_public = true;
        mockForm.knowledge_base_feedback_enabled = true;
    });

    // ----------------------------------------------------------------
    // KB toggle fields render
    // ----------------------------------------------------------------
    describe('KB toggle fields render', () => {
        it('renders Knowledge Base section heading', () => {
            const wrapper = mountSettings();
            expect(wrapper.text()).toContain('Knowledge Base');
        });

        it('renders "Enable Knowledge Base" toggle label', () => {
            const wrapper = mountSettings();
            expect(wrapper.text()).toContain('Enable Knowledge Base');
        });

        it('renders "Public Access" toggle label', () => {
            const wrapper = mountSettings();
            expect(wrapper.text()).toContain('Public Access');
        });

        it('renders "Article Feedback" toggle label', () => {
            const wrapper = mountSettings();
            expect(wrapper.text()).toContain('Article Feedback');
        });

        it('renders description text for KB toggles', () => {
            const wrapper = mountSettings();
            expect(wrapper.text()).toContain('Show the knowledge base to customers and visitors');
            expect(wrapper.text()).toContain('Allow unauthenticated visitors to browse the knowledge base');
            expect(wrapper.text()).toContain('Show helpful / not helpful buttons on articles');
        });
    });

    // ----------------------------------------------------------------
    // Toggle state reflects form data
    // ----------------------------------------------------------------
    describe('toggle state reflects form data', () => {
        it('KB enabled toggle shows emerald (active) when enabled', () => {
            const wrapper = mountSettings({ knowledge_base_enabled: true });
            // Find all toggle buttons — KB section has 3 toggles
            const allToggles = wrapper.findAll('button[type="button"]');
            // The KB enabled toggle is after General and Inbound Email toggles
            // Find by looking for the one nearest to "Enable Knowledge Base" text
            const kbSection = wrapper.findAll('h3').find((h) => h.text() === 'Knowledge Base');
            const kbContainer = kbSection.element.closest('div.rounded-xl');
            const kbToggles = Array.from(kbContainer.querySelectorAll('button[type="button"]'));
            expect(kbToggles[0].className).toContain('bg-emerald-500');
        });

        it('KB enabled toggle shows neutral (inactive) when disabled', () => {
            mockForm.knowledge_base_enabled = false;
            const wrapper = mountSettings({ knowledge_base_enabled: false });
            const kbSection = wrapper.findAll('h3').find((h) => h.text() === 'Knowledge Base');
            const kbContainer = kbSection.element.closest('div.rounded-xl');
            const kbToggles = Array.from(kbContainer.querySelectorAll('button[type="button"]'));
            expect(kbToggles[0].className).toContain('bg-neutral-700');
        });

        it('clicking KB enabled toggle flips form value', async () => {
            const wrapper = mountSettings({ knowledge_base_enabled: true });
            const kbSection = wrapper.findAll('h3').find((h) => h.text() === 'Knowledge Base');
            const kbContainer = kbSection.element.closest('div.rounded-xl');
            const kbToggles = Array.from(kbContainer.querySelectorAll('button[type="button"]'));

            // The toggle is a native element, use wrapper to click
            const toggleWrapper = wrapper.findAll('button[type="button"]').filter((b) => b.element === kbToggles[0]);
            await toggleWrapper[0].trigger('click');

            expect(mockForm.knowledge_base_enabled).toBe(false);
        });

        it('Public Access toggle reflects form state', () => {
            mockForm.knowledge_base_public = true;
            const wrapper = mountSettings({ knowledge_base_public: true });
            const kbSection = wrapper.findAll('h3').find((h) => h.text() === 'Knowledge Base');
            const kbContainer = kbSection.element.closest('div.rounded-xl');
            const kbToggles = Array.from(kbContainer.querySelectorAll('button[type="button"]'));
            // Second toggle is Public Access
            expect(kbToggles[1].className).toContain('bg-emerald-500');
        });

        it('Article Feedback toggle reflects form state', () => {
            mockForm.knowledge_base_feedback_enabled = false;
            const wrapper = mountSettings({ knowledge_base_feedback_enabled: false });
            const kbSection = wrapper.findAll('h3').find((h) => h.text() === 'Knowledge Base');
            const kbContainer = kbSection.element.closest('div.rounded-xl');
            const kbToggles = Array.from(kbContainer.querySelectorAll('button[type="button"]'));
            // Third toggle is Article Feedback
            expect(kbToggles[2].className).toContain('bg-neutral-700');
        });
    });
});

describe('backend settings capabilities', () => {
    it('replaces values and clears credentials when Inertia reuses the page for another account', async () => {
        const wrapper = mountSettings({ imap_password: 'account-a-secret', show_powered_by: true });
        await wrapper.setProps({
            settings: { show_powered_by: false },
            supported_settings: ['show_powered_by'],
            update_url: '/account-b/settings',
        });
        expect(mockForm.imap_password).toBe('');
        expect(mockForm.cancel).toHaveBeenCalled();
        await wrapper.find('form').trigger('submit');
        expect(submittedData).toEqual({ show_powered_by: false });
        expect(mockForm.post).toHaveBeenCalledWith('/account-b/settings');
        wrapper.unmount();
    });
    it('shows and submits only supported fields using the supplied endpoint', async () => {
        const fields = [
            'knowledge_base_enabled',
            'knowledge_base_public',
            'knowledge_base_feedback_enabled',
            'show_powered_by',
        ];
        const wrapper = mountSettings({}, { supported_settings: fields, update_url: '/help/admin/settings' });
        expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual(['Knowledge Base', 'Branding']);
        expect(wrapper.text()).not.toContain('Guest Tickets');
        expect(wrapper.text()).not.toContain('Support Widget');
        expect(wrapper.findAll('button[type="button"]')).toHaveLength(4);
        await wrapper.find('form').trigger('submit');
        expect(mockForm.post).toHaveBeenCalledWith('/help/admin/settings');
        expect(submittedData).toEqual({
            knowledge_base_enabled: true,
            knowledge_base_public: true,
            knowledge_base_feedback_enabled: true,
            show_powered_by: true,
        });
        wrapper.unmount();
    });

    it('hides individual unsupported controls within a supported section', async () => {
        const wrapper = mountSettings({}, { supported_settings: ['knowledge_base_public'] });
        expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual(['Knowledge Base']);
        expect(wrapper.findAll('button[type="button"]')).toHaveLength(1);
        await wrapper.find('form').trigger('submit');
        expect(submittedData).toEqual({ knowledge_base_public: true });
        wrapper.unmount();
    });

    it('retains the complete legacy payload when capabilities are omitted', async () => {
        const wrapper = mountSettings();
        await wrapper.find('form').trigger('submit');
        expect(Object.keys(submittedData)).toHaveLength(53);
        expect(submittedData.guest_tickets_enabled).toBe(true);
        expect(mockForm.post).toHaveBeenCalledWith('/mocked-route');
        wrapper.unmount();
    });

    it('does not post hidden defaults when the backend exposes no editable settings', async () => {
        const wrapper = mountSettings({}, { supported_settings: [] });
        expect(wrapper.findAll('h3')).toHaveLength(0);
        await wrapper.find('form').trigger('submit');
        expect(submittedData).toEqual({});
        wrapper.unmount();
    });
});
