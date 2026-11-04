import { userEvent, within } from 'storybook/test';
import TicketShow from './TicketShow.vue';
import { toast } from '../../composables/useAgentToasts';
import { forgetInbox, rememberInbox } from '../../utils/agentQueues';
import {
    AgentFrame,
    agentUser,
    agentsProp,
    departmentsProp,
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
        departments: departmentsProp,
        agents: agentsProp,
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

export const StatusMenuOpen = {
    render: render('dark'),
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByTestId('esc-status'));
    },
};

export const TagPickerOpen = {
    render: render('light'),
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByTestId('esc-add-tag'));
    },
};

export const OverflowMenuOpen = {
    render: render('light'),
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByTestId('esc-ticket-more'));
    },
};

export const ShortcutHelp = {
    render: render('dark'),
    play: async () => {
        await userEvent.keyboard('?');
    },
};

/** A confirmation and an error toast, as after an action. */
export const Toasts = {
    render: render('dark'),
    play: async () => {
        toast('Status set to Resolved');
        toast('That did not go through. Try again.', 'error');
    },
};

export const ToastsLight = {
    render: render('light'),
    play: async () => {
        toast('Link copied');
        toast('This agent cannot take more tickets.', 'error');
    },
};

const minutesAhead = (m) => new Date(Date.now() + m * 60000).toISOString();

/** The customer and details panel. It opens by itself when the pane fits it (1920px). */
export const CustomerPanel = {
    render: render('dark'),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        if (!canvasElement.querySelector('[data-testid="esc-context-panel"]')) {
            await userEvent.click(canvas.getByTestId('esc-context-toggle'));
        }
    },
};

export const CustomerPanelLight = {
    render: render('light'),
    play: CustomerPanel.play,
};

export const Snoozed = {
    render: render('light', { ticket: { ...ticketDetail, snoozed_until: minutesAhead(60 * 20) } }),
};

export const Resolved = {
    render: render('dark', { ticket: { ...ticketDetail, status: 'resolved' } }),
};

export const SnoozeMenuOpen = {
    render: render('dark'),
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByTestId('esc-snooze'));
    },
};

export const AssigneeMenuOpen = {
    render: render('light'),
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByTestId('esc-assignee'));
    },
};
