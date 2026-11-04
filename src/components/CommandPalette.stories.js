import CommandPalette from './CommandPalette.vue';
import { AgentFrame } from '../../.storybook/agentFixtures.js';

export default {
    title: 'Agent/CommandPalette',
    component: CommandPalette,
    parameters: { layout: 'fullscreen' },
};

const commands = [
    { id: 'reply', label: 'Reply', icon: 'send', group: 'Actions', hint: 'r' },
    { id: 'note', label: 'Add internal note', icon: 'lock', group: 'Actions', hint: 'n' },
    { id: 'assign', label: 'Assign to me', icon: 'user', group: 'Actions', hint: 'a' },
    { id: 'resolve', label: 'Resolve ticket', icon: 'check', group: 'Actions', hint: 'e' },
    { id: 'inbox', label: 'Inbox', icon: 'inbox', group: 'Go to', hint: 'g i' },
    { id: 'unassigned', label: 'Unassigned', icon: 'user', group: 'Go to', hint: 'g u' },
    { id: 'all', label: 'All tickets', icon: 'ticket', group: 'Go to', hint: 'g a' },
];

function render(mode) {
    return () => ({
        components: { CommandPalette, AgentFrame },
        setup: () => ({ mode, commands }),
        template: `
            <AgentFrame :mode="mode">
                <CommandPalette :open="true" :commands="commands" />
            </AgentFrame>
        `,
    });
}

export const Dark = { render: render('dark') };
export const Light = { render: render('light') };
