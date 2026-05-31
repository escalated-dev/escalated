import SummaryTiles from './SummaryTiles.vue';

export default { title: 'Admin/Newsletters/SummaryTiles', component: SummaryTiles };

export const Healthy = {
    args: { summary: { total: 1000, sent: 990, opened: 400, clicked: 80, bounced: 10, complained: 1 } },
};
export const Empty = { args: { summary: { total: 0, sent: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 } } };
