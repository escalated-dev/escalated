import ConnectExtension from './ConnectExtension.vue';
import { AgentFrame, agentUser, sharedEscalated } from '../../../.storybook/agentFixtures.js';

export default {
    title: 'Agent/Pages/Connect extension',
    component: ConnectExtension,
    parameters: { layout: 'fullscreen' },
};

const extensionId = 'abcdefghijklmnopabcdefghijklmnop';

const base = {
    client_name: 'Escalated for Chrome',
    extension_id: extensionId,
    origin_host: `${extensionId}.chromiumapp.org`,
    approve_url: '/support/agent/connect-extension/approve',
    deny_url: '/support/agent/connect-extension/deny',
    params: {
        redirect_uri: `https://${extensionId}.chromiumapp.org/`,
        state: 'xyz',
        code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        code_challenge_method: 'S256',
        client_name: 'Escalated for Chrome',
    },
};

function render(mode, props = {}) {
    const shared = { auth: { user: agentUser }, escalated: sharedEscalated };
    const merged = { ...base, ...props };
    return () => ({
        components: { ConnectExtension, AgentFrame },
        setup: () => ({ mode, shared, merged }),
        template: `
            <AgentFrame :mode="mode" url="/support/agent/connect-extension" :page-props="shared">
                <ConnectExtension v-bind="merged" />
            </AgentFrame>
        `,
    });
}

export const Dark = { render: render('dark') };
export const Light = { render: render('light') };
export const NoClientName = { render: render('dark', { client_name: '' }) };
export const LongClientName = {
    render: render('light', { client_name: 'A very long extension name that goes on and on and on and on and on' }),
};
