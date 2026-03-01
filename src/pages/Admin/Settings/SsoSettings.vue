<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({ settings: Object });

const form = useForm({
    sso_provider: props.settings.sso_provider ?? 'none',
    sso_entity_id: props.settings.sso_entity_id ?? '',
    sso_url: props.settings.sso_url ?? '',
    sso_certificate: props.settings.sso_certificate ?? '',
    sso_attr_email: props.settings.sso_attr_email ?? 'email',
    sso_attr_name: props.settings.sso_attr_name ?? 'name',
    sso_attr_role: props.settings.sso_attr_role ?? 'role',
    sso_jwt_secret: props.settings.sso_jwt_secret ?? '',
    sso_jwt_algorithm: props.settings.sso_jwt_algorithm ?? 'HS256',
});

function submit() {
    form.post(route('escalated.admin.settings.sso.update'));
}
</script>

<template>
    <EscalatedLayout title="SSO Settings">
        <form class="mx-auto max-w-2xl space-y-6" @submit.prevent="submit">
            <!-- Provider Selection -->
            <div class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6">
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Single Sign-On</h3>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >SSO Provider</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            Choose how users authenticate with your identity provider
                        </p>
                        <select
                            v-model="form.sso_provider"
                            class="mt-2 w-48 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        >
                            <option value="none">None (disabled)</option>
                            <option value="saml">SAML 2.0</option>
                            <option value="jwt">JWT</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- SAML Settings -->
            <div
                v-if="form.sso_provider === 'saml'"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            >
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">SAML Configuration</h3>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Entity ID</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            The Entity ID (Issuer) from your Identity Provider
                        </p>
                        <input
                            v-model="form.sso_entity_id"
                            type="text"
                            placeholder="https://idp.example.com/metadata"
                            class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                        <div v-if="form.errors.sso_entity_id" class="mt-1 text-sm text-rose-400">
                            {{ form.errors.sso_entity_id }}
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">SSO URL</label>
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">The Single Sign-On URL endpoint</p>
                        <input
                            v-model="form.sso_url"
                            type="url"
                            placeholder="https://idp.example.com/sso"
                            class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                        <div v-if="form.errors.sso_url" class="mt-1 text-sm text-rose-400">
                            {{ form.errors.sso_url }}
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Certificate</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            X.509 certificate from your Identity Provider (PEM format)
                        </p>
                        <textarea
                            v-model="form.sso_certificate"
                            rows="6"
                            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                            class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 font-mono text-xs text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        ></textarea>
                        <div v-if="form.errors.sso_certificate" class="mt-1 text-sm text-rose-400">
                            {{ form.errors.sso_certificate }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- JWT Settings -->
            <div
                v-if="form.sso_provider === 'jwt'"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            >
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">JWT Configuration</h3>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Shared Secret</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            Secret key used to sign and verify JWT tokens
                        </p>
                        <input
                            v-model="form.sso_jwt_secret"
                            type="password"
                            class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                        <div v-if="form.errors.sso_jwt_secret" class="mt-1 text-sm text-rose-400">
                            {{ form.errors.sso_jwt_secret }}
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Algorithm</label
                        >
                        <select
                            v-model="form.sso_jwt_algorithm"
                            class="mt-2 w-48 rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        >
                            <option value="HS256">HS256</option>
                            <option value="HS384">HS384</option>
                            <option value="HS512">HS512</option>
                            <option value="RS256">RS256</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]">SSO URL</label>
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            Redirect URL where users authenticate and receive a JWT
                        </p>
                        <input
                            v-model="form.sso_url"
                            type="url"
                            placeholder="https://auth.example.com/jwt-sso"
                            class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                    </div>
                </div>
            </div>

            <!-- Attribute Mapping -->
            <div
                v-if="form.sso_provider !== 'none'"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            >
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">Attribute Mapping</h3>
                <p class="mb-4 text-xs text-[var(--esc-panel-text-muted)]">
                    Map the attribute names from your identity provider to Escalated user fields
                </p>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Email Attribute</label
                        >
                        <input
                            v-model="form.sso_attr_email"
                            type="text"
                            placeholder="email"
                            class="mt-2 w-full max-w-sm rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Name Attribute</label
                        >
                        <input
                            v-model="form.sso_attr_name"
                            type="text"
                            placeholder="name"
                            class="mt-2 w-full max-w-sm rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Role Attribute</label
                        >
                        <input
                            v-model="form.sso_attr_role"
                            type="text"
                            placeholder="role"
                            class="mt-2 w-full max-w-sm rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                    </div>
                </div>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-end gap-3">
                <span v-if="form.recentlySuccessful" class="text-sm text-emerald-400">Saved.</span>
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-[var(--esc-panel-accent)] to-[var(--esc-panel-accent-secondary)] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--esc-panel-bg)]/20 transition-all hover:from-[var(--esc-panel-accent-hover)] hover:to-[var(--esc-panel-accent-secondary-hover)] disabled:opacity-50"
                >
                    {{ form.processing ? 'Saving...' : 'Save SSO Settings' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
