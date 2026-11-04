/**
 * Shared fixtures for the agent panel stories: a themed frame and sample data.
 *
 * The frame sets the panel tokens on its own subtree, so a dark and a light
 * story render with the exact values the plugin applies in a host app.
 */
import { computed, defineComponent, h, provide } from 'vue';
import { setPage } from './inertia-mock.js';
import { panelThemeTokens } from '../src/plugin.js';

export const AgentFrame = defineComponent({
    name: 'AgentFrame',
    props: {
        mode: { type: String, default: 'dark' },
        url: { type: String, default: '/support/agent/tickets' },
        pageProps: { type: Object, default: () => ({}) },
        height: { type: String, default: '100vh' },
    },
    setup(props, { slots }) {
        setPage(props.url, props.pageProps);
        provide('escalated-panel', { appName: 'Escalated', logo: null, mode: props.mode });
        provide(
            'esc-dark',
            computed(() => props.mode !== 'light'),
        );
        const style = computed(() => ({
            ...panelThemeTokens(props.mode),
            '--esc-radius': '6px',
            '--esc-radius-lg': '8px',
            '--esc-shell-height': props.height,
            background: 'var(--esc-panel-bg)',
            color: 'var(--esc-panel-text)',
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            minHeight: props.height,
        }));
        return () => h('div', { 'data-fullbleed': '', style: style.value }, slots.default?.());
    },
});

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
const minutesAhead = (m) => new Date(Date.now() + m * 60000).toISOString();

export const agentUser = { id: 7, name: 'Mike Agent', email: 'mike@example.com' };

export const sharedEscalated = {
    prefix: 'support',
    is_agent: true,
    is_admin: true,
    show_powered_by: false,
    knowledge_base_enabled: true,
    chat_enabled: false,
    active_chats: [],
    permissions: [],
};

export const inboxProp = {
    counts: { mine: 24, unassigned: 18, all: 142 },
    views: [
        { id: 'urgent', name: 'Urgent', count: 6, filters: { priority: 'urgent' } },
        { id: 'sla_at_risk', name: 'SLA at risk', count: 4, filters: { sla_at_risk: 1 } },
        { id: 'waiting_on_me', name: 'Waiting on me', count: 9, filters: { status: 'waiting_on_agent' } },
        {
            id: 'waiting_on_customer',
            name: 'Waiting on customer',
            count: 11,
            filters: { status: 'waiting_on_customer' },
        },
        { id: 'recently_updated', name: 'Recently updated', count: 31, filters: { sort_by: 'updated_at' } },
    ],
    stats: { open: 24, urgent: 6, sla_at_risk: 4, resolved_today: 27 },
};

function person(name, email) {
    return { name, email };
}

export const sampleTickets = [
    {
        id: 1042,
        reference: 'ESC-1042',
        subject: 'Unable to export CSV reports from dashboard',
        description:
            "I'm trying to export our weekly report from the dashboard but it's failing with a server error. This started this morning and is still happening.",
        status: 'open',
        priority: 'high',
        requester: person('Sarah Chen', 'sarah@northwind.io'),
        requester_name: 'Sarah Chen',
        created_at: minutesAgo(12),
        updated_at: minutesAgo(12),
        last_reply_at: minutesAgo(12),
        is_unread: true,
        requester_online: true,
        resolution_due_at: minutesAhead(25),
    },
    {
        id: 1041,
        reference: 'ESC-1041',
        subject: 'SSO login redirect loop on Firefox',
        description: "After logging in with SSO, I'm redirected back to the login page and it loops forever.",
        status: 'open',
        priority: 'urgent',
        requester: person('James Wright', 'james@contoso.com'),
        created_at: minutesAgo(34),
        updated_at: minutesAgo(34),
        is_unread: true,
        sla_first_response_breached: true,
    },
    {
        id: 1040,
        reference: 'ESC-1040',
        subject: 'Custom field values not persisting after save',
        description: "The values look like they save, but after refreshing they're gone again.",
        status: 'in_progress',
        priority: 'medium',
        requester: person('Maria Garcia', 'maria@fabrikam.com'),
        created_at: minutesAgo(64),
        updated_at: minutesAgo(64),
        requester_online: true,
    },
    {
        id: 1039,
        reference: 'ESC-1039',
        subject: 'Webhook notifications delayed by 15+ minutes',
        description: "We're seeing a consistent 15 to 20 minute delay on webhook events since Tuesday.",
        status: 'open',
        priority: 'high',
        requester: person('Tom Baker', 'tom@tailspin.dev'),
        created_at: minutesAgo(125),
        updated_at: minutesAgo(125),
    },
    {
        id: 1038,
        reference: 'ESC-1038',
        subject: 'Knowledge base search returning no results',
        description: "Search isn't returning any results, even for articles that exist and are published.",
        status: 'waiting_on_customer',
        priority: 'medium',
        requester: person('Priya Patel', 'priya@adatum.org'),
        created_at: minutesAgo(190),
        updated_at: minutesAgo(190),
    },
    {
        id: 1037,
        reference: 'ESC-1037',
        subject: 'Invoice PDF shows the wrong billing address',
        description: 'Our March invoice still shows the old office address even though we changed it in settings.',
        status: 'open',
        priority: 'low',
        requester: person('Lena Fischer', 'lena@litware.de'),
        created_at: minutesAgo(300),
        updated_at: minutesAgo(300),
    },
    {
        id: 1036,
        reference: 'ESC-1036',
        subject: 'API rate limit headers missing on 429 responses',
        description:
            'When we hit the rate limit the response has no Retry-After header, so our client cannot back off.',
        status: 'in_progress',
        priority: 'medium',
        requester: person('Noah Kim', 'noah@proseware.com'),
        created_at: minutesAgo(1500),
        updated_at: minutesAgo(1500),
    },
];

export const ticketsPage = {
    data: sampleTickets,
    current_page: 1,
    last_page: 4,
    per_page: 25,
    total: 24,
    links: [],
};
