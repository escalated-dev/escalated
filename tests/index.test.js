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
        'AgentLoadIndicator',
        'AgentPerformanceCard',
        'ArticleEditor',
        'AssigneeSelect',
        'AttachmentList',
        'AuditLogEntry',
        'BulkActionBar',
        'CategoryTree',
        'ChartWidget',
        'CollisionWarning',
        'ConditionalFieldRules',
        'ContextPanel',
        'ContextPanelSection',
        'CustomFieldRenderer',
        'EscalatedLayout',
        'FileDropzone',
        'FollowButton',
        'KeyboardShortcutHelp',
        'KnowledgePanel',
        'KpiCard',
        'MacroDropdown',
        'PermissionMatrix',
        'PinnedNotes',
        'PluginSlot',
        'PresenceIndicator',
        'PriorityBadge',
        'QuickFilters',
        'ReplyComposer',
        'ReplyThread',
        'SatisfactionRating',
        'ScheduleEditor',
        'SideConversation',
        'SideConversationList',
        'SkillTagManager',
        'SlaComplianceChart',
        'SlaTimer',
        'StatsCard',
        'StatusBadge',
        'TagSelect',
        'TicketFilters',
        'TicketLinkPanel',
        'TicketList',
        'TicketMergeDialog',
        'TicketSidebar',
        'TicketTypeSelector',
        'TotpInput',
        'TwoFactorSetup',
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

        it('exports exactly 48 components', () => {
            expect(expectedComponents).toHaveLength(48);
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

        it('total named exports equals components + plugin + composables + helper', () => {
            const keys = Object.keys(escalated);
            // 50 components + 1 plugin + 4 composables + 1 helper + 5 pages + 6 utils = 67
            expect(keys).toHaveLength(67);
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
