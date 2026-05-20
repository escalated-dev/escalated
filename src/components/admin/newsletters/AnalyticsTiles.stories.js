import AnalyticsTiles from './AnalyticsTiles.vue';

export default { title: 'Admin/Newsletters/AnalyticsTiles', component: AnalyticsTiles };

export const Default = {
    args: {
        summary: { total: 1000, sent: 990, opened: 400, clicked: 80, bounced: 10, complained: 1 },
        topClicks: [
            { url: 'https://example.com/launch', clicks: 42 },
            { url: 'https://example.com/blog/post', clicks: 18 },
            { url: 'https://example.com/pricing', clicks: 7 },
        ],
    },
};
