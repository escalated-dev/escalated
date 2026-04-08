import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import SaveViewDialog from '../../src/components/SaveViewDialog.vue';

vi.stubGlobal(
    'route',
    vi.fn(() => '/mocked'),
);

function mountDialog(props = {}, dark = false) {
    return mount(SaveViewDialog, {
        props: {
            show: true,
            filters: { status: 'open', priority: 'high' },
            ...props,
        },
        global: {
            provide: { 'esc-dark': computed(() => dark) },
            stubs: { Teleport: true },
        },
    });
}

describe('SaveViewDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ----------------------------------------------------------------
    // Rendering
    // ----------------------------------------------------------------
    describe('rendering', () => {
        it('renders dialog when show is true', () => {
            const wrapper = mountDialog();
            expect(wrapper.text()).toContain('Save Current View');
        });

        it('does not render dialog when show is false', () => {
            const wrapper = mountDialog({ show: false });
            expect(wrapper.text()).not.toContain('Save Current View');
        });

        it('renders name input field', () => {
            const wrapper = mountDialog();
            const input = wrapper.find('input[type="text"]');
            expect(input.exists()).toBe(true);
        });

        it('renders shared checkbox', () => {
            const wrapper = mountDialog();
            const checkbox = wrapper.find('input[type="checkbox"]');
            expect(checkbox.exists()).toBe(true);
            expect(wrapper.text()).toContain('Share with all agents');
        });

        it('renders Save View and Cancel buttons', () => {
            const wrapper = mountDialog();
            expect(wrapper.text()).toContain('Save View');
            expect(wrapper.text()).toContain('Cancel');
        });
    });

    // ----------------------------------------------------------------
    // Name validation
    // ----------------------------------------------------------------
    describe('name validation', () => {
        it('shows error when name is empty on save', async () => {
            const wrapper = mountDialog();
            const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('Save View'));
            await saveBtn.trigger('click');

            expect(wrapper.text()).toContain('Name is required.');
        });

        it('shows error when name is whitespace only', async () => {
            const wrapper = mountDialog();
            const input = wrapper.find('input[type="text"]');
            await input.setValue('   ');

            const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('Save View'));
            await saveBtn.trigger('click');

            expect(wrapper.text()).toContain('Name is required.');
        });

        it('shows error when filters are empty', async () => {
            const wrapper = mountDialog({ filters: {} });
            const input = wrapper.find('input[type="text"]');
            await input.setValue('My View');

            const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('Save View'));
            await saveBtn.trigger('click');

            expect(wrapper.text()).toContain('Apply some filters first');
        });

        it('does not show error when name is valid and filters exist', async () => {
            // Mock fetch to return success
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));

            const wrapper = mountDialog();
            const input = wrapper.find('input[type="text"]');
            await input.setValue('My View');

            const saveBtn = wrapper.findAll('button').find((b) => b.text().includes('Save View'));
            await saveBtn.trigger('click');

            expect(wrapper.text()).not.toContain('Name is required.');
            vi.restoreAllMocks();
        });
    });

    // ----------------------------------------------------------------
    // Cancel / close
    // ----------------------------------------------------------------
    describe('cancel', () => {
        it('emits close on cancel click', async () => {
            const wrapper = mountDialog();
            const cancelBtn = wrapper.findAll('button').find((b) => b.text().includes('Cancel'));
            await cancelBtn.trigger('click');

            expect(wrapper.emitted('close')).toHaveLength(1);
        });

        it('resets name field on cancel', async () => {
            const wrapper = mountDialog();
            const input = wrapper.find('input[type="text"]');
            await input.setValue('Some name');

            const cancelBtn = wrapper.findAll('button').find((b) => b.text().includes('Cancel'));
            await cancelBtn.trigger('click');
            await wrapper.vm.$nextTick();

            // After cancel + re-render, the input should be empty
            const updatedInput = wrapper.find('input[type="text"]');
            expect(updatedInput.element.value).toBe('');
        });
    });
});
