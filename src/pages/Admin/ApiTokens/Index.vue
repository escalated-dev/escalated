<script setup>
import { ref, computed, inject } from 'vue';
import { useForm, usePage } from '@inertiajs/vue3';
import EscalatedLayout from '../../../components/EscalatedLayout.vue';

const props = defineProps({
    tokens: Array,
    users: Array,
    api_enabled: Boolean,
});

const dark = inject(
    'esc-dark',
    computed(() => true),
);
const page = usePage();
const prefix = computed(() => {
    const p = page.props.escalated?.prefix || 'support';
    return p.startsWith('/') ? p : `/${p}`;
});

const showCreate = ref(false);
const copiedToken = ref(null);

const form = useForm({
    name: '',
    user_id: '',
    abilities: ['agent'],
    expires_in_days: null,
});

function createToken() {
    form.post(`${prefix.value}/admin/api-tokens`, {
        preserveScroll: true,
        onSuccess: (page) => {
            const flash = page.props.flash || {};
            if (flash.plain_text_token) {
                copiedToken.value = flash.plain_text_token;
            }
            form.reset();
            showCreate.value = false;
        },
    });
}

function revokeToken(id) {
    if (!confirm('Are you sure you want to revoke this token? This cannot be undone.')) return;
    useForm({}).delete(`${prefix.value}/admin/api-tokens/${id}`, { preserveScroll: true });
}

function copyToken() {
    if (copiedToken.value) {
        navigator.clipboard.writeText(copiedToken.value);
    }
}

function dismissToken() {
    copiedToken.value = null;
}

function toggleAbility(ability) {
    const idx = form.abilities.indexOf(ability);
    if (idx >= 0) {
        form.abilities.splice(idx, 1);
    } else {
        form.abilities.push(ability);
    }
}

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
</script>

<template>
    <EscalatedLayout title="API Tokens">
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 :class="dark ? 'text-[var(--esc-panel-text)]' : 'text-gray-900'" class="text-lg font-semibold">
                        API Tokens
                    </h2>
                    <p :class="dark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-500'" class="mt-1 text-sm">
                        Manage API tokens for desktop apps and external integrations.
                    </p>
                </div>
                <button
                    :class="
                        dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-gray-900 text-white hover:bg-gray-800'
                    "
                    class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    @click="showCreate = true"
                >
                    Create Token
                </button>
            </div>

            <!-- Not enabled warning -->
            <div
                v-if="!api_enabled"
                :class="
                    dark
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                        : 'border-amber-300 bg-amber-50 text-amber-800'
                "
                class="rounded-lg border p-4 text-sm"
            >
                The REST API is currently disabled. Set <code class="font-mono">ESCALATED_API_ENABLED=true</code> in
                your .env to enable it.
            </div>

            <!-- Copied token modal -->
            <div
                v-if="copiedToken"
                :class="dark ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-emerald-300 bg-emerald-50'"
                class="rounded-lg border p-4"
            >
                <p :class="dark ? 'text-emerald-300' : 'text-emerald-800'" class="text-sm font-medium">
                    Token created! Copy it now — it won't be shown again.
                </p>
                <div class="mt-2 flex items-center gap-2">
                    <code
                        :class="dark ? 'bg-black text-emerald-400' : 'bg-white text-emerald-700'"
                        class="flex-1 rounded border px-3 py-2 text-xs font-mono break-all"
                        :style="dark ? 'border-color: rgba(255,255,255,0.1)' : ''"
                        >{{ copiedToken }}</code
                    >
                    <button
                        :class="
                            dark
                                ? 'bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text)] hover:bg-[var(--esc-panel-active)]'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        "
                        class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                        @click="copyToken"
                    >
                        Copy
                    </button>
                    <button
                        :class="
                            dark
                                ? 'text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text)]'
                                : 'text-gray-400 hover:text-gray-600'
                        "
                        class="px-2 py-2 text-sm transition-colors"
                        @click="dismissToken"
                    >
                        Dismiss
                    </button>
                </div>
            </div>

            <!-- Create form -->
            <div
                v-if="showCreate"
                :class="
                    dark
                        ? 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface-alt)]'
                        : 'border-gray-200 bg-white'
                "
                class="rounded-lg border p-5 space-y-4"
            >
                <h3 :class="dark ? 'text-[var(--esc-panel-text)]' : 'text-gray-900'" class="text-sm font-semibold">
                    New API Token
                </h3>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            :class="dark ? 'text-[var(--esc-panel-text-tertiary)]' : 'text-gray-600'"
                            class="mb-1 block text-xs font-medium"
                            >Token Name</label
                        >
                        <input
                            v-model="form.name"
                            type="text"
                            placeholder="e.g. Desktop App - Work Laptop"
                            :class="
                                dark
                                    ? 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text)]'
                                    : 'border-gray-300 bg-white text-gray-900'
                            "
                            class="w-full rounded-lg border px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label
                            :class="dark ? 'text-[var(--esc-panel-text-tertiary)]' : 'text-gray-600'"
                            class="mb-1 block text-xs font-medium"
                            >User</label
                        >
                        <select
                            v-model="form.user_id"
                            :class="
                                dark
                                    ? 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text)]'
                                    : 'border-gray-300 bg-white text-gray-900'
                            "
                            class="w-full rounded-lg border px-3 py-2 text-sm"
                        >
                            <option value="">Select user...</option>
                            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label
                        :class="dark ? 'text-[var(--esc-panel-text-tertiary)]' : 'text-gray-600'"
                        class="mb-1 block text-xs font-medium"
                        >Abilities</label
                    >
                    <div class="flex items-center gap-3">
                        <label
                            v-for="ability in ['agent', 'admin']"
                            :key="ability"
                            :class="dark ? 'text-[var(--esc-panel-text-secondary)]' : 'text-gray-700'"
                            class="flex items-center gap-1.5 text-sm cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                :checked="form.abilities.includes(ability)"
                                class="rounded border-neutral-600"
                                @change="toggleAbility(ability)"
                            />
                            {{ ability }}
                        </label>
                    </div>
                </div>

                <div>
                    <label
                        :class="dark ? 'text-[var(--esc-panel-text-tertiary)]' : 'text-gray-600'"
                        class="mb-1 block text-xs font-medium"
                        >Expires In (days)</label
                    >
                    <input
                        v-model.number="form.expires_in_days"
                        type="number"
                        min="1"
                        max="365"
                        placeholder="Leave empty for no expiration"
                        :class="
                            dark
                                ? 'border-[var(--esc-panel-border)] bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text)]'
                                : 'border-gray-300 bg-white text-gray-900'
                        "
                        class="w-48 rounded-lg border px-3 py-2 text-sm"
                    />
                </div>

                <div class="flex items-center gap-3 pt-2">
                    <button
                        :disabled="form.processing || !form.name || !form.user_id"
                        :class="
                            dark
                                ? 'bg-white text-black hover:bg-neutral-200 disabled:bg-[var(--esc-panel-text-muted)] disabled:text-[var(--esc-panel-text-muted)]'
                                : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500'
                        "
                        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                        @click="createToken"
                    >
                        {{ form.processing ? 'Creating...' : 'Create Token' }}
                    </button>
                    <button
                        :class="
                            dark
                                ? 'text-[var(--esc-panel-text-muted)] hover:text-[var(--esc-panel-text)]'
                                : 'text-gray-500 hover:text-gray-900'
                        "
                        class="text-sm transition-colors"
                        @click="showCreate = false"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <!-- Tokens table -->
            <div
                :class="dark ? 'border-[var(--esc-panel-border)]' : 'border-gray-200'"
                class="overflow-hidden rounded-lg border"
            >
                <table class="w-full text-sm">
                    <thead
                        :class="
                            dark
                                ? 'bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-muted)]'
                                : 'bg-gray-50 text-gray-500'
                        "
                    >
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase">Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase">User</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase">Abilities</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase">Last Used</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase">Expires</th>
                            <th class="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody :class="dark ? 'divide-[var(--esc-panel-border)]' : 'divide-gray-100'" class="divide-y">
                        <tr
                            v-for="token in tokens"
                            :key="token.id"
                            :class="[
                                dark ? 'hover:bg-[var(--esc-panel-hover)]' : 'hover:bg-gray-50',
                                token.is_expired ? 'opacity-50' : '',
                            ]"
                        >
                            <td
                                :class="dark ? 'text-[var(--esc-panel-text)]' : 'text-gray-900'"
                                class="px-4 py-3 font-medium"
                            >
                                {{ token.name }}
                            </td>
                            <td
                                :class="dark ? 'text-[var(--esc-panel-text-tertiary)]' : 'text-gray-600'"
                                class="px-4 py-3"
                            >
                                {{ token.user_name }}
                            </td>
                            <td class="px-4 py-3">
                                <span
                                    v-for="a in token.abilities || []"
                                    :key="a"
                                    :class="
                                        dark
                                            ? 'bg-[var(--esc-panel-hover)] text-[var(--esc-panel-text-secondary)]'
                                            : 'bg-gray-100 text-gray-700'
                                    "
                                    class="mr-1 rounded px-1.5 py-0.5 text-xs"
                                    >{{ a }}</span
                                >
                            </td>
                            <td
                                :class="dark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-500'"
                                class="px-4 py-3 text-xs"
                            >
                                <template v-if="token.last_used_at">{{ formatDate(token.last_used_at) }}</template>
                                <template v-else>Never</template>
                            </td>
                            <td
                                :class="dark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-500'"
                                class="px-4 py-3 text-xs"
                            >
                                <span v-if="token.is_expired" class="text-rose-400">Expired</span>
                                <template v-else-if="token.expires_at">{{ formatDate(token.expires_at) }}</template>
                                <template v-else>Never</template>
                            </td>
                            <td class="px-4 py-3 text-right">
                                <button
                                    class="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                                    @click="revokeToken(token.id)"
                                >
                                    Revoke
                                </button>
                            </td>
                        </tr>
                        <tr v-if="!tokens.length">
                            <td
                                colspan="6"
                                :class="dark ? 'text-[var(--esc-panel-text-muted)]' : 'text-gray-400'"
                                class="px-4 py-8 text-center text-sm"
                            >
                                No API tokens created yet.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </EscalatedLayout>
</template>
