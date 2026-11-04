import TicketQueueList from './TicketQueueList.vue';
import { AgentFrame, inboxProp, ticketsPage } from '../../.storybook/agentFixtures.js';

export default {
    title: 'Agent/TicketQueueList',
    component: TicketQueueList,
    parameters: { layout: 'fullscreen' },
};

function render(mode, extra = {}) {
    const props = {
        tickets: ticketsPage,
        title: 'My inbox',
        subtitle: '24 tickets assigned to you',
        stats: inboxProp.stats,
        indexUrl: '/support/agent/tickets',
        selectedReference: 'ESC-1042',
        ...extra,
    };
    return () => ({
        components: { TicketQueueList, AgentFrame },
        setup: () => ({ mode, props }),
        template: `
            <AgentFrame :mode="mode">
                <div style="width:420px;height:100vh;border-right:1px solid var(--esc-panel-border)">
                    <TicketQueueList v-bind="props" />
                </div>
            </AgentFrame>
        `,
    });
}

export const Dark = { render: render('dark') };
export const Light = { render: render('light') };
export const WithoutStats = { render: render('dark', { stats: null, title: 'All tickets', subtitle: '142 tickets' }) };
