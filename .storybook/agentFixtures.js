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
        // Teleported dialogs render under <body>, outside this frame, so the
        // tokens go on the document too (each agent story has one mode).
        if (typeof document !== 'undefined') {
            for (const [prop, value] of Object.entries(panelThemeTokens(props.mode))) {
                document.documentElement.style.setProperty(prop, value);
            }
        }
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
    unread: { mine: 2, unassigned: 5, all: 0 },
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

export const ticketDetail = {
    ...sampleTickets[0],
    channel: 'email',
    assigned_to: null,
    assignee: null,
    department_id: 2,
    department: { id: 2, name: 'Billing' },
    ticket_type: 'problem',
    requester_type: 'user',
    requester_id: 50,
    requester: { id: 50, name: 'Sarah Chen', email: 'sarah@northwind.io' },
    requester_ticket_count: 4,
    requester_tickets: [
        {
            id: 1018,
            reference: 'ESC-1018',
            subject: 'Scheduled export arrives empty on Mondays',
            status: 'waiting_on_customer',
            created_at: minutesAgo(60 * 50),
            updated_at: minutesAgo(60 * 30),
        },
        {
            id: 981,
            reference: 'ESC-0981',
            subject: 'CSV export missing columns',
            status: 'resolved',
            created_at: minutesAgo(60 * 24 * 12),
            updated_at: minutesAgo(60 * 24 * 11),
        },
        {
            id: 912,
            reference: 'ESC-0912',
            subject: 'Invite a second admin',
            status: 'closed',
            created_at: minutesAgo(60 * 24 * 40),
            updated_at: minutesAgo(60 * 24 * 39),
        },
    ],
    custom_fields: [
        { label: 'Plan', value: 'Business' },
        { label: 'Account ID', value: 'NW-2231' },
        { label: 'Browser', value: null },
    ],
    created_at: minutesAgo(12),
    first_response_due_at: minutesAhead(25),
    resolution_due_at: minutesAhead(60 * 26),
    tags: [{ id: 1, name: 'Billing', color: '#f59e0b' }],
    attachments: [{ id: 9, original_filename: 'error-export.png', size: 331776, url: '#' }],
    replies: [
        {
            id: 3,
            body: "Hi Sarah,\n\nThanks for the details. I've identified the issue and am restarting the export service now. I'll let you know as soon as it's complete.",
            author: { id: 7, name: 'Mike Agent' },
            author_type: 'user',
            author_id: 7,
            created_at: minutesAgo(0.5),
            is_internal_note: false,
        },
        {
            id: 2,
            body: 'Looks like the export job is timing out. Checking the queue and recent deploys.',
            author: { id: 7, name: 'Mike Agent' },
            author_type: 'user',
            author_id: 7,
            created_at: minutesAgo(8),
            is_internal_note: true,
        },
    ],
    activities: [
        {
            id: 2,
            type: 'priority_changed',
            causer: { name: 'Mike Agent' },
            properties: { old_priority: 'medium', new_priority: 'high' },
            created_at: minutesAgo(10),
        },
        {
            id: 1,
            type: 'tag_added',
            causer: { name: 'Mike Agent' },
            properties: { tag: 'Billing' },
            created_at: minutesAgo(11),
        },
        {
            id: 3,
            type: 'replied',
            causer: { name: 'Mike Agent' },
            created_at: minutesAgo(0.5),
        },
    ],
    related_tickets: [
        { reference: 'ESC-0981', subject: 'CSV export missing columns', status: 'resolved' },
        { reference: 'ESC-0912', subject: 'Invite a second admin', status: 'closed' },
    ],
    links_as_parent: [
        { link_type: 'related', child_ticket: { reference: 'ESC-1039', subject: 'Webhook notifications delayed' } },
    ],
};

export const agentsProp = [
    { id: 7, name: 'Mike Agent' },
    { id: 8, name: 'Ana Lopez' },
    { id: 9, name: 'Tom Baker' },
    { id: 10, name: 'Priya Patel' },
];

export const departmentsProp = [
    { id: 2, name: 'Billing' },
    { id: 3, name: 'Technical' },
    { id: 4, name: 'Sales' },
];

export const allTags = [
    { id: 1, name: 'Billing', color: '#f59e0b' },
    { id: 2, name: 'Export', color: '#3b82f6' },
    { id: 3, name: 'Bug', color: '#ef4444' },
];

export const cannedResponses = [
    { id: 1, title: 'Greeting', body: 'Hi there,\n\n' },
    { id: 2, title: 'Closing', body: '\n\nLet me know if there is anything else.' },
];

export const rememberedInbox = {
    url: '/support/agent/tickets?assigned_to=7',
    title: 'My inbox',
    subtitle: '24 tickets assigned to you',
    filters: { assigned_to: '7' },
    tickets: ticketsPage,
    stats: inboxProp.stats,
};

// Edge cases for the QA stories: very long text, many rows, nothing at all.
const LONG_SUBJECT =
    'Customers on the legacy enterprise plan cannot download the quarterly usage export because the signed URL expires before the file finishes generating';

export const longTicket = {
    ...ticketDetail,
    reference: 'ESC-104299',
    subject: LONG_SUBJECT,
    requester: {
        name: 'Maximiliana Alexandrovna Konstantinopoulou-Vanderbilt',
        email: 'maximiliana.konstantinopoulou-vanderbilt@a-very-long-company-domain-name.example.com',
    },
    tags: [
        { id: 1, name: 'Billing', color: '#f59e0b' },
        { id: 2, name: 'Export', color: '#3b82f6' },
        { id: 3, name: 'Enterprise customers on the legacy plan', color: '#ef4444' },
        { id: 4, name: 'Needs engineering', color: '#8b5cf6' },
    ],
    attachments: [
        {
            id: 9,
            original_filename: 'quarterly-usage-export-2026-Q3-enterprise-legacy-plan-failed-download-screenshot.png',
            size: 2831776,
            url: '#',
        },
    ],
    replies: [
        {
            id: 4,
            body: 'https://dashboard.example.com/exports/quarterly/2026-Q3/enterprise/legacy/download?signature=abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz',
            author: { name: 'Maximiliana Alexandrovna Konstantinopoulou-Vanderbilt' },
            created_at: minutesAgo(3),
            is_internal_note: false,
        },
        ...ticketDetail.replies,
    ],
};

export const longTicketsPage = {
    ...ticketsPage,
    data: [
        {
            ...sampleTickets[0],
            reference: 'ESC-104299',
            subject: LONG_SUBJECT,
            requester: longTicket.requester,
        },
        ...Array.from({ length: 59 }, (_, i) => ({
            ...sampleTickets[(i % 6) + 1],
            id: 2000 + i,
            reference: `ESC-${2000 + i}`,
        })),
    ],
    total: 60,
};

export const emptyTicketsPage = { data: [], current_page: 1, last_page: 1, total: 0 };

export const notificationItems = [
    {
        id: 'n-1',
        type: 'ticket_reply',
        title: 'Sarah Chen replied to ESC-1042',
        body: 'Still failing after the restart. Attaching the new error.',
        ticket: { id: 1042, reference: 'ESC-1042', subject: 'Unable to export CSV reports from dashboard' },
        url: '/support/agent/tickets/ESC-1042',
        created_at: minutesAgo(3),
        read_at: null,
    },
    {
        id: 'n-2',
        type: 'sla_warning',
        title: 'ESC-1041 first response is due in 25 minutes',
        body: 'SSO login redirect loop on Firefox',
        ticket: { id: 1041, reference: 'ESC-1041', subject: 'SSO login redirect loop on Firefox' },
        url: '/support/agent/tickets/ESC-1041',
        created_at: minutesAgo(18),
        read_at: null,
    },
    {
        id: 'n-3',
        type: 'ticket_assigned',
        title: 'ESC-1039 was assigned to you',
        body: 'Webhook notifications delayed by 15+ minutes',
        ticket: { id: 1039, reference: 'ESC-1039', subject: 'Webhook notifications delayed by 15+ minutes' },
        url: '/support/agent/tickets/ESC-1039',
        created_at: minutesAgo(52),
        read_at: null,
    },
    {
        id: 'n-4',
        type: 'mention',
        title: 'Ana Lopez mentioned you on ESC-1038',
        body: 'Can you check the search index on this one?',
        ticket: { id: 1038, reference: 'ESC-1038', subject: 'Knowledge base search returning no results' },
        url: '/support/agent/tickets/ESC-1038',
        created_at: minutesAgo(140),
        read_at: minutesAgo(100),
    },
    {
        id: 'n-5',
        type: 'sla_breached',
        title: 'ESC-1035 missed its resolution target',
        body: 'Refund not received',
        ticket: { id: 1035, reference: 'ESC-1035', subject: 'Refund not received' },
        url: '/support/agent/tickets/ESC-1035',
        created_at: minutesAgo(60 * 26),
        read_at: minutesAgo(60 * 20),
    },
    {
        id: 'n-6',
        type: 'ticket_assigned',
        title: 'A ticket you can no longer view',
        body: null,
        ticket: null,
        url: null,
        created_at: minutesAgo(60 * 50),
        read_at: minutesAgo(60 * 49),
    },
];

export const kbArticles = [
    {
        id: 11,
        title: 'Exporting reports to CSV',
        excerpt: 'Reports can be exported from the dashboard or scheduled weekly. Large exports run in the background.',
        url: 'https://example.com/support/kb/exporting-reports-to-csv',
        category: { id: 3, name: 'Reports' },
        updated_at: minutesAgo(60 * 24 * 3),
    },
    {
        id: 12,
        title: 'Why a scheduled export arrives empty',
        excerpt: 'An empty export usually means the saved filter matched nothing for the period.',
        url: 'https://example.com/support/kb/scheduled-export-empty',
        category: { id: 3, name: 'Reports' },
        updated_at: minutesAgo(60 * 24 * 12),
    },
    {
        id: 13,
        title: 'Export worker runbook',
        excerpt: 'Restarting the export worker and clearing stuck jobs.',
        url: 'https://example.com/support/kb/export-worker-runbook',
        category: { id: 9, name: 'Operations' },
        updated_at: minutesAgo(60 * 5),
        internal: true,
    },
];

/**
 * Answers the agent panel's JSON routes in stories (the notifications feed, knowledge-base search),
 * so a story shows real-looking data without a backend.
 */
export function mockAgentApi() {
    if (typeof window === 'undefined' || window.__escAgentApiMocked) return;
    window.__escAgentApiMocked = true;
    const realFetch = window.fetch.bind(window);
    const json = (data) => Promise.resolve(new window.Response(JSON.stringify(data), { status: 200 }));
    window.fetch = (input, init = {}) => {
        const url = String(typeof input === 'string' ? input : input?.url || '');
        if (url.includes('/agent/kb/search')) {
            const q = new window.URL(url, window.location.href).searchParams.get('q') || '';
            const data = kbArticles.filter((a) => `${a.title} ${a.excerpt}`.toLowerCase().includes(q.toLowerCase()));
            return json({ data });
        }
        if (url.includes('/agent/notifications')) {
            if ((init.method || 'GET') === 'POST') return json({ unread_count: 0 });
            const unreadOnly = url.includes('unread=1');
            const data = notificationItems.filter((item) => !unreadOnly || !item.read_at);
            return json({
                data,
                meta: { current_page: 1, last_page: 1, per_page: 20, total: data.length },
                unread_count: 3,
            });
        }
        return realFetch(input, init);
    };
}
