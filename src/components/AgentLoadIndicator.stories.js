import AgentLoadIndicator from './AgentLoadIndicator.vue';

export default {
    title: 'Components/AgentLoadIndicator',
    component: AgentLoadIndicator,
};

export const Low = { args: { current: 3, max: 20 } };
export const Medium = { args: { current: 15, max: 20 } };
export const High = { args: { current: 18, max: 20 } };
export const Full = { args: { current: 20, max: 20 } };

export const AllLevels = {
    render: () => ({
        components: { AgentLoadIndicator },
        template: `
            <div class="space-y-3" style="max-width: 200px;">
                <div class="flex items-center justify-between">
                    <span class="text-xs text-neutral-400">Light</span>
                    <AgentLoadIndicator :current="3" :max="20" />
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-neutral-400">Moderate</span>
                    <AgentLoadIndicator :current="12" :max="20" />
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-neutral-400">Heavy</span>
                    <AgentLoadIndicator :current="16" :max="20" />
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-neutral-400">At Capacity</span>
                    <AgentLoadIndicator :current="20" :max="20" />
                </div>
            </div>
        `,
    }),
};
