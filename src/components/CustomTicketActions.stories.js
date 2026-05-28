import CustomTicketActions from './CustomTicketActions.vue';

export default {
    title: 'Components/CustomTicketActions',
    component: CustomTicketActions,
};

const baseAction = {
    confirmation: null,
    disabled: false,
    metadata: {},
    method: 'post',
};

export const Default = {
    args: {
        actions: [
            {
                ...baseAction,
                key: 'sync-crm',
                label: 'Sync CRM',
                variant: 'primary',
                metadata: { icon: 'refresh-cw' },
                url: '#',
            },
            {
                ...baseAction,
                key: 'export',
                label: 'Export',
                variant: 'secondary',
                url: '#',
            },
        ],
    },
};

export const WithConfirmationAndDanger = {
    args: {
        actions: [
            {
                ...baseAction,
                key: 'archive',
                label: 'Archive',
                variant: 'danger',
                confirmation: 'Archive this ticket?',
                url: '#',
            },
        ],
    },
};

export const Disabled = {
    args: {
        actions: [
            {
                ...baseAction,
                key: 'locked',
                label: 'Already synced',
                variant: 'secondary',
                disabled: true,
                url: '#',
            },
        ],
    },
};

export const Empty = {
    args: {
        actions: [],
    },
};
