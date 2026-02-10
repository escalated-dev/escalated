// Plugin
export { EscalatedPlugin } from './plugin'

// Components
export { default as ActivityTimeline } from './components/ActivityTimeline.vue'
export { default as AssigneeSelect } from './components/AssigneeSelect.vue'
export { default as AttachmentList } from './components/AttachmentList.vue'
export { default as BulkActionBar } from './components/BulkActionBar.vue'
export { default as EscalatedLayout } from './components/EscalatedLayout.vue'
export { default as FileDropzone } from './components/FileDropzone.vue'
export { default as FollowButton } from './components/FollowButton.vue'
export { default as KeyboardShortcutHelp } from './components/KeyboardShortcutHelp.vue'
export { default as MacroDropdown } from './components/MacroDropdown.vue'
export { default as PinnedNotes } from './components/PinnedNotes.vue'
export { default as PluginSlot } from './components/PluginSlot.vue'
export { default as PresenceIndicator } from './components/PresenceIndicator.vue'
export { default as PriorityBadge } from './components/PriorityBadge.vue'
export { default as QuickFilters } from './components/QuickFilters.vue'
export { default as ReplyComposer } from './components/ReplyComposer.vue'
export { default as ReplyThread } from './components/ReplyThread.vue'
export { default as SatisfactionRating } from './components/SatisfactionRating.vue'
export { default as SlaTimer } from './components/SlaTimer.vue'
export { default as StatsCard } from './components/StatsCard.vue'
export { default as StatusBadge } from './components/StatusBadge.vue'
export { default as TagSelect } from './components/TagSelect.vue'
export { default as TicketFilters } from './components/TicketFilters.vue'
export { default as TicketList } from './components/TicketList.vue'
export { default as TicketSidebar } from './components/TicketSidebar.vue'

// Composables
export { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
export { usePluginExtensions } from './composables/usePluginExtensions'

// Plugin authoring helper
export { defineEscalatedPlugin } from './defineEscalatedPlugin'
