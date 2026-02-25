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
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-5 text-sm font-semibold text-white">Single Sign-On</h3>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">SSO Provider</label>
                        <p class="mt-0.5 text-xs text-neutral-500">
                            Choose how users authenticate with your identity provider
                        </p>
                        <select
                            v-model="form.sso_provider"
                            class="mt-2 w-48 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
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
                class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6"
            >
                <h3 class="mb-5 text-sm font-semibold text-white">SAML Configuration</h3>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Entity ID</label>
                        <p class="mt-0.5 text-xs text-neutral-500">
                            The Entity ID (Issuer) from your Identity Provider
                        </p>
                        <input
                            v-model="form.sso_entity_id"
                            type="text"
                            placeholder="https://idp.example.com/metadata"
                            class="mt-2 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                        <div v-if="form.errors.sso_entity_id" class="mt-1 text-sm text-rose-400">
                            {{ form.errors.sso_entity_id }}
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">SSO URL</label>
                        <p class="mt-0.5 text-xs text-neutral-500">The Single Sign-On URL endpoint</p>
                        <input
                            v-model="form.sso_url"
                            type="url"
                            placeholder="https://idp.example.com/sso"
                            class="mt-2 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                        <div v-if="form.errors.sso_url" class="mt-1 text-sm text-rose-400">
                            {{ form.errors.sso_url }}
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Certificate</label>
                        <p class="mt-0.5 text-xs text-neutral-500">
                            X.509 certificate from your Identity Provider (PEM format)
                        </p>
                        <textarea
                            v-model="form.sso_certificate"
                            rows="6"
                            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                            class="mt-2 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 font-mono text-xs text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        ></textarea>
                        <div v-if="form.errors.sso_certificate" class="mt-1 text-sm text-rose-400">
                            {{ form.errors.sso_certificate }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- JWT Settings -->
            <div v-if="form.sso_provider === 'jwt'" class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-5 text-sm font-semibold text-white">JWT Configuration</h3>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Shared Secret</label>
                        <p class="mt-0.5 text-xs text-neutral-500">Secret key used to sign and verify JWT tokens</p>
                        <input
                            v-model="form.sso_jwt_secret"
                            type="password"
                            class="mt-2 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                        <div v-if="form.errors.sso_jwt_secret" class="mt-1 text-sm text-rose-400">
                            {{ form.errors.sso_jwt_secret }}
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Algorithm</label>
                        <select
                            v-model="form.sso_jwt_algorithm"
                            class="mt-2 w-48 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        >
                            <option value="HS256">HS256</option>
                            <option value="HS384">HS384</option>
                            <option value="HS512">HS512</option>
                            <option value="RS256">RS256</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">SSO URL</label>
                        <p class="mt-0.5 text-xs text-neutral-500">
                            Redirect URL where users authenticate and receive a JWT
                        </p>
                        <input
                            v-model="form.sso_url"
                            type="url"
                            placeholder="https://auth.example.com/jwt-sso"
                            class="mt-2 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                    </div>
                </div>
            </div>

            <!-- Attribute Mapping -->
            <div
                v-if="form.sso_provider !== 'none'"
                class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6"
            >
                <h3 class="mb-5 text-sm font-semibold text-white">Attribute Mapping</h3>
                <p class="mb-4 text-xs text-neutral-500">
                    Map the attribute names from your identity provider to Escalated user fields
                </p>
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Email Attribute</label>
                        <input
                            v-model="form.sso_attr_email"
                            type="text"
                            placeholder="email"
                            class="mt-2 w-full max-w-sm rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Name Attribute</label>
                        <input
                            v-model="form.sso_attr_name"
                            type="text"
                            placeholder="name"
                            class="mt-2 w-full max-w-sm rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-neutral-200">Role Attribute</label>
                        <input
                            v-model="form.sso_attr_role"
                            type="text"
                            placeholder="role"
                            class="mt-2 w-full max-w-sm rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
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
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50"
                >
                    {{ form.processing ? 'Saving...' : 'Save SSO Settings' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
