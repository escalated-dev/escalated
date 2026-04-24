import EscalatedWidget from './EscalatedWidget.vue';

/**
 * Storybook stories for the public-embed widget.
 *
 * The widget calls `${baseUrl}/support/widget/*` on mount to fetch its
 * runtime config (color, greeting, departments, kb_enabled, etc.) and
 * chat availability. For Storybook, we point `baseUrl` at a stub that
 * will return 404/5xx — the widget renders regardless, using the
 * `initialColor` / `initialPosition` props as fallbacks.
 *
 * The ticket form collects `name` + `email` above `subject` /
 * `description`, matching the Pattern B public-ticket payload
 * (`{ email, name, subject, description, priority }`) instead of the
 * pre-Contact `requesterId` shape.
 */
export default {
    title: 'Widget/EscalatedWidget',
    component: EscalatedWidget,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Public embed widget (KB search + ticket form + chat + status check). Mounted on the customer-facing website; talks to the `/support/widget/*` API. Ticket submissions POST `{ email, name, subject, description, priority }` — no authentication required.',
            },
        },
    },
    argTypes: {
        baseUrl: { control: 'text' },
        initialColor: { control: 'color' },
        initialPosition: {
            control: { type: 'select' },
            options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
        },
    },
};

export const Default = {
    args: {
        baseUrl: 'http://localhost:8000',
        initialColor: '#4F46E5',
        initialPosition: 'bottom-right',
    },
};

export const BrandedBlue = {
    args: {
        baseUrl: 'http://localhost:8000',
        initialColor: '#2563EB',
        initialPosition: 'bottom-right',
    },
};

export const BrandedGreen = {
    args: {
        baseUrl: 'http://localhost:8000',
        initialColor: '#16A34A',
        initialPosition: 'bottom-right',
    },
};

export const BottomLeft = {
    args: {
        baseUrl: 'http://localhost:8000',
        initialColor: '#4F46E5',
        initialPosition: 'bottom-left',
    },
};
