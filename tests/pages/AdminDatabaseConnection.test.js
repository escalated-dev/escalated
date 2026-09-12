import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import DatabaseConnection from '../../src/pages/Admin/Settings/DatabaseConnection.vue';

/**
 * The screen that chooses which database Escalated's tables live on.
 *
 * The behaviour worth pinning is what it refuses. Pointing Escalated at a
 * database with no Escalated tables does not error at runtime — the panel
 * comes up with no tickets, no departments and no settings, which reads
 * exactly like data loss. And a connection pinned in config is deployed
 * infrastructure that a web form must not be able to contradict.
 */
const mockForm = reactive({
    connection: '',
    processing: false,
    errors: {},
    post: vi.fn(),
});

vi.mock('@inertiajs/vue3', () => ({
    useForm: vi.fn((data) => {
        Object.assign(mockForm, data);
        return mockForm;
    }),
    usePage: vi.fn(() => ({ props: { escalated: { prefix: 'support' } } })),
    router: { post: vi.fn() },
}));

vi.stubGlobal(
    'route',
    vi.fn(() => '/mocked-route'),
);

const connections = [
    {
        name: 'mysql',
        driver: 'mysql',
        database: 'app @ 127.0.0.1',
        is_current: true,
        is_host_default: true,
        reachable: true,
        migrated: true,
        ticket_count: 1840,
        error: null,
    },
    {
        name: 'support',
        driver: 'mysql',
        database: 'support @ 127.0.0.1',
        is_current: false,
        is_host_default: false,
        reachable: true,
        migrated: true,
        ticket_count: 0,
        error: null,
    },
    {
        name: 'reporting',
        driver: 'pgsql',
        database: 'reporting @ warehouse',
        is_current: false,
        is_host_default: false,
        reachable: true,
        migrated: false,
        ticket_count: null,
        error: null,
    },
    {
        name: 'archive',
        driver: 'mysql',
        database: 'archive @ offsite',
        is_current: false,
        is_host_default: false,
        reachable: false,
        migrated: false,
        ticket_count: null,
        error: 'SQLSTATE[HY000] [2002] Connection refused',
    },
];

function mountPage(overrides = {}) {
    return mount(DatabaseConnection, {
        props: {
            connections,
            current: null,
            hostDefault: 'mysql',
            pinnedByConfig: false,
            tablePrefix: 'escalated_',
            ...overrides,
        },
        global: {
            stubs: { EscalatedLayout: { template: '<div><slot /></div>' } },
        },
    });
}

beforeEach(() => {
    mockForm.connection = '';
    mockForm.errors = {};
    mockForm.processing = false;
    mockForm.post.mockClear();
});

describe('Admin database connection', () => {
    it('shows which database is being read and written right now', () => {
        const text = mountPage().text();

        expect(text).toContain('Current connection');
        expect(text).toContain('mysql');
        expect(text).toContain('application default');
        expect(text).toContain('1,840');
    });

    it('disables a connection that has no escalated tables', () => {
        const radios = mountPage().findAll('input[type="radio"]');
        const byValue = Object.fromEntries(radios.map((r) => [r.attributes('value') ?? '', r]));

        // Migrated targets are selectable...
        expect(byValue[''].attributes('disabled')).toBeUndefined();
        expect(byValue['support'].attributes('disabled')).toBeUndefined();

        // ...an unmigrated one is not, because switching to it would show an
        // empty panel rather than fail.
        expect(byValue['reporting'].attributes('disabled')).toBeDefined();
        expect(byValue['archive'].attributes('disabled')).toBeDefined();
    });

    it('explains why an unusable connection cannot be chosen', () => {
        const text = mountPage().text();

        expect(text).toContain('No Escalated tables here yet');
        expect(text).toContain('Not migrated');
        expect(text).toContain('Unreachable');
        expect(text).toContain('Connection refused');
    });

    it('is read-only when the connection is pinned in config', () => {
        const wrapper = mountPage({ pinnedByConfig: true, current: 'support' });

        expect(wrapper.text()).toContain('cannot be changed from here');
        expect(wrapper.find('form').exists()).toBe(false);
        expect(wrapper.findAll('input[type="radio"]')).toHaveLength(0);
    });

    it('does not submit while pinned, even if submit is reached', async () => {
        const wrapper = mountPage({ pinnedByConfig: true });

        await wrapper.vm.submit?.();

        expect(mockForm.post).not.toHaveBeenCalled();
    });

    it('says plainly that switching moves no data, and what gets left behind', async () => {
        const wrapper = mountPage();

        // Nothing to warn about until the selection actually differs.
        expect(wrapper.text()).not.toContain('This does not move any data');

        mockForm.connection = 'support';
        await wrapper.vm.$nextTick();

        const text = wrapper.text();
        expect(text).toContain('This does not move any data');
        expect(text).toContain('1,840');
        expect(text).toContain('no longer be visible');
    });

    it('keeps the save button inert until something changes', async () => {
        const wrapper = mountPage();
        const button = wrapper.find('button[type="submit"]');

        expect(button.attributes('disabled')).toBeDefined();

        mockForm.connection = 'support';
        await wrapper.vm.$nextTick();

        expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined();
    });

    it('surfaces a server-side refusal', async () => {
        const wrapper = mountPage();

        mockForm.errors = { connection: '[reporting] has no Escalated tables.' };
        await wrapper.vm.$nextTick();

        expect(wrapper.text()).toContain('has no Escalated tables');
    });
});
