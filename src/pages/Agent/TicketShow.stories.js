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
    mockAgentApi,
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

/** An offline customer: when they were last on the site, from `requester_last_seen_at`. */
export const CustomerLastSeen = {
    render: render('dark', {
        ticket: {
            ...ticketDetail,
            requester_online: false,
            requester_last_seen_at: new Date(Date.now() - 42 * 60000).toISOString(),
        },
    }),
    play: CustomerPanel.play,
};

export const CustomerLastSeenLight = {
    render: render('light', {
        ticket: {
            ...ticketDetail,
            requester_online: false,
            requester_last_seen_at: new Date(Date.now() - 42 * 60000).toISOString(),
        },
    }),
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

async function searchRelated({ canvasElement }) {
    const canvas = within(canvasElement);
    if (!canvasElement.querySelector('[data-testid="esc-context-panel"]')) {
        await userEvent.click(canvas.getByTestId('esc-context-toggle'));
    }
    const related = canvasElement.querySelector('[data-testid="esc-related-kb"]');
    await userEvent.type(within(related).getByTestId('esc-kb-search-input'), 'export');
    await within(related).findByTestId('esc-kb-results');
    related.scrollIntoView({ block: 'end' });
}

/** Knowledge-base search under Related (needs the host's `escalated.agent.kb.search`). */
export const RelatedArticles = {
    render: render('dark'),
    loaders: [async () => mockAgentApi()],
    play: searchRelated,
};

export const RelatedArticlesLight = {
    render: render('light'),
    loaders: [async () => mockAgentApi()],
    play: searchRelated,
};

async function pickArticle({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('esc-composer-input'));
    await userEvent.click(canvas.getByTestId('esc-composer-kb'));
    await userEvent.type(canvas.getByTestId('esc-composer-kb-picker').querySelector('input'), 'export');
}

/** The composer's Insert article link menu. */
export const ComposerArticleLink = {
    render: render('dark'),
    loaders: [async () => mockAgentApi()],
    play: pickArticle,
};

export const ComposerArticleLinkLight = {
    render: render('light'),
    loaders: [async () => mockAgentApi()],
    play: pickArticle,
};
