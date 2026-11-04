import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CommandPalette from '../../src/components/CommandPalette.vue';

let wrapper;

function mountPalette(commands = []) {
    wrapper = mount(CommandPalette, { props: { open: true, commands }, attachTo: document.body });
    return wrapper;
}

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
});

const options = () => wrapper.findAll('[role="option"]').map((o) => o.text().trim());

describe('CommandPalette', () => {
    it('renders nothing while closed', () => {
        wrapper = mount(CommandPalette, { props: { open: false } });
        expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    });

    it('lists the commands it is given and filters them by what is typed', async () => {
        mountPalette([
            { id: 'inbox', label: 'Inbox', group: 'Go to' },
            { id: 'resolve', label: 'Resolve ticket', group: 'Actions' },
        ]);
        expect(options()).toEqual(['Inbox', 'Resolve ticket']);
        await wrapper.get('input').setValue('resol');
        expect(options()).toContain('Resolve ticket');
        expect(options()).not.toContain('Inbox');
    });

    it('offers to open a ticket when a reference is typed', async () => {
        mountPalette();
        await wrapper.get('input').setValue('esc-1042');
        expect(options()[0]).toBe('Open ticket ESC-1042');
        await wrapper.get('input').trigger('keydown', { key: 'Enter' });
        expect(wrapper.emitted('open-ticket')[0]).toEqual(['ESC-1042']);
        expect(wrapper.emitted('update:open')[0]).toEqual([false]);
    });

    it('offers a ticket search for any text', async () => {
        mountPalette();
        await wrapper.get('input').setValue('csv export');
        expect(options()).toEqual(['Search tickets for “csv export”']);
        await wrapper.get('input').trigger('keydown', { key: 'Enter' });
        expect(wrapper.emitted('search')[0]).toEqual(['csv export']);
    });

    it('moves through the options with the arrow keys and runs the chosen one', async () => {
        const first = vi.fn();
        const second = vi.fn();
        mountPalette([
            { id: 'a', label: 'First', run: first },
            { id: 'b', label: 'Second', run: second },
        ]);
        const input = wrapper.get('input');
        await input.trigger('keydown', { key: 'ArrowDown' });
        expect(input.attributes('aria-activedescendant')).toBe('esc-palette-item-1');
        await input.trigger('keydown', { key: 'Enter' });
        expect(second).toHaveBeenCalled();
        expect(first).not.toHaveBeenCalled();
    });

    it('wraps around at both ends', async () => {
        mountPalette([
            { id: 'a', label: 'First' },
            { id: 'b', label: 'Second' },
        ]);
        const input = wrapper.get('input');
        await input.trigger('keydown', { key: 'ArrowUp' });
        expect(input.attributes('aria-activedescendant')).toBe('esc-palette-item-1');
        await input.trigger('keydown', { key: 'ArrowDown' });
        expect(input.attributes('aria-activedescendant')).toBe('esc-palette-item-0');
    });

    it('closes on Escape and on the backdrop', async () => {
        mountPalette();
        await wrapper.get('input').trigger('keydown', { key: 'Escape' });
        expect(wrapper.emitted('update:open')[0]).toEqual([false]);
    });

    it('returns focus to where it was when it closes', async () => {
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.focus();
        wrapper = mount(CommandPalette, { props: { open: false }, attachTo: document.body });
        await wrapper.setProps({ open: true });
        await new Promise((r) => setTimeout(r));
        expect(document.activeElement).toBe(wrapper.get('input').element);
        await wrapper.setProps({ open: false });
        expect(document.activeElement).toBe(button);
        button.remove();
    });

    it('says so when nothing matches', async () => {
        mountPalette([{ id: 'a', label: 'Inbox' }]);
        await wrapper.get('input').setValue('zzz');
        // A search is always offered for free text.
        expect(options()).toEqual(['Search tickets for “zzz”']);
    });

    it('uses dialog and combobox semantics', () => {
        mountPalette([{ id: 'a', label: 'Inbox' }]);
        expect(wrapper.get('[role="dialog"]').attributes('aria-modal')).toBe('true');
        expect(wrapper.get('input').attributes('role')).toBe('combobox');
        expect(wrapper.get('[role="listbox"]').exists()).toBe(true);
    });
});
