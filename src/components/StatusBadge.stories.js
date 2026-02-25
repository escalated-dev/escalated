import StatusBadge from './StatusBadge.vue';

export default {
    title: 'Components/StatusBadge',
    component: StatusBadge,
    argTypes: {
        status: {
            control: 'select',
            options: [
                'open',
                'in_progress',
                'waiting_on_customer',
                'waiting_on_agent',
                'escalated',
                'resolved',
                'closed',
                'reopened',
            ],
        },
    },
};

export const Open = { args: { status: 'open' } };
export const InProgress = { args: { status: 'in_progress' } };
export const WaitingOnCustomer = { args: { status: 'waiting_on_customer' } };
export const Escalated = { args: { status: 'escalated' } };
export const Resolved = { args: { status: 'resolved' } };
export const Closed = { args: { status: 'closed' } };

export const AllStatuses = {
    render: () => ({
        components: { StatusBadge },
        template: `
            <div class="flex flex-wrap items-center gap-2">
                <StatusBadge status="open" />
                <StatusBadge status="in_progress" />
                <StatusBadge status="waiting_on_customer" />
                <StatusBadge status="waiting_on_agent" />
                <StatusBadge status="escalated" />
                <StatusBadge status="resolved" />
                <StatusBadge status="closed" />
                <StatusBadge status="reopened" />
            </div>
        `,
    }),
};

export const CustomStatus = {
    args: {
        status: 'custom_pending_review',
        customStatus: { label: 'Pending Review', color: '#8b5cf6' },
    },
};
