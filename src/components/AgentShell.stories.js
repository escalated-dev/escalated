import AgentShell from './AgentShell.vue';
import { AgentFrame, agentUser, inboxProp, sharedEscalated } from '../../.storybook/agentFixtures.js';

export default {
    title: 'Agent/Shell',
    component: AgentShell,
    parameters: { layout: 'fullscreen' },
};

function render(mode, pageProps) {
    return () => ({
        components: { AgentShell, AgentFrame },
        setup: () => ({ mode, pageProps }),
        template: `
            <AgentFrame :mode="mode" url="/support/agent/tickets?assigned_to=7" :page-props="pageProps">
                <AgentShell title="Tickets">
                    <div style="padding:24px;font-size:13px;color:var(--esc-panel-text-tertiary)">Page content</div>
                </AgentShell>
            </AgentFrame>
        `,
    });
}

const withInbox = {
    auth: { user: agentUser },
    escalated: { ...sharedEscalated, chat_enabled: true, active_chats: [{ id: 1 }, { id: 2 }] },
    inbox: inboxProp,
};

const withoutInbox = { auth: { user: agentUser }, escalated: sharedEscalated };

export const Dark = { render: render('dark', withInbox) };
export const Light = { render: render('light', withInbox) };
export const WithoutInboxProp = { render: render('dark', withoutInbox) };
export const WithoutInboxPropLight = { render: render('light', withoutInbox) };
