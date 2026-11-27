import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import locales from '../src/locales/index.js';
import { setLocale } from '../src/composables/useI18n';
import SlaTimer from '../src/components/SlaTimer.vue';
import SchedulerWarning from '../src/components/SchedulerWarning.vue';
import TicketSidebar from '../src/components/TicketSidebar.vue';

// Strings added for the SLA outcome, the read-only assignee, the scheduler
// banner, the knowledge-base panel and the agent live chats. Every shipped
// locale translates them.
const KEYS = [
    'sla.met',
    'sla.missed',
    'ticket.assignee',
    'ticket.unassigned',
    'scheduler.title',
    'scheduler.never_run',
    'scheduler.last_run',
    'knowledge_panel.search_label',
    'knowledge_panel.search_failed',
    'chat.waiting',
    'chat.send_failed',
    'chat.accept_failed',
    'browser_extensions.connect_title',
    'browser_extensions.connect_intro',
    'browser_extensions.unnamed_client',
    'browser_extensions.extension_id',
    'browser_extensions.returns_to',
    'browser_extensions.approve_notice',
    'browser_extensions.approve',
    'browser_extensions.deny',
    'browser_extensions.title',
    'browser_extensions.intro',
    'browser_extensions.empty',
    'browser_extensions.connected',
    'browser_extensions.last_used',
    'browser_extensions.never_used',
    'browser_extensions.expires',
    'browser_extensions.revoke',
    'browser_extensions.revoke_confirm',
    'browser_extensions.revoke_yes',
    'browser_extensions.cancel',
    'browser_extensions.kind_badge',
];

const get = (messages, key) => key.split('.').reduce((acc, part) => acc?.[part], messages);

afterEach(() => setLocale('en'));

describe('new strings in every locale', () => {
    it('ships all fourteen locales', () => {
        expect(Object.keys(locales)).toHaveLength(14);
    });

    it.each(Object.keys(locales))('%s translates every new key', (locale) => {
        for (const key of KEYS) {
            const value = get(locales[locale], key);
            expect(typeof value, `${locale} ${key}`).toBe('string');
            expect(value.trim(), `${locale} ${key}`).not.toBe('');
            if (locale !== 'en' && !key.startsWith('ticket.')) {
                expect(value, `${locale} ${key} is still English`).not.toBe(get(locales.en, key));
            }
        }
        expect(get(locales[locale], 'scheduler.last_run')).toContain(':date');
        expect(get(locales[locale], 'browser_extensions.connect_intro')).toContain(':name');
        expect(get(locales[locale], 'browser_extensions.last_used')).toContain(':time');
    });
});

describe('components use the translations', () => {
    const hoursFromNow = (h) => new Date(Date.now() + h * 3600000).toISOString();

    it('renders the SLA outcome in the current locale', () => {
        setLocale('de');
        const wrapper = mount(SlaTimer, { props: { dueAt: hoursFromNow(5), stoppedAt: hoursFromNow(-1) } });
        expect(wrapper.text()).toContain('Eingehalten');
    });

    it('renders the scheduler banner in the current locale', () => {
        setLocale('fr');
        const wrapper = mount(SchedulerWarning, { props: { scheduler: { healthy: false, commands: [] } } });
        expect(wrapper.text()).toContain(locales.fr.scheduler.title);
        expect(wrapper.text()).toContain(locales.fr.scheduler.never_run);
    });

    it('renders the read-only assignee in the current locale', () => {
        setLocale('ja');
        const wrapper = mount(TicketSidebar, {
            props: { ticket: { reference: 'ESC-1', status: 'open', priority: 'low', created_at: hoursFromNow(-1) } },
            global: { stubs: { TicketTypeSelector: true } },
        });
        expect(wrapper.get('[data-testid="esc-sidebar-assignee"]').text()).toContain(locales.ja.ticket.unassigned);
    });
});
