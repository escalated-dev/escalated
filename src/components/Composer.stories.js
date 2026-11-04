import Composer from './Composer.vue';
import { AgentFrame, cannedResponses } from '../../.storybook/agentFixtures.js';

export default {
    title: 'Agent/Composer',
    component: Composer,
    parameters: { layout: 'fullscreen' },
};

function render(mode, extra = {}) {
    const props = {
        replyAction: '#',
        noteAction: '#',
        statusAction: '#',
        cannedResponses,
        draftKey: '',
        ...extra,
    };
    return () => ({
        components: { Composer, AgentFrame },
        setup: () => ({ mode, props }),
        template: `
            <AgentFrame :mode="mode">
                <div style="max-width:720px;padding:48px 24px">
                    <Composer v-bind="props" />
                </div>
            </AgentFrame>
        `,
    });
}

export const Dark = { render: render('dark') };
export const Light = { render: render('light') };
export const InternalNoteDark = { render: render('dark', { mode: 'note' }) };
export const InternalNoteLight = { render: render('light', { mode: 'note' }) };
export const LightAgent = { render: render('dark', { notesOnly: true }) };
