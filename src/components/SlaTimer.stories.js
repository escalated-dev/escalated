import SlaTimer from './SlaTimer.vue';

export default {
    title: 'Components/SlaTimer',
    component: SlaTimer,
};

const inOneHour = new Date(Date.now() + 3600000).toISOString();
const inFiveHours = new Date(Date.now() + 18000000).toISOString();
const inThreeDays = new Date(Date.now() + 259200000).toISOString();
const overdue = new Date(Date.now() - 3600000).toISOString();

export const Healthy = { args: { dueAt: inThreeDays, label: 'First Response' } };
export const Warning = { args: { dueAt: inOneHour, label: 'Resolution Due' } };
export const Comfortable = { args: { dueAt: inFiveHours, label: 'Next Reply' } };
export const Overdue = { args: { dueAt: overdue, label: 'Resolution Due' } };
export const Breached = { args: { dueAt: overdue, breached: true, label: 'First Response' } };

export const AllStates = {
    render: () => ({
        components: { SlaTimer },
        setup() {
            return { inThreeDays, inFiveHours, inOneHour, overdue };
        },
        template: `
            <div class="flex flex-wrap gap-3">
                <SlaTimer :dueAt="inThreeDays" label="Healthy" />
                <SlaTimer :dueAt="inFiveHours" label="Comfortable" />
                <SlaTimer :dueAt="inOneHour" label="Warning" />
                <SlaTimer :dueAt="overdue" label="Overdue" />
                <SlaTimer :dueAt="overdue" :breached="true" label="Breached" />
            </div>
        `,
    }),
};
