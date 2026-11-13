import Index from './Index.vue';
import { AgentFrame, sharedEscalated, ticketsPage } from '../../../.storybook/agentFixtures.js';

const customer = { id: 21, name: 'Dana Customer', email: 'dana@example.com' };

export default {
    title: 'Customer/Pages/Portal',
    component: Index,
    parameters: { layout: 'fullscreen' },
};

function render(mode) {
    const shared = {
        auth: { user: customer },
        escalated: { ...sharedEscalated, is_admin: false, is_agent: false },
    };
    return () => ({
        components: { Index, AgentFrame },
        setup: () => ({ mode, shared, tickets: ticketsPage, filters: {} }),
        template: `
            <AgentFrame :mode="mode" url="/support/tickets" :page-props="shared">
                <Index :tickets="tickets" :filters="filters" />
            </AgentFrame>
        `,
    });
}

export const Dark = { render: render('dark') };
export const Light = { render: render('light') };
