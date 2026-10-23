import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ChatActionBar from '../../src/components/ChatActionBar.vue';

/**
 * The transfer menu posts to the backend's chat transfer endpoint
 * (escalated-laravel `escalated.admin.chat.transfer`), which reads
 * `agent_id` / `department_id`. It used to post `{type, id}`, which Laravel
 * rejected with "Provide an agent_id or department_id.".
 */
let fetchMock;

beforeEach(() => {
    fetchMock = vi.fn(() => Promise.resolve({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

function mountBar(props = {}) {
    return mount(ChatActionBar, {
        props: {
            sessionId: 7,
            agents: [{ id: 3, name: 'Ada' }],
            departments: [{ id: 5, name: 'Billing' }],
            transferEndpoint: '/support/admin/chat/7/transfer',
            ...props,
        },
    });
}

async function openTransferMenu(wrapper) {
    const toggle = wrapper.findAll('button').find((b) => b.text() === 'Transfer' || b.text() === 'chat.transfer');
    await toggle.trigger('click');
}

function menuButton(wrapper, label) {
    return wrapper.findAll('button').find((b) => b.text() === label);
}

describe('ChatActionBar transfer', () => {
    it('posts department_id when transferring to a department', async () => {
        const wrapper = mountBar();
        await openTransferMenu(wrapper);
        await menuButton(wrapper, 'Billing').trigger('click');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('/support/admin/chat/7/transfer');
        expect(init.method).toBe('POST');
        expect(JSON.parse(init.body)).toEqual({ department_id: 5 });
    });

    it('posts agent_id when transferring to an agent', async () => {
        const wrapper = mountBar();
        await openTransferMenu(wrapper);
        await menuButton(wrapper, 'Ada').trigger('click');

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ agent_id: 3 });
    });

    it('still emits transfer with the target, and posts nothing without an endpoint', async () => {
        const wrapper = mountBar({ transferEndpoint: '' });
        await openTransferMenu(wrapper);
        await menuButton(wrapper, 'Billing').trigger('click');

        expect(fetchMock).not.toHaveBeenCalled();
        expect(wrapper.emitted('transfer')[0][0]).toEqual({ type: 'department', id: 5 });
    });
});

/**
 * End Chat posts to the backend's agent end-chat endpoint
 * (escalated-laravel `escalated.admin.chat.end`, which takes no fields). The
 * bar sends an empty JSON object so JSON-parsing backends get a valid body,
 * and emits `end-chat` only after the request settles, so a page that reloads
 * on the event sees the ended session.
 */
async function confirmEnd(wrapper) {
    const end = wrapper.findAll('button').find((b) => b.text() === 'End Chat' || b.text() === 'chat.end_chat');
    await end.trigger('click');
    const confirm = wrapper.findAll('button').find((b) => b.text() === 'Confirm' || b.text() === 'form.confirm');
    await confirm.trigger('click');
}

describe('ChatActionBar end chat', () => {
    it('posts an empty JSON body to the end endpoint', async () => {
        const wrapper = mountBar({ endEndpoint: '/support/admin/chat/7/end' });
        await confirmEnd(wrapper);
        await flushPromises();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('/support/admin/chat/7/end');
        expect(init.method).toBe('POST');
        expect(init.headers['Content-Type']).toBe('application/json');
        expect(JSON.parse(init.body)).toEqual({});
        expect(wrapper.emitted('end-chat')[0][0]).toBe(7);
    });

    it('emits end-chat only after the end request settles', async () => {
        let settle;
        fetchMock.mockImplementation(() => new Promise((resolve) => (settle = resolve)));
        const wrapper = mountBar({ endEndpoint: '/support/admin/chat/7/end' });
        await confirmEnd(wrapper);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(wrapper.emitted('end-chat')).toBeUndefined();

        settle({ ok: true });
        await flushPromises();
        expect(wrapper.emitted('end-chat')[0][0]).toBe(7);
    });

    it('still emits end-chat when the request fails', async () => {
        fetchMock.mockImplementation(() => Promise.reject(new Error('offline')));
        const wrapper = mountBar({ endEndpoint: '/support/admin/chat/7/end' });
        await confirmEnd(wrapper);
        await flushPromises();

        expect(wrapper.emitted('end-chat')[0][0]).toBe(7);
    });

    it('emits end-chat and posts nothing without an endpoint', async () => {
        const wrapper = mountBar({ endEndpoint: '' });
        await confirmEnd(wrapper);
        await flushPromises();

        expect(fetchMock).not.toHaveBeenCalled();
        expect(wrapper.emitted('end-chat')[0][0]).toBe(7);
    });
});
