<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { computed } from 'vue';
import { useForm } from '@inertiajs/vue3';

const props = defineProps({
    settings: Object,
    // Read-only URLs the admin gives the identity provider:
    // {login, sp_entity_id, metadata, acs, oauth_redirect, jwt_callback}.
    endpoints: { type: Object, default: null },
});

const endpointLabels = [
    ['login', 'Sign-in URL', 'Send users here to start single sign-on.'],
    ['sp_entity_id', 'SP entity ID', 'SAML: the audience / service provider entity ID.'],
    ['metadata', 'SP metadata URL', 'SAML: service provider metadata XML.'],
    ['acs', 'Assertion Consumer Service (ACS) URL', 'SAML: where the identity provider posts the response.'],
    ['oauth_redirect', 'OAuth redirect URI', 'OAuth 2.0 / OIDC: register this as the redirect URI.'],
    ['jwt_callback', 'JWT callback URL', 'JWT: where the identity provider sends the token.'],
];

const endpointRows = computed(() =>
    endpointLabels
        .filter(([key]) => typeof props.endpoints?.[key] === 'string' && props.endpoints[key] !== '')
        .map(([key, label, hint]) => ({ key, label, hint, value: props.endpoints[key] })),
);

// Backends send a stored SSO secret as a mask (`********`). Posting the mask
// back keeps the stored value; anything else replaces it.
const isMaskedSecret = (value) => typeof value === 'string' && /^\*{3,}$/.test(value);
const jwtSecretSet = isMaskedSecret(props.settings.sso_jwt_secret);
const oauthSecretSet = isMaskedSecret(props.settings.sso_oauth_client_secret);

const form = useForm({
    sso_provider: props.settings.sso_provider ?? 'none',
    sso_entity_id: props.settings.sso_entity_id ?? '',
    sso_url: props.settings.sso_url ?? '',
    sso_login_url: props.settings.sso_login_url ?? props.settings.sso_url ?? '',
    sso_logout_url: props.settings.sso_logout_url ?? '',
    sso_metadata_url: props.settings.sso_metadata_url ?? '',
    sso_certificate: props.settings.sso_certificate ?? '',
    sso_attr_email: props.settings.sso_attr_email ?? 'email',
    sso_attr_name: props.settings.sso_attr_name ?? 'name',
    sso_attr_role: props.settings.sso_attr_role ?? 'role',
    sso_jwt_secret: props.settings.sso_jwt_secret ?? '',
    sso_jwt_algorithm: props.settings.sso_jwt_algorithm ?? 'HS256',
    sso_oauth_authorize_url: props.settings.sso_oauth_authorize_url ?? '',
    sso_oauth_token_url: props.settings.sso_oauth_token_url ?? '',
    sso_oauth_userinfo_url: props.settings.sso_oauth_userinfo_url ?? '',
    sso_oauth_client_id: props.settings.sso_oauth_client_id ?? '',
    sso_oauth_client_secret: props.settings.sso_oauth_client_secret ?? '',
    sso_oauth_scopes: props.settings.sso_oauth_scopes ?? 'openid profile email',
});

function readCertificate(event) {
    const [file] = event.target.files ?? [];
    if (!file) return;

    const reader = new window.FileReader();
    reader.onload = () => {
        form.sso_certificate = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsText(file);
}

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
                            <option value="oauth">OAuth 2.0 / OIDC</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Endpoints for the identity provider -->
            <div
                v-if="endpointRows.length"
                data-testid="sso-endpoints"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            >
                <h3 class="text-sm font-semibold text-[var(--esc-panel-text)]">Identity Provider Endpoints</h3>
                <p class="mb-5 mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                    Give these URLs to your identity provider when you register this application.
                </p>
                <div class="space-y-4">
                    <div v-for="row in endpointRows" :key="row.key">
                        <label
                            :for="`sso-endpoint-${row.key}`"
                            class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >{{ row.label }}</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">{{ row.hint }}</p>
                        <input
                            :id="`sso-endpoint-${row.key}`"
                            :value="row.value"
                            type="text"
                            readonly
                            class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 font-mono text-xs text-[var(--esc-panel-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            @focus="$event.target.select()"
                        />
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
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Login URL</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">The Single Sign-On URL endpoint</p>
                        <input
                            v-model="form.sso_login_url"
                            type="url"
                            placeholder="https://idp.example.com/sso"
                            class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                        <div v-if="form.errors.sso_login_url" class="mt-1 text-sm text-rose-400">
                            {{ form.errors.sso_login_url }}
                        </div>
                    </div>
                    <div class="grid gap-5 md:grid-cols-2">
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Logout URL</label
                            >
                            <input
                                v-model="form.sso_logout_url"
                                type="url"
                                placeholder="https://idp.example.com/logout"
                                class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                            <div v-if="form.errors.sso_logout_url" class="mt-1 text-sm text-rose-400">
                                {{ form.errors.sso_logout_url }}
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Metadata URL</label
                            >
                            <input
                                v-model="form.sso_metadata_url"
                                type="url"
                                placeholder="https://idp.example.com/metadata"
                                class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                            <div v-if="form.errors.sso_metadata_url" class="mt-1 text-sm text-rose-400">
                                {{ form.errors.sso_metadata_url }}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                            >Certificate</label
                        >
                        <p class="mt-0.5 text-xs text-[var(--esc-panel-text-muted)]">
                            X.509 certificate from your Identity Provider (PEM format)
                        </p>
                        <input
                            type="file"
                            accept=".pem,.crt,.cer,.txt"
                            class="mt-2 block text-xs text-[var(--esc-panel-text-muted)]"
                            @change="readCertificate"
                        />
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
                            autocomplete="new-password"
                            class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                        />
                        <p
                            v-if="jwtSecretSet"
                            data-testid="sso-jwt-secret-set"
                            class="mt-1 text-xs text-[var(--esc-panel-text-muted)]"
                        >
                            A secret is set. Leave it as it is to keep it, or enter a new one to replace it.
                        </p>
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
                            <option value="RS384">RS384</option>
                            <option value="RS512">RS512</option>
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

            <div
                v-if="form.sso_provider === 'oauth'"
                class="rounded-xl border border-[var(--esc-panel-border)] bg-[var(--esc-panel-surface)] p-6"
            >
                <h3 class="mb-5 text-sm font-semibold text-[var(--esc-panel-text)]">OAuth / OIDC Configuration</h3>
                <div class="space-y-5">
                    <div class="grid gap-5 md:grid-cols-2">
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Authorize URL</label
                            >
                            <input
                                v-model="form.sso_oauth_authorize_url"
                                type="url"
                                placeholder="https://idp.example.com/oauth/authorize"
                                class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                            <div v-if="form.errors.sso_oauth_authorize_url" class="mt-1 text-sm text-rose-400">
                                {{ form.errors.sso_oauth_authorize_url }}
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Token URL</label
                            >
                            <input
                                v-model="form.sso_oauth_token_url"
                                type="url"
                                placeholder="https://idp.example.com/oauth/token"
                                class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                            <div v-if="form.errors.sso_oauth_token_url" class="mt-1 text-sm text-rose-400">
                                {{ form.errors.sso_oauth_token_url }}
                            </div>
                        </div>
                    </div>
                    <div class="grid gap-5 md:grid-cols-2">
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Userinfo URL</label
                            >
                            <input
                                v-model="form.sso_oauth_userinfo_url"
                                type="url"
                                placeholder="https://idp.example.com/oauth/userinfo"
                                class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                            <div v-if="form.errors.sso_oauth_userinfo_url" class="mt-1 text-sm text-rose-400">
                                {{ form.errors.sso_oauth_userinfo_url }}
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Scopes</label
                            >
                            <input
                                v-model="form.sso_oauth_scopes"
                                type="text"
                                placeholder="openid profile email"
                                class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                        </div>
                    </div>
                    <div class="grid gap-5 md:grid-cols-2">
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Client ID</label
                            >
                            <input
                                v-model="form.sso_oauth_client_id"
                                type="text"
                                placeholder="escalated-admin"
                                class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] placeholder-[var(--esc-panel-text-muted)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                            <div v-if="form.errors.sso_oauth_client_id" class="mt-1 text-sm text-rose-400">
                                {{ form.errors.sso_oauth_client_id }}
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-[var(--esc-panel-text-secondary)]"
                                >Client Secret</label
                            >
                            <input
                                v-model="form.sso_oauth_client_secret"
                                type="password"
                                autocomplete="new-password"
                                class="mt-2 w-full rounded-lg border border-[var(--esc-panel-border-input)] bg-[var(--esc-panel-surface-alt)] px-3 py-2 text-sm text-[var(--esc-panel-text-secondary)] focus:border-[var(--esc-panel-border-input)] focus:outline-none focus:ring-1 focus:ring-[var(--esc-panel-border-input)]"
                            />
                            <p
                                v-if="oauthSecretSet"
                                data-testid="sso-oauth-secret-set"
                                class="mt-1 text-xs text-[var(--esc-panel-text-muted)]"
                            >
                                A secret is set. Leave it as it is to keep it, or enter a new one to replace it.
                            </p>
                        </div>
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
