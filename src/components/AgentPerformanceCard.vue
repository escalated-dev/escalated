<script setup>
defineProps({
    agent: { type: Object, required: true },
});
</script>

<template>
    <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-5">
        <div class="mb-4 flex items-center gap-3">
            <div
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-sm font-bold text-white"
            >
                {{ agent.agent_name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div>
                <div class="text-sm font-semibold text-neutral-200">{{ agent.agent_name }}</div>
                <div class="text-xs text-neutral-500">Agent</div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg bg-white/[0.03] p-3">
                <div class="text-[11px] font-medium uppercase tracking-wider text-neutral-600">Total Tickets</div>
                <div class="mt-1 text-lg font-bold text-white">{{ agent.total_tickets }}</div>
            </div>
            <div class="rounded-lg bg-white/[0.03] p-3">
                <div class="text-[11px] font-medium uppercase tracking-wider text-neutral-600">Resolved</div>
                <div class="mt-1 text-lg font-bold text-emerald-400">{{ agent.resolved_tickets }}</div>
            </div>
            <div class="rounded-lg bg-white/[0.03] p-3">
                <div class="text-[11px] font-medium uppercase tracking-wider text-neutral-600">Avg Response</div>
                <div class="mt-1 text-lg font-bold text-white">
                    {{ agent.avg_response_hours ?? '—' }}<span class="text-xs text-neutral-500">h</span>
                </div>
            </div>
            <div class="rounded-lg bg-white/[0.03] p-3">
                <div class="text-[11px] font-medium uppercase tracking-wider text-neutral-600">Avg Resolution</div>
                <div class="mt-1 text-lg font-bold text-white">
                    {{ agent.avg_resolution_hours ?? '—' }}<span class="text-xs text-neutral-500">h</span>
                </div>
            </div>
        </div>
    </div>
</template>
