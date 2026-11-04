import TicketDetailPane from './TicketDetailPane.vue';
import { AgentFrame, allTags, cannedResponses, ticketDetail } from '../../.storybook/agentFixtures.js';

export default {
    title: 'Agent/TicketDetailPane',
    component: TicketDetailPane,
    parameters: { layout: 'fullscreen' },
};

const routes = {
    reply: '#',
    note: '#',
    status: '#',
    priority: '#',
    tags: '#',
    assign: '#',
    follow: '#',
    macro: '#',
    pin: () => '#',
};

function render(mode) {
    const props = { ticket: ticketDetail, tags: allTags, cannedResponses, routes, currentUserId: 7, followersCount: 2 };
    return () => ({
        components: { TicketDetailPane, AgentFrame },
        setup: () => ({ mode, props }),
        template: `
            <AgentFrame :mode="mode">
                <div style="height:100vh;max-width:880px">
                    <TicketDetailPane v-bind="props" />
                </div>
            </AgentFrame>
        `,
    });
}

export const Dark = { render: render('dark') };
export const Light = { render: render('light') };
