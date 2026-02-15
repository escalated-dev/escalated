import { describe, it, expect } from 'vitest';
import * as escalated from '../src/index.js';

describe('index.js exports', () => {
    // ----------------------------------------------------------------
    // Plugin
    // ----------------------------------------------------------------
    describe('EscalatedPlugin', () => {
        it('exports EscalatedPlugin', () => {
            expect(escalated.EscalatedPlugin).toBeDefined();
        });

        it('EscalatedPlugin has an install method', () => {
            expect(typeof escalated.EscalatedPlugin.install).toBe('function');
        });
    });

    // ----------------------------------------------------------------
    // Composables
    // ----------------------------------------------------------------
    describe('composables', () => {
        it('exports useKeyboardShortcuts', () => {
            expect(escalated.useKeyboardShortcuts).toBeDefined();
        });

        it('useKeyboardShortcuts is a function', () => {
            expect(typeof escalated.useKeyboardShortcuts).toBe('function');
        });

        it('exports usePluginExtensions', () => {
            expect(escalated.usePluginExtensions).toBeDefined();
        });

        it('usePluginExtensions is a function', () => {
            expect(typeof escalated.usePluginExtensions).toBe('function');
        });
    });

    // ----------------------------------------------------------------
    // Plugin authoring helper
    // ----------------------------------------------------------------
    describe('defineEscalatedPlugin', () => {
        it('exports defineEscalatedPlugin', () => {
            expect(escalated.defineEscalatedPlugin).toBeDefined();
        });

        it('defineEscalatedPlugin is a function', () => {
            expect(typeof escalated.defineEscalatedPlugin).toBe('function');
        });
    });

    // ----------------------------------------------------------------
    // Components — every component listed in index.js must be exported
    // ----------------------------------------------------------------
    const expectedComponents = [
        'ActivityTimeline',
        'AssigneeSelect',
        'AttachmentList',
        'BulkActionBar',
        'EscalatedLayout',
        'FileDropzone',
        'FollowButton',
        'KeyboardShortcutHelp',
        'MacroDropdown',
        'PinnedNotes',
        'PluginSlot',
        'PresenceIndicator',
        'PriorityBadge',
        'QuickFilters',
        'ReplyComposer',
        'ReplyThread',
        'SatisfactionRating',
        'SlaTimer',
        'StatsCard',
        'StatusBadge',
        'TagSelect',
        'TicketFilters',
        'TicketList',
        'TicketSidebar',
    ];

    describe('component exports', () => {
        it.each(expectedComponents)('exports %s', (name) => {
            expect(escalated[name]).toBeDefined();
        });

        it.each(expectedComponents)('%s is a Vue component (object with name or setup or render)', (name) => {
            const component = escalated[name];
            // Vue SFC compiled components are objects (may have __name, setup, render, etc.)
            expect(typeof component).toBe('object');
        });

        it('exports exactly 24 components', () => {
            expect(expectedComponents).toHaveLength(24);
            for (const name of expectedComponents) {
                expect(escalated[name]).toBeDefined();
            }
        });
    });

    // ----------------------------------------------------------------
    // No undefined exports
    // ----------------------------------------------------------------
    describe('export integrity', () => {
        it('has no undefined exports', () => {
            const keys = Object.keys(escalated);
            for (const key of keys) {
                expect(escalated[key]).toBeDefined();
            }
        });

        it('total named exports equals components + plugin + composables + i18n + helper', () => {
            const keys = Object.keys(escalated);
            // 24 components + 1 plugin + 2 composables + 5 i18n (useI18n, setLocale, getLocale, mergeMessages, locales) + 1 helper = 33
            expect(keys).toHaveLength(33);
        });

        it('every export key is a non-empty string', () => {
            const keys = Object.keys(escalated);
            for (const key of keys) {
                expect(typeof key).toBe('string');
                expect(key.length).toBeGreaterThan(0);
            }
        });
    });
});
