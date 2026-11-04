/**
 * The README demo (scripts/generate-demo.js records this story into
 * .github/profile/demo.gif).
 *
 * It plays the real components end to end: a customer files a ticket from the
 * embeddable widget on a host site, then the agent opens it from the inbox
 * split view, assigns it, replies and sets the status. A stand-in backend
 * answers the widget's fetch calls and the pages' Inertia router calls, so the
 * screens change the way they do in a host app.
 */
import '../../../.storybook/widget-no-autoboot.js';
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import TicketIndex from './TicketIndex.vue';
import TicketShow from './TicketShow.vue';
import { mountEscalatedWidget } from '../../widget/index.js';
import { forgetInbox } from '../../utils/agentQueues';
import { setPage, setRouterHandler } from '../../../.storybook/inertia-mock.js';
import {
    AgentFrame,
    agentUser,
    allTags,
    cannedResponses,
    inboxProp,
    sampleTickets,
    sharedEscalated,
} from '../../../.storybook/agentFixtures.js';

export default {
    title: 'Agent/Demo',
    parameters: { layout: 'fullscreen' },
};

const INBOX_URL = '/support/agent/tickets?unassigned=1';
const QUEUE = { key: 'unassigned', title: 'Unassigned' };
const NEW_REFERENCE = 'ESC-1043';
const customer = { name: 'Alex Rivera', email: 'alex@acme.co' };

const json = (body, status = 200) =>
    new window.Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const CustomerSite = {
    name: 'DemoCustomerSite',
    template: `
        <div class="demo-site" style="min-height:100vh;background:#0b0d12;color:#e5e7eb;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <header style="height:56px;display:flex;align-items:center;gap:28px;padding:0 32px;border-bottom:1px solid rgba(255,255,255,0.07);">
                <div style="display:flex;align-items:center;gap:10px;font-weight:600;font-size:15px;color:#fff;">
                    <span style="width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#6366f1,#22d3ee);display:inline-block;"></span>
                    Acme Analytics
                </div>
                <nav style="display:flex;gap:20px;font-size:13px;color:#9ca3af;">
                    <span>Dashboards</span><span>Reports</span><span style="color:#fff;">Team</span><span>Billing</span>
                </nav>
                <span style="margin-left:auto;font-size:13px;color:#9ca3af;">Alex Rivera</span>
            </header>
            <main style="max-width:760px;padding:40px 32px;">
                <h1 style="font-size:22px;font-weight:600;color:#fff;margin:0;">Team members</h1>
                <p style="margin:6px 0 24px;font-size:14px;color:#9ca3af;">Invite colleagues to view and edit your dashboards.</p>
                <div style="border:1px solid rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;">
                    <div v-for="m in members" :key="m.email" style="display:flex;align-items:center;gap:14px;padding:14px 18px;border-top:1px solid rgba(255,255,255,0.06);font-size:14px;">
                        <span style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">{{ m.initials }}</span>
                        <div style="flex:1;">
                            <div style="color:#fff;">{{ m.name }}</div>
                            <div style="font-size:12px;color:#9ca3af;">{{ m.email }}</div>
                        </div>
                        <span :style="m.badgeStyle" style="font-size:12px;padding:3px 10px;border-radius:999px;">{{ m.state }}</span>
                    </div>
                </div>
                <p style="margin-top:14px;font-size:13px;color:#f87171;">Invites sent to jordan@acme.co keep showing as expired.</p>
            </main>
        </div>
    `,
    data: () => ({
        members: [
            {
                name: 'Alex Rivera',
                email: 'alex@acme.co',
                initials: 'AR',
                state: 'Owner',
                badgeStyle: 'background:rgba(99,102,241,0.18);color:#c7d2fe;',
            },
            {
                name: 'Sam Okafor',
                email: 'sam@acme.co',
                initials: 'SO',
                state: 'Editor',
                badgeStyle: 'background:rgba(255,255,255,0.07);color:#d1d5db;',
            },
            {
                name: 'Jordan Lee',
                email: 'jordan@acme.co',
                initials: 'JL',
                state: 'Invite expired',
                badgeStyle: 'background:rgba(248,113,113,0.15);color:#fca5a5;',
            },
        ],
    }),
};

function newTicketFrom(payload) {
    const now = new Date().toISOString();
    return {
        id: 1043,
        reference: NEW_REFERENCE,
        subject: payload.subject,
        description: payload.description,
        status: 'open',
        priority: 'medium',
        requester: { name: payload.name, email: payload.email },
        requester_name: payload.name,
        created_at: now,
        updated_at: now,
        last_reply_at: now,
        is_unread: true,
        requester_online: true,
        first_response_due_at: new Date(Date.now() + 45 * 60000).toISOString(),
    };
}

export const Flow = {
    render: () => ({
        components: { AgentFrame, CustomerSite, TicketIndex, TicketShow },
        setup() {
            const phase = ref('customer');
            const view = ref('inbox');
            const site = ref(null);
            const shared = reactive({
                auth: { user: agentUser },
                escalated: { ...sharedEscalated },
                inbox: { ...inboxProp, counts: { ...inboxProp.counts, unassigned: inboxProp.counts.unassigned + 1 } },
                queue: QUEUE,
            });
            const tickets = reactive({
                data: sampleTickets.slice(1, 7).map((t) => ({ ...t, is_unread: false })),
                current_page: 1,
                last_page: 1,
                per_page: 25,
                total: 18,
                links: [],
            });
            const detail = ref(null);

            let widget = null;
            const realFetch = window.fetch;
            forgetInbox();

            // --- The stand-in backend: widget API ---------------------------------
            window.fetch = async (input, init = {}) => {
                const url = typeof input === 'string' ? input : input.url;
                const match = url.match(/\/support\/widget(\/[^?]*)/);
                if (!match) return realFetch(input, init);
                const path = match[1];
                if (path === '/config') {
                    return json({
                        color: '#6366f1',
                        greeting: 'Hi Alex! How can we help?',
                        kb_enabled: false,
                        status_lookup_enabled: false,
                        departments: [],
                    });
                }
                if (path === '/chat/availability') return json({ available: false });
                if (path === '/tickets' && init.method === 'POST') {
                    const ticket = newTicketFrom(JSON.parse(init.body));
                    tickets.data.unshift(ticket);
                    tickets.total += 1;
                    setTimeout(showAgent, 2600);
                    return json({ reference: ticket.reference, id: ticket.id });
                }
                return json({ message: 'Not found' }, 404);
            };

            function showAgent() {
                if (phase.value === 'agent') return;
                widget?.destroy();
                widget = null;
                setPage(INBOX_URL, shared);
                phase.value = 'agent';
            }

            // --- The stand-in backend: Inertia router -----------------------------
            function done(options) {
                options.onSuccess?.();
                options.onFinish?.();
            }

            setRouterHandler(({ method, url, data, options }) => {
                const row = tickets.data.find((t) => t.reference === NEW_REFERENCE);
                if (method === 'get' && url.endsWith(`/${NEW_REFERENCE}`)) {
                    if (row) row.is_unread = false;
                    detail.value = {
                        ...row,
                        channel: 'widget',
                        assigned_to: null,
                        assignee: null,
                        department: { id: 1, name: 'Support' },
                        ticket_type: 'problem',
                        requester_ticket_count: 3,
                        resolution_due_at: new Date(Date.now() + 24 * 3600000).toISOString(),
                        tags: [],
                        attachments: [],
                        replies: [],
                        activities: [],
                    };
                    setPage(`/support/agent/tickets/${NEW_REFERENCE}`, shared);
                    view.value = 'ticket';
                    return done(options);
                }
                if (method !== 'post' || !detail.value) return done(options);
                const ticket = detail.value;
                const now = new Date().toISOString();
                if (url.includes('/assign/')) {
                    ticket.assigned_to = agentUser.id;
                    ticket.assignee = { id: agentUser.id, name: agentUser.name };
                } else if (url.includes('/reply/')) {
                    ticket.replies = [
                        {
                            id: Date.now(),
                            body: data.body,
                            author: { name: agentUser.name },
                            created_at: now,
                            is_internal_note: !!data.is_internal_note,
                        },
                        ...ticket.replies,
                    ];
                    if (row) row.last_reply_at = now;
                } else if (url.includes('/status/')) {
                    ticket.status = data.status;
                    if (row) row.status = data.status;
                }
                ticket.updated_at = now;
                return done(options);
            });

            onMounted(async () => {
                await nextTick();
                widget = mountEscalatedWidget({
                    baseUrl: '',
                    widgetPath: '/support/widget',
                    color: '#6366f1',
                    title: 'Acme Support',
                    tabs: ['contact'],
                    prefill: customer,
                });
            });

            onBeforeUnmount(() => {
                widget?.destroy();
                window.fetch = realFetch;
                setRouterHandler(null);
                forgetInbox();
            });

            const props = {
                departments: [],
                tags: allTags,
                cannedResponses,
                macros: [{ id: 4, name: 'Escalate to tier 2' }],
            };

            return { phase, view, site, shared, tickets, detail, props, QUEUE, INBOX_URL };
        },
        template: `
            <div class="demo-root" :data-phase="phase" :data-view="view" style="background:#000;min-height:100vh;">
                <CustomerSite v-if="phase === 'customer'" ref="site" />
                <Transition appear name="demo-fade">
                    <AgentFrame v-if="phase === 'agent'" mode="dark" :url="INBOX_URL" :page-props="shared">
                        <TicketIndex
                            v-if="view === 'inbox'"
                            :tickets="tickets"
                            :filters="{ unassigned: '1' }"
                            :departments="[]"
                            :tags="props.tags"
                            :inbox="shared.inbox"
                            :queue="QUEUE"
                        />
                        <TicketShow
                            v-else
                            :ticket="detail"
                            :departments="[]"
                            :tags="props.tags"
                            :canned-responses="props.cannedResponses"
                            :macros="props.macros"
                            :inbox="shared.inbox"
                            :queue="QUEUE"
                            :followers_count="1"
                        />
                    </AgentFrame>
                </Transition>
            </div>
        `,
    }),
};
