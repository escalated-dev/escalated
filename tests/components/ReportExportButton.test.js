import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
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
