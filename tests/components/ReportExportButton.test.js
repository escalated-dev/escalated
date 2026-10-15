import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ReportExportButton from '../../src/components/ReportExportButton.vue';

function mountButton(props = {}) {
    return mount(ReportExportButton, {
        props: {
            reportName: 'test-report',
            periodDays: 30,
            ...props,
        },
    });
}

describe('ReportExportButton', () => {
    it('renders the export button', () => {
        const wrapper = mountButton();
        expect(wrapper.text()).toContain('Export');
    });

    it('shows dropdown on click', async () => {
        const wrapper = mountButton();
        await wrapper.find('button').trigger('click');
        expect(wrapper.text()).toContain('Export as CSV');
        expect(wrapper.text()).toContain('Export as JSON');
    });

    it('hides dropdown initially', () => {
        const wrapper = mountButton();
        expect(wrapper.text()).not.toContain('Export as CSV');
    });

    it('toggles dropdown on multiple clicks', async () => {
        const wrapper = mountButton();
        const btn = wrapper.find('button');
        await btn.trigger('click');
        expect(wrapper.text()).toContain('Export as CSV');
        await btn.trigger('click');
        expect(wrapper.text()).not.toContain('Export as CSV');
    });

    it('triggers CSV export on click', async () => {
        const mockAnchor = { click: vi.fn(), href: '', download: '' };
        const origCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            if (tag === 'a') return mockAnchor;
            return origCreateElement(tag);
        });

        const createObjectURL = vi.fn(() => 'blob:test');
        const revokeObjectURL = vi.fn();
        globalThis.URL.createObjectURL = createObjectURL;
        globalThis.URL.revokeObjectURL = revokeObjectURL;

        const wrapper = mountButton();
        await wrapper.find('button').trigger('click');
        const buttons = wrapper.findAll('button');
        const csvBtn = buttons.find((b) => b.text().includes('CSV'));
        await csvBtn.trigger('click');

        expect(mockAnchor.click).toHaveBeenCalled();
        expect(mockAnchor.download).toContain('.csv');

        vi.restoreAllMocks();
    });

    it('triggers JSON export on click', async () => {
        const mockAnchor = { click: vi.fn(), href: '', download: '' };
        const origCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            if (tag === 'a') return mockAnchor;
            return origCreateElement(tag);
        });

        const createObjectURL = vi.fn(() => 'blob:test');
        const revokeObjectURL = vi.fn();
        globalThis.URL.createObjectURL = createObjectURL;
        globalThis.URL.revokeObjectURL = revokeObjectURL;

        const wrapper = mountButton();
        await wrapper.find('button').trigger('click');
        const buttons = wrapper.findAll('button');
        const jsonBtn = buttons.find((b) => b.text().includes('JSON'));
        await jsonBtn.trigger('click');

        expect(mockAnchor.click).toHaveBeenCalled();
        expect(mockAnchor.download).toContain('.json');

        vi.restoreAllMocks();
    });
});

describe('export failures', () => {
    it.each(['http', 'network'])(
        'shows an error without downloading a %s failure and allows retry',
        async (failure) => {
            const fetchMock = vi.fn();
            if (failure === 'http') fetchMock.mockResolvedValueOnce({ ok: false, status: 403 });
            else fetchMock.mockRejectedValueOnce(new Error('offline'));
            vi.stubGlobal('fetch', fetchMock);
            const createUrl = vi.spyOn(URL, 'createObjectURL');
            const wrapper = mountButton({ exportUrl: '/reports/export' });
            try {
                await wrapper.find('button').trigger('click');
                await wrapper.findAll('button')[1].trigger('click');
                await flushPromises();
                expect(wrapper.find('[role="alert"]').text()).toContain('Export failed');
                expect(createUrl).not.toHaveBeenCalled();
                expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
                await wrapper.find('button').trigger('click');
                expect(wrapper.text()).toContain('Export as CSV');
            } finally {
                wrapper.unmount();
                vi.unstubAllGlobals();
                vi.restoreAllMocks();
            }
        },
    );

    it('prevents duplicate requests while an export is pending', async () => {
        let resolve;
        const fetchMock = vi.fn(
            () =>
                new Promise((r) => {
                    resolve = r;
                }),
        );
        vi.stubGlobal('fetch', fetchMock);
        const wrapper = mountButton({ exportUrl: '/reports/export' });
        try {
            await wrapper.find('button').trigger('click');
            await wrapper.findAll('button')[1].trigger('click');
            expect(wrapper.findAll('button').every((b) => b.attributes('disabled') !== undefined)).toBe(true);
            await wrapper.findAll('button')[2].trigger('click');
            expect(fetchMock).toHaveBeenCalledTimes(1);
            resolve({ ok: false, status: 500 });
            await flushPromises();
        } finally {
            wrapper.unmount();
            vi.unstubAllGlobals();
        }
    });
});
