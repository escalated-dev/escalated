import StatsCard from './StatsCard.vue';

export default {
    title: 'Components/StatsCard',
    component: StatsCard,
};

export const Basic = { args: { label: 'Open Tickets', value: 142 } };
export const WithTrend = { args: { label: 'Resolved Today', value: 38, trend: '+12% this week' } };
export const WithColor = { args: { label: 'SLA Breaches', value: 3, trend: '-25% vs last week', color: 'red' } };

export const DashboardGrid = {
    render: () => ({
        components: { StatsCard },
        template: `
            <div class="grid grid-cols-2 gap-4" style="max-width: 600px;">
                <StatsCard label="Open Tickets" :value="142" trend="+8% this week" color="blue" />
                <StatsCard label="Resolved Today" :value="38" trend="+12% vs yesterday" color="green" />
                <StatsCard label="Avg Response" value="2h 14m" trend="-18% improvement" color="cyan" />
                <StatsCard label="SLA Breaches" :value="3" trend="-25% vs last week" color="red" />
            </div>
        `,
    }),
};
