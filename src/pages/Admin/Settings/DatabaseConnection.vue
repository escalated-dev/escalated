<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm, router } from '@inertiajs/vue3';
import { computed, ref } from 'vue';

/**
 * Which database Escalated's own tables live on.
 *
 * Two things about this screen are deliberate and worth not undoing.
 *
 * It refuses a switch to a database with no Escalated tables. That case does
 * not error at runtime — the panel simply comes up with no tickets, no
 * departments and no settings, which reads exactly like data loss. The server
 * refuses it, and the option is disabled here so the mistake is hard to make
 * in the first place.
 *
 * And when `escalated.connection` is set in config or .env, the whole form is
 * read-only. That value is deployed infrastructure; a web form must not be
 * able to quietly disagree with it.
 */
const props = defineProps({
    connections: { type: Array, default: () => [] },
    current: { type: String, default: null },
    hostDefault: { type: String, default: null },
    pinnedByConfig: { type: Boolean, default: false },
    tablePrefix: { type: String, default: 'escalated_' },
});

const form = useForm({
    connection: props.current ?? '',
});

const testing = ref(null);

const active = computed(() => props.connections.find((c) => c.is_current) ?? null);

const selected = computed(
    () => props.connections.find((c) => c.name === (form.connection || props.hostDefault)) ?? null,
);

const isChanging = computed(() => (form.connection || null) !== (props.current || null));

function submit() {
    if (props.pinnedByConfig) return;
    form.post(route('escalated.admin.settings.database.update'), { preserveScroll: true });
}

function test(name) {
    testing.value = name;

    router.post(
        route('escalated.admin.settings.database.test'),
        { connection: name },
        {
            preserveScroll: true,
            preserveState: false,
            onFinish: () => {
                testing.value = null;
            },
        },
    );
}

function statusLabel(connection) {
    if (!connection.reachable) return 'Unreachable';
    if (!connection.migrated) return 'Not migrated';
    return 'Ready';
}

function statusClass(connection) {
    if (!connection.reachable) return 'text-[var(--esc-danger)]';
    if (!connection.migrated) return 'text-[var(--esc-warning)]';
    return 'text-[var(--esc-success)]';
}

function formatCount(value) {
    return value === null || value === undefined ? null : value.toLocaleString();
}
</script>

<template>
    <EscalatedLayout title="Database Connection">
        <div class="mx-auto max-w-3xl space-y-6">
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-1 text-sm font-semibold text-[var(--esc-panel-text)]">Current connection</h3>
                <p class="mb-5 text-xs text-[var(--esc-panel-text-muted)]">
                    Where Escalated's own tables (<code>{{ tablePrefix }}*</code>) are read and written. Your users
                    table is not affected — it stays wherever your application keeps it.
                </p>

                <dl v-if="active" class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <dt class="text-[var(--esc-panel-text-muted)]">Connection</dt>
                    <dd class="font-medium text-[var(--esc-panel-text)]">
                        {{ active.name }}
                        <span v-if="active.is_host_default" class="text-xs text-[var(--esc-panel-text-muted)]">
                            (application default)
                        </span>
                    </dd>

                    <dt class="text-[var(--esc-panel-text-muted)]">Driver</dt>
                    <dd class="text-[var(--esc-panel-text-secondary)]">{{ active.driver ?? '—' }}</dd>

                    <dt class="text-[var(--esc-panel-text-muted)]">Database</dt>
                    <dd class="break-all text-[var(--esc-panel-text-secondary)]">{{ active.database ?? '—' }}</dd>

                    <dt class="text-[var(--esc-panel-text-muted)]">Tickets stored</dt>
                    <dd class="text-[var(--esc-panel-text-secondary)]">
                        {{ formatCount(active.ticket_count) ?? '—' }}
                    </dd>
                </dl>
            </div>

            <div
                v-if="pinnedByConfig"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)] p-4 text-sm text-[var(--esc-panel-text-secondary)]"
            >
                This connection is set in your application config (<code>escalated.connection</code> /
                <code>ESCALATED_DB_CONNECTION</code>) and cannot be changed from here. Edit it where it is deployed, so
                the panel and your configuration cannot disagree.
            </div>

            <form v-else class="space-y-6" @submit.prevent="submit">
                <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                    <h3 class="mb-1 text-sm font-semibold text-[var(--esc-panel-text)]">Change connection</h3>
                    <p class="mb-5 text-xs text-[var(--esc-panel-text-muted)]">
                        Only connections already carrying Escalated's tables can be selected. Run the package migrations
                        against a database before pointing Escalated at it.
                    </p>

                    <div class="space-y-2">
                        <label
                            v-for="connection in connections"
                            :key="connection.name"
                            :class="[
                                'flex items-start gap-3 rounded-lg border p-3 transition',
                                connection.migrated
                                    ? 'cursor-pointer border-[var(--esc-panel-border)] hover:bg-[var(--esc-panel-surface-alt)]'
                                    : 'cursor-not-allowed border-[var(--esc-panel-border)] opacity-60',
                            ]"
                        >
                            <input
                                v-model="form.connection"
                                type="radio"
                                :value="connection.is_host_default ? '' : connection.name"
                                :disabled="!connection.migrated"
                                class="mt-1"
                            />
                            <span class="min-w-0 flex-1">
                                <span class="flex flex-wrap items-center gap-2">
                                    <span class="text-sm font-medium text-[var(--esc-panel-text)]">
                                        {{ connection.name }}
                                    </span>
                                    <span
                                        v-if="connection.is_host_default"
                                        class="text-xs text-[var(--esc-panel-text-muted)]"
                                    >
                                        application default
                                    </span>
                                    <span :class="['text-xs font-medium', statusClass(connection)]">
                                        {{ statusLabel(connection) }}
                                    </span>
                                </span>
                                <span class="mt-0.5 block text-xs text-[var(--esc-panel-text-muted)]">
                                    {{ connection.driver ?? 'unknown driver' }} ·
                                    {{ connection.database ?? 'no database configured' }}
                                    <template v-if="connection.ticket_count !== null">
                                        · {{ formatCount(connection.ticket_count) }} tickets
                                    </template>
                                </span>
                                <span
                                    v-if="connection.error"
                                    class="mt-1 block break-all text-xs text-[var(--esc-danger)]"
                                >
                                    {{ connection.error }}
                                </span>
                                <span
                                    v-else-if="!connection.migrated"
                                    class="mt-1 block text-xs text-[var(--esc-panel-text-muted)]"
                                >
                                    No Escalated tables here yet. Switching would show an empty panel, so it is
                                    disabled.
                                </span>
                            </span>
                            <button
                                type="button"
                                class="shrink-0 rounded-md border border-[var(--esc-panel-border-input)] px-2 py-1 text-xs text-[var(--esc-panel-text-secondary)]"
                                :disabled="testing === connection.name"
                                @click.prevent="test(connection.name)"
                            >
                                {{ testing === connection.name ? 'Testing…' : 'Test' }}
                            </button>
                        </label>
                    </div>

                    <p v-if="form.errors.connection" class="mt-3 text-xs text-[var(--esc-danger)]">
                        {{ form.errors.connection }}
                    </p>
                </div>

                <div
                    v-if="isChanging"
                    class="rounded-xl border border-[var(--esc-warning)] bg-[var(--esc-panel-surface-alt)] p-4 text-sm text-[var(--esc-panel-text-secondary)]"
                >
                    <p class="font-medium text-[var(--esc-panel-text)]">This does not move any data.</p>
                    <p class="mt-1 text-xs">
                        Escalated will start reading and writing
                        <strong>{{ selected?.name ?? hostDefault }}</strong
                        >, which currently holds
                        <strong>{{ formatCount(selected?.ticket_count) ?? 'an unknown number of' }}</strong> tickets.
                        The <strong>{{ formatCount(active?.ticket_count) ?? 'existing' }}</strong> tickets on
                        <strong>{{ active?.name }}</strong> stay where they are and will no longer be visible in the
                        panel.
                    </p>
                </div>

                <div class="flex justify-end">
                    <button
                        type="submit"
                        :disabled="form.processing || !isChanging"
                        class="rounded-lg bg-[var(--esc-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {{ form.processing ? 'Saving…' : 'Use this connection' }}
                    </button>
                </div>
            </form>
        </div>
    </EscalatedLayout>
</template>
