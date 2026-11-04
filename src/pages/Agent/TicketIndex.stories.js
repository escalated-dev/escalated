import TicketIndex from './TicketIndex.vue';
import {
    AgentFrame,
    agentUser,
    emptyTicketsPage,
    inboxProp,
    longTicketsPage,
    sharedEscalated,
    ticketsPage,
} from '../../../.storybook/agentFixtures.js';

export default {
    title: 'Agent/Pages/Inbox',
    component: TicketIndex,
    parameters: { layout: 'fullscreen' },
};

function render(
    mode,
    {
        inbox = inboxProp,
        url = '/support/agent/tickets?assigned_to=7',
        tickets = ticketsPage,
        filters = { assigned_to: '7' },
    } = {},
) {
    const shared = { auth: { user: agentUser }, escalated: sharedEscalated, inbox };
    const props = { tickets, filters, departments: [], tags: [], inbox };
    return () => ({
        components: { TicketIndex, AgentFrame },
        setup: () => ({ mode, shared, props, url }),
        template: `
            <AgentFrame :mode="mode" :url="url" :page-props="shared">
                <TicketIndex v-bind="props" />
            </AgentFrame>
        `,
    });
}

export const Dark = { render: render('dark') };
export const Light = { render: render('light') };
export const WithoutInboxProp = { render: render('dark', { inbox: null, url: '/support/agent/tickets' }) };
export const LongContent = { render: render('dark', { tickets: longTicketsPage }) };
export const Empty = { render: render('light', { tickets: emptyTicketsPage }) };
export const NoMatches = {
    render: render('dark', {
        tickets: emptyTicketsPage,
        filters: { assigned_to: '7', search: 'refund', priority: 'urgent' },
        url: '/support/agent/tickets?assigned_to=7&search=refund&priority=urgent',
    }),
};
