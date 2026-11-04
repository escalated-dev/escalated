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
const customer = { name: 'Alex Rivera', email: 'alex@pinecone.example' };

const json = (body, status = 200) =>
    new window.Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Pinecone, the made-up notes app the demo opens on. Inline styles keep the
// fake host page independent of the package's Tailwind build.
const BRAND = '#2f6f4f';
const INK = '#1d2521';
const MUTED = '#646b66';
const LINE = '#e6e2d9';

// A flat pine cone: overlapping scales in one colour, separated by a stroke in
// the sidebar colour.
const PINECONE_MARK = `
    <svg width="22" height="28" viewBox="3.6 0 16.8 21.8" aria-hidden="true" style="display:block;">
        <rect x="11.1" y="0.4" width="1.8" height="3" rx="0.9" fill="${BRAND}" />
        <g fill="${BRAND}" stroke="#f4f2ec" stroke-width="1.2" stroke-linejoin="round">
            <path d="M12 2.60c2.59 0 3.6 1.43 3.6 2.60c0 1.98-1.98 2.88-3.6 3.60c-1.62-0.72-3.6-1.62-3.6-3.60c0-1.17 1.01-2.60 3.6-2.60z" />
            <path d="M8.6 6.60c2.59 0 3.6 1.43 3.6 2.60c0 1.98-1.98 2.88-3.6 3.60c-1.62-0.72-3.6-1.62-3.6-3.60c0-1.17 1.01-2.60 3.6-2.60z" />
            <path d="M15.4 6.60c2.59 0 3.6 1.43 3.6 2.60c0 1.98-1.98 2.88-3.6 3.60c-1.62-0.72-3.6-1.62-3.6-3.60c0-1.17 1.01-2.60 3.6-2.60z" />
            <path d="M8.6 10.80c2.59 0 3.6 1.43 3.6 2.60c0 1.98-1.98 2.88-3.6 3.60c-1.62-0.72-3.6-1.62-3.6-3.60c0-1.17 1.01-2.60 3.6-2.60z" />
            <path d="M15.4 10.80c2.59 0 3.6 1.43 3.6 2.60c0 1.98-1.98 2.88-3.6 3.60c-1.62-0.72-3.6-1.62-3.6-3.60c0-1.17 1.01-2.60 3.6-2.60z" />
            <path d="M12 14.80c2.59 0 3.6 1.43 3.6 2.60c0 1.98-1.98 2.88-3.6 3.60c-1.62-0.72-3.6-1.62-3.6-3.60c0-1.17 1.01-2.60 3.6-2.60z" />
        </g>
    </svg>`;

const CustomerSite = {
    name: 'DemoCustomerSite',
    template: `
        <div class="demo-site" style="min-height:100vh;display:flex;background:#fbfaf7;color:${INK};font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;">
            <aside style="width:216px;flex-shrink:0;background:#f4f2ec;border-right:1px solid ${LINE};display:flex;flex-direction:column;">
                <div style="height:56px;display:flex;align-items:center;gap:9px;padding:0 18px;font-size:16px;font-weight:600;letter-spacing:-0.01em;">
                    ${PINECONE_MARK}
                    Pinecone
                </div>
                <div style="margin:4px 12px 14px;padding:7px 10px;border:1px solid ${LINE};border-radius:6px;background:#fff;display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-weight:500;">Rivera Lab</span>
                    <span style="color:${MUTED};font-size:11px;">5 members</span>
                </div>
                <nav v-for="group in nav" :key="group.title" style="padding:0 12px 14px;">
                    <div style="padding:0 8px 6px;font-size:11px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:0.04em;">{{ group.title }}</div>
                    <div v-for="item in group.items" :key="item.label"
                        :style="item.active ? 'background:#e3ece6;color:${BRAND};font-weight:600;' : 'color:#3b433e;'"
                        style="display:flex;justify-content:space-between;padding:6px 8px;border-radius:5px;">
                        <span>{{ item.label }}</span>
                        <span v-if="item.count" style="color:${MUTED};font-size:12px;font-weight:400;">{{ item.count }}</span>
                    </div>
                </nav>
                <div style="margin-top:auto;padding:12px 18px;border-top:1px solid ${LINE};display:flex;align-items:center;gap:10px;">
                    <span style="width:28px;height:28px;border-radius:50%;background:${BRAND};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">AR</span>
                    <div style="line-height:1.3;">
                        <div style="font-weight:500;">Alex Rivera</div>
                        <div style="font-size:11px;color:${MUTED};">alex@pinecone.example</div>
                    </div>
                </div>
            </aside>
            <div style="flex:1;min-width:0;">
                <header style="height:56px;display:flex;align-items:center;padding:0 32px;border-bottom:1px solid ${LINE};background:#fff;">
                    <span style="color:${MUTED};">Settings</span>
                    <span style="color:#b5b9b4;margin:0 8px;">/</span>
                    <span style="font-weight:500;">Members</span>
                    <span style="margin-left:auto;width:220px;padding:6px 10px;border:1px solid ${LINE};border-radius:6px;color:#8b918c;background:#fbfaf7;">Search notes</span>
                </header>
                <main style="max-width:600px;padding:28px 32px;">
                    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;">
                        <div>
                            <h1 style="font-size:20px;font-weight:600;margin:0;letter-spacing:-0.01em;">Members</h1>
                            <p style="margin:4px 0 0;color:${MUTED};">People in Rivera Lab can read and edit shared notes.</p>
                        </div>
                        <span style="flex-shrink:0;padding:7px 12px;border-radius:6px;background:${BRAND};color:#fff;font-weight:600;">Invite people</span>
                    </div>
                    <div style="margin-top:20px;border:1px solid ${LINE};border-radius:8px;background:#fff;overflow:hidden;">
                        <div style="display:grid;grid-template-columns:1fr 84px 120px;padding:8px 16px;background:#f7f5f0;border-bottom:1px solid ${LINE};font-size:11px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:0.04em;">
                            <span>Name</span><span>Role</span><span>Status</span>
                        </div>
                        <div v-for="(m, i) in members" :key="m.email"
                            :style="i ? 'border-top:1px solid #efece5;' : ''"
                            style="display:grid;grid-template-columns:1fr 84px 120px;align-items:center;padding:10px 16px;">
                            <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                                <span style="width:30px;height:30px;flex-shrink:0;border-radius:50%;background:#ebe8e0;color:#3b433e;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;">{{ m.initials }}</span>
                                <div style="line-height:1.35;min-width:0;">
                                    <div style="font-weight:500;">{{ m.name }}</div>
                                    <div style="font-size:12px;color:${MUTED};">{{ m.email }}</div>
                                </div>
                            </div>
                            <span style="color:#3b433e;">{{ m.role }}</span>
                            <span>
                                <span v-if="m.expired" style="display:inline-block;padding:2px 8px;border-radius:4px;background:#fbe9e5;color:#9f3524;font-size:12px;font-weight:500;">Invite expired</span>
                                <span v-else style="color:${MUTED};">{{ m.seen }}</span>
                            </span>
                        </div>
                    </div>
                    <div style="margin-top:14px;padding:10px 14px;border:1px solid #efcfc8;border-radius:8px;background:#fdf6f4;color:#7c2d20;display:flex;justify-content:space-between;gap:12px;">
                        <span>Jordan's invite expired the moment it was opened. Resent 3 times.</span>
                        <span style="color:${BRAND};font-weight:600;flex-shrink:0;">Resend invite</span>
                    </div>
                    <h2 style="margin:28px 0 10px;font-size:14px;font-weight:600;">Invite settings</h2>
                    <div style="border:1px solid ${LINE};border-radius:8px;background:#fff;">
                        <div v-for="(row, i) in inviteSettings" :key="row.label"
                            :style="i ? 'border-top:1px solid #efece5;' : ''"
                            style="display:flex;justify-content:space-between;gap:16px;padding:10px 16px;">
                            <span style="color:${MUTED};">{{ row.label }}</span>
                            <span style="font-weight:500;">{{ row.value }}</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    `,
    data: () => ({
        nav: [
            {
                title: 'Notes',
                items: [
                    { label: 'All notes', count: 128 },
                    { label: 'Shared with me', count: 14 },
                    { label: 'Templates' },
                    { label: 'Trash' },
                ],
            },
            {
                title: 'Settings',
                items: [
                    { label: 'Workspace' },
                    { label: 'Members', active: true },
                    { label: 'Billing' },
                    { label: 'Integrations' },
                ],
            },
        ],
        inviteSettings: [
            { label: 'Invite links expire after', value: '7 days' },
            { label: 'Who can invite', value: 'Owners and editors' },
            { label: 'Default role for new members', value: 'Editor' },
        ],
        members: [
            { name: 'Alex Rivera', email: 'alex@pinecone.example', initials: 'AR', role: 'Owner', seen: 'Active now' },
            { name: 'Sam Okafor', email: 'sam@pinecone.example', initials: 'SO', role: 'Editor', seen: '2 hours ago' },
            { name: 'Priya Nair', email: 'priya@pinecone.example', initials: 'PN', role: 'Editor', seen: 'Yesterday' },
            { name: 'Jordan Lee', email: 'jordan@pinecone.example', initials: 'JL', role: 'Editor', expired: true },
            { name: 'Mei Tanaka', email: 'mei@pinecone.example', initials: 'MT', role: 'Viewer', seen: '3 days ago' },
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
                        color: '#2f6f4f',
                        greeting: 'Hi Alex, how can we help?',
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
                    color: '#2f6f4f',
                    title: 'Pinecone Help',
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
