import BrowserExtensions from './BrowserExtensions.vue';
import { AgentFrame, agentUser, sharedEscalated } from '../../../.storybook/agentFixtures.js';

export default {
    title: 'Agent/Pages/Browser extensions',
    component: BrowserExtensions,
    parameters: { layout: 'fullscreen' },
};

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

const tokens = [
    {
        id: 5,
        name: 'Browser extension (Escalated for Chrome)',
        extension_id: 'abcdefghijklmnopabcdefghijklmnop',
        created_at: daysAgo(10),
        last_used_at: daysAgo(0.1),
        expires_at: null,
    },
    {
        id: 6,
        name: 'Browser extension',
        extension_id: 'ponmlkjihgfedcbaponmlkjihgfedcba',
        created_at: daysAgo(2),
        last_used_at: null,
        expires_at: new Date(Date.now() + 28 * 86400000).toISOString(),
    },
];

function render(mode, list) {
    const shared = { auth: { user: agentUser }, escalated: sharedEscalated };
    const props = { tokens: list, revoke_url_template: '/support/agent/browser-extensions/__ID__' };
    return () => ({
        components: { BrowserExtensions, AgentFrame },
        setup: () => ({ mode, shared, props }),
        template: `
            <AgentFrame :mode="mode" url="/support/agent/browser-extensions" :page-props="shared">
                <BrowserExtensions v-bind="props" />
            </AgentFrame>
        `,
    });
}

export const Dark = { render: render('dark', tokens) };
export const Light = { render: render('light', tokens) };
export const Empty = { render: render('dark', []) };
