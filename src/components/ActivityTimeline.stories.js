import ActivityTimeline from './ActivityTimeline.vue';

export default {
    title: 'Components/ActivityTimeline',
    component: ActivityTimeline,
};

const sampleActivities = [
    {
        id: 1,
        type: 'status_changed',
        causer: { name: 'Alice Chen' },
        properties: { from: 'open', to: 'in_progress' },
        created_at: new Date(Date.now() - 300000).toISOString(),
    },
    {
        id: 2,
        type: 'assigned',
        causer: { name: 'Bob Smith' },
        properties: { agent_name: 'Alice Chen' },
        created_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
        id: 3,
        type: 'priority_changed',
        causer: { name: 'Alice Chen' },
        properties: { from: 'medium', to: 'high' },
        created_at: new Date(Date.now() - 1200000).toISOString(),
    },
    {
        id: 4,
        type: 'tag_added',
        causer: { name: 'Alice Chen' },
        properties: { tag: 'billing' },
        created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
        id: 5,
        type: 'replied',
        causer: { name: 'Alice Chen' },
        properties: {},
        created_at: new Date(Date.now() - 2400000).toISOString(),
    },
    {
        id: 6,
        type: 'sla_breached',
        causer: null,
        properties: {},
        created_at: new Date(Date.now() - 3600000).toISOString(),
    },
];

export const Default = { args: { activities: sampleActivities } };
export const Empty = { args: { activities: [] } };
export const SingleItem = { args: { activities: [sampleActivities[0]] } };
