// Plugin
export { EscalatedPlugin } from './plugin';

// Components
export { default as ActiveChatsPanel } from './components/ActiveChatsPanel.vue';
export { default as ActivityTimeline } from './components/ActivityTimeline.vue';
export { default as AgentLoadIndicator } from './components/AgentLoadIndicator.vue';
export { default as AgentPerformanceCard } from './components/AgentPerformanceCard.vue';
export { default as ArticleEditor } from './components/ArticleEditor.vue';
export { default as AssigneeSelect } from './components/AssigneeSelect.vue';
export { default as AttachmentList } from './components/AttachmentList.vue';
export { default as AuditLogEntry } from './components/AuditLogEntry.vue';
export { default as BulkActionBar } from './components/BulkActionBar.vue';
export { default as CategoryTree } from './components/CategoryTree.vue';
export { default as ChatActionBar } from './components/ChatActionBar.vue';
export { default as ChatBubble } from './components/ChatBubble.vue';
export { default as ChatComposer } from './components/ChatComposer.vue';
export { default as ChatQueue } from './components/ChatQueue.vue';
export { default as ChatThread } from './components/ChatThread.vue';
export { default as ChartWidget } from './components/ChartWidget.vue';
export { default as CollisionWarning } from './components/CollisionWarning.vue';
export { default as ConditionalFieldRules } from './components/ConditionalFieldRules.vue';
export { default as ContextPanel } from './components/ContextPanel.vue';
export { default as ContextPanelSection } from './components/ContextPanelSection.vue';
export { default as CustomFieldRenderer } from './components/CustomFieldRenderer.vue';
export { default as EscalatedLayout } from './components/EscalatedLayout.vue';
export { default as FileDropzone } from './components/FileDropzone.vue';
export { default as FollowButton } from './components/FollowButton.vue';
export { default as KeyboardShortcutHelp } from './components/KeyboardShortcutHelp.vue';
export { default as KnowledgePanel } from './components/KnowledgePanel.vue';
export { default as KpiCard } from './components/KpiCard.vue';
export { default as MacroDropdown } from './components/MacroDropdown.vue';
export { default as PermissionMatrix } from './components/PermissionMatrix.vue';
export { default as PinnedNotes } from './components/PinnedNotes.vue';
export { default as PluginSlot } from './components/PluginSlot.vue';
export { default as PresenceIndicator } from './components/PresenceIndicator.vue';
export { default as PriorityBadge } from './components/PriorityBadge.vue';
export { default as QuickFilters } from './components/QuickFilters.vue';
export { default as ReplyComposer } from './components/ReplyComposer.vue';
export { default as ReplyThread } from './components/ReplyThread.vue';
export { default as SavedViewSidebar } from './components/SavedViewSidebar.vue';
export { default as SaveViewDialog } from './components/SaveViewDialog.vue';
export { default as SatisfactionRating } from './components/SatisfactionRating.vue';
export { default as ScheduleEditor } from './components/ScheduleEditor.vue';
export { default as SideConversation } from './components/SideConversation.vue';
export { default as SideConversationList } from './components/SideConversationList.vue';
export { default as SkillTagManager } from './components/SkillTagManager.vue';
export { default as SlaComplianceChart } from './components/SlaComplianceChart.vue';
export { default as SlaTimer } from './components/SlaTimer.vue';
export { default as StatsCard } from './components/StatsCard.vue';
export { default as StatusBadge } from './components/StatusBadge.vue';
export { default as TagSelect } from './components/TagSelect.vue';
export { default as TicketFilters } from './components/TicketFilters.vue';
export { default as TicketLinkPanel } from './components/TicketLinkPanel.vue';
export { default as TicketList } from './components/TicketList.vue';
export { default as TicketMergeDialog } from './components/TicketMergeDialog.vue';
export { default as TicketSidebar } from './components/TicketSidebar.vue';
export { default as TicketTypeSelector } from './components/TicketTypeSelector.vue';
export { default as TotpInput } from './components/TotpInput.vue';
export { default as TwoFactorSetup } from './components/TwoFactorSetup.vue';

// Composables
export { useDebouncedSearch } from './composables/useDebouncedSearch';
export { useKeyboardShortcuts } from './composables/useKeyboardShortcuts';
export { usePluginExtensions } from './composables/usePluginExtensions';
export { usePluginHooks } from './composables/usePluginHooks';
export { useChat } from './composables/useChat';
export { useRealtime } from './composables/useRealtime';

// Utilities
export { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_TYPES, TICKET_TYPE_COLORS } from './utils/constants';
export { timeAgo, slaClass } from './utils/formatting';

// Plugin authoring helper
export { defineEscalatedPlugin } from './defineEscalatedPlugin';

// Import pages
export { default as AdminImportIndex } from './pages/Admin/Import/Index.vue';
export { default as AdminImportConnect } from './pages/Admin/Import/Connect.vue';
export { default as AdminImportMapping } from './pages/Admin/Import/Mapping.vue';
export { default as AdminImportReview } from './pages/Admin/Import/Review.vue';
export { default as AdminImportProgress } from './pages/Admin/Import/Progress.vue';
