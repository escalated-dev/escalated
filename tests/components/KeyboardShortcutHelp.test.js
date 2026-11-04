import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import KeyboardShortcutHelp from '../../src/components/KeyboardShortcutHelp.vue';
import { setLocale } from '../../src/composables/useI18n';

let wrapper;

function open(props = {}) {
    wrapper = mount(KeyboardShortcutHelp, {
        props: { show: true, ...props },
        attachTo: document.body,
    });
    return wrapper;
}

const dialog = () => document.body.querySelector('[role="dialog"]');
const text = () => dialog()?.textContent.replace(/\s+/g, ' ') || '';

afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    setLocale('en');
});

describe('KeyboardShortcutHelp', () => {
    it('lists the list shortcuts on the list', () => {
        open({ context: 'list' });
        expect(text()).toContain('Move down');
        expect(text()).not.toContain('Change status');
    });

    it('adds the list shortcuts on a ticket shown beside its list', () => {
        open({ context: 'detail', withList: true });
        expect(text()).toContain('Change status');
        expect(text()).toContain('Move down');
    });

    it('offers the palette and g shortcuts only in the agent panel', () => {
        open({ context: 'list' });
        expect(text()).not.toContain('Go to inbox');
        wrapper.unmount();
        open({ context: 'list', agent: true });
        expect(text()).toContain('Go to inbox');
        expect(text()).toContain('Open command palette');
    });

    it('translates its labels', () => {
        setLocale('de');
        open({ context: 'list' });
        expect(text()).toContain('Tastenkürzel');
        expect(text()).toContain('Nach unten');
    });

    it('moves focus into the dialog and closes on Escape from anywhere', async () => {
        open({ context: 'list' });
        await nextTick();
        expect(dialog().contains(document.activeElement)).toBe(true);
        document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
        expect(wrapper.emitted('update:show')).toEqual([[false]]);
    });

    it('has no blurred backdrop', () => {
        open({ context: 'list' });
        expect(document.body.innerHTML).not.toContain('backdrop-blur');
    });
});
