import KpiCard from './KpiCard.vue';

export default {
    title: 'Components/KpiCard',
    component: KpiCard,
};

export const Basic = { args: { label: 'Total Tickets', value: 1284 } };
export const WithPositiveTrend = { args: { label: 'Resolved', value: 892, trend: 12 } };
export const WithNegativeTrend = { args: { label: 'SLA Breaches', value: 7, trend: -34 } };

export const WithIcon = {
    args: {
        label: 'Active Agents',
        value: 24,
        trend: 8,
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
};

export const DashboardRow = {
    render: () => ({
        components: { KpiCard },
        template: `
            <div class="grid grid-cols-3 gap-4" style="max-width: 800px;">
                <KpiCard label="Total Tickets" :value="1284" :trend="5" icon="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />
                <KpiCard label="Avg Response Time" value="1h 42m" :trend="-18" icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                <KpiCard label="CSAT Score" value="94%" :trend="3" icon="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </div>
        `,
    }),
};
