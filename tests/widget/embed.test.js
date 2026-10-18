import { describe, expect, it } from 'vitest';
import { normalizeTab, readEmbedConfig } from '../../src/widget/embed.js';

function script(attributes = {}) {
    const el = document.createElement('script');
    for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
    return el;
}

const page = { href: 'https://shop.example.com/orders/7' };

describe('readEmbedConfig', () => {
    it('keeps the existing defaults when nothing is configured', () => {
        expect(readEmbedConfig(script(), {}, page)).toMatchObject({
            baseUrl: '',
            widgetPath: '/support/widget',
            color: '#4F46E5',
            position: 'bottom-right',
            mode: 'launcher',
            tabs: null,
            defaultTab: null,
            department: null,
            lockDepartment: false,
            openOnLoad: false,
            hideLauncher: false,
            metadata: {},
        });
    });

    it('finds the backend from the embed.js URL the script was loaded from', () => {
        expect(
            readEmbedConfig(script({ src: 'https://help.example.com/support/widget/embed.js' }), {}, page),
        ).toMatchObject({
            baseUrl: 'https://help.example.com',
            widgetPath: '/support/widget',
        });
        expect(
            readEmbedConfig(script({ src: 'https://desk.example.com/escalated/widget/embed.js?v=2' }), {}, page),
        ).toMatchObject({ baseUrl: 'https://desk.example.com', widgetPath: '/escalated/widget' });
    });

    it('does not guess the backend from a script served anywhere else', () => {
        const config = readEmbedConfig(script({ src: 'https://cdn.example.net/escalated-widget.js' }), {}, page);

        expect(config.baseUrl).toBe('');
        expect(config.widgetPath).toBe('/support/widget');
    });

    it('lets data attributes override the global object', () => {
        const config = readEmbedConfig(
            script({
                src: 'https://help.example.com/support/widget/embed.js',
                'data-base-url': 'https://other.example.com',
                'data-color': '#ff0000',
                'data-mode': 'inline',
                'data-target': '#support',
            }),
            { baseUrl: 'https://ignored.example.com', color: '#00ff00', position: 'bottom-left' },
            page,
        );

        expect(config).toMatchObject({
            baseUrl: 'https://other.example.com',
            widgetPath: '/support/widget',
            color: '#ff0000',
            position: 'bottom-left',
            mode: 'inline',
            target: '#support',
        });
    });

    it('reads host parameters from data-meta-*, data-metadata and the global object', () => {
        const config = readEmbedConfig(
            script({
                'data-meta-order-number': 'A-1001',
                'data-metadata': '{"plan":"pro","seats":5}',
            }),
            { metadata: { plan: 'free', account_id: 'acct_9' } },
            page,
        );

        expect(config.metadata).toEqual({ account_id: 'acct_9', plan: 'pro', seats: 5, order_number: 'A-1001' });
    });

    it('ignores data-metadata that is not a JSON object', () => {
        expect(readEmbedConfig(script({ 'data-metadata': '[1,2]' }), {}, page).metadata).toEqual({});
        expect(readEmbedConfig(script({ 'data-metadata': 'not json' }), {}, page).metadata).toEqual({});
    });

    it('accepts a metadata function on the global object', () => {
        const provider = () => ({ cart_total: 10 });

        expect(readEmbedConfig(script(), { metadata: provider }, page).metadataProvider).toBe(provider);
    });

    it('reads tabs, the default tab, department and visitor details', () => {
        const config = readEmbedConfig(
            script({
                'data-tabs': 'ticket, chat, bogus',
                'data-tab': 'chat',
                'data-department': '3',
                'data-lock-department': 'true',
                'data-name': 'Jane',
                'data-email': 'jane@example.com',
                'data-subject': 'Order A-1001',
                'data-open': '',
                'data-hide-launcher': 'false',
            }),
            {},
            page,
        );

        expect(config).toMatchObject({
            tabs: ['contact', 'chat'],
            defaultTab: 'chat',
            department: '3',
            lockDepartment: true,
            prefill: { name: 'Jane', email: 'jane@example.com', subject: 'Order A-1001', message: '' },
            openOnLoad: true,
            hideLauncher: false,
        });
    });

    it('maps tab aliases', () => {
        expect(['kb', 'articles', 'ticket', 'Contact', 'status', 'nope'].map(normalizeTab)).toEqual([
            'help',
            'help',
            'contact',
            'contact',
            'status',
            null,
        ]);
    });
});
