import PriorityBadge from './PriorityBadge.vue';

export default {
    title: 'Components/PriorityBadge',
    component: PriorityBadge,
    argTypes: {
        priority: {
            control: 'select',
            options: ['low', 'medium', 'high', 'urgent', 'critical'],
        },
    },
};

export const Low = { args: { priority: 'low' } };
export const Medium = { args: { priority: 'medium' } };
export const High = { args: { priority: 'high' } };
export const Urgent = { args: { priority: 'urgent' } };
export const Critical = { args: { priority: 'critical' } };

export const AllPriorities = {
    render: () => ({
        components: { PriorityBadge },
        template: `
            <div class="flex flex-wrap items-center gap-2">
                <PriorityBadge priority="low" />
                <PriorityBadge priority="medium" />
                <PriorityBadge priority="high" />
                <PriorityBadge priority="urgent" />
                <PriorityBadge priority="critical" />
            </div>
        `,
    }),
};
