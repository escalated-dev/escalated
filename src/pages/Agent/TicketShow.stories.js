import TicketShow from './TicketShow.vue';
import { forgetInbox, rememberInbox } from '../../utils/agentQueues';
import {
    AgentFrame,
    agentUser,
    allTags,
    cannedResponses,
    inboxProp,
    longTicket,
    longTicketsPage,
    rememberedInbox,
    sharedEscalated,
    ticketDetail,
} from '../../../.storybook/agentFixtures.js';

export default {
    title: 'Agent/Pages/Ticket',
    component: TicketShow,
    parameters: { layout: 'fullscreen' },
};

function render(mode, { withList = true, escalated = {}, ticket = ticketDetail, list = rememberedInbox } = {}) {
    const shared = {
        auth: { user: agentUser },
        escalated: { ...sharedEscalated, ...escalated },
        inbox: inboxProp,
        queue: { key: 'mine', title: 'My inbox' },
    };
    const props = {
        ticket,
        departments: [],
        tags: allTags,
        cannedResponses,
        macros: [{ id: 4, name: 'Escalate to tier 2' }],
        inbox: inboxProp,
        queue: { key: 'mine', title: 'My inbox' },
        followers_count: 2,
    };
    return () => ({
        components: { TicketShow, AgentFrame },
        setup() {
            if (withList) rememberInbox({ ...list, queueKey: 'mine' });
            else forgetInbox();
            return { mode, shared, props };
        },
        template: `
            <AgentFrame :mode="mode" url="/support/agent/tickets/ESC-1042" :page-props="shared">
                <TicketShow v-bind="props" />
            </AgentFrame>
        `,
    });
}

export const Dark = { render: render('dark') };
export const Light = { render: render('light') };
export const SinglePane = { render: render('dark', { withList: false }) };
export const LightAgent = { render: render('light', { escalated: { agent_type: 'light' } }) };
export const LongContent = {
    render: render('dark', { ticket: longTicket, list: { ...rememberedInbox, tickets: longTicketsPage } }),
};
export const LongContentLight = {
    render: render('light', { ticket: longTicket, list: { ...rememberedInbox, tickets: longTicketsPage } }),
};
