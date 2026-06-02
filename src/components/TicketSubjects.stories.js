import TicketSubjects from './TicketSubjects.vue';

export default {
    title: 'Components/TicketSubjects',
    component: TicketSubjects,
};

export const Single = {
    args: {
        subjects: [
            {
                type: 'App\\Models\\Project',
                id: '42',
                role: 'project',
                title: 'Acme Website Redesign',
                subtitle: 'Project · Acme Corp',
                url: 'https://app.example.com/projects/42',
                color: '#2563eb',
                icon: 'folder',
            },
        ],
    },
};

export const Multiple = {
    args: {
        subjects: [
            {
                type: 'App\\Models\\Project',
                id: '42',
                role: 'project',
                title: 'Acme Website Redesign',
                subtitle: 'Project · Acme Corp',
                url: 'https://app.example.com/projects/42',
                color: '#2563eb',
                icon: 'folder',
            },
            {
                type: 'App\\Models\\Customer',
                id: '7',
                role: 'account',
                title: 'Acme Corp',
                subtitle: 'Enterprise · 320 seats',
                url: 'https://app.example.com/customers/7',
                color: '#059669',
                icon: 'building',
            },
            {
                type: 'App\\Models\\Asset',
                id: 'srv-19',
                title: 'web-prod-19',
                subtitle: 'Server · us-east-1',
                url: null,
                color: null,
                icon: null,
            },
        ],
    },
};

export const Empty = {
    args: { subjects: [] },
};
