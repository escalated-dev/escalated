import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Settings from '../../src/pages/Admin/Settings.vue';

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
};

vi.mock('@inertiajs/vue3', () => ({
    useForm: vi.fn((data) => {
        // Copy initial data into mockForm
        Object.assign(mockForm, data);
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

function mountSettings(settingsOverrides = {}) {
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
