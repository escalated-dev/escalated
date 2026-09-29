<script setup>
import EscalatedLayout from '../../components/EscalatedLayout.vue';
import FileDropzone from '../../components/FileDropzone.vue';
import GuestEmailCode from '../../components/GuestEmailCode.vue';
import { useGuestVerification } from '../../composables/useGuestVerification';
import { guestRequest } from '../../utils/guestRequests';
import { useForm, usePage, Link } from '@inertiajs/vue3';
import { reactive, ref, watch } from 'vue';

const props = defineProps({
    departments: Array,
    priorities: Array,
    verification_url: { type: String, default: null },
    lookup_url: { type: String, default: null },
});

const form = useForm({
    guest_name: '',
    guest_email: '',
    subject: '',
    description: '',
    priority: 'medium',
    department_id: '',
    attachments: [],
    verification_id: '',
    verification_code: '',
});

const page = usePage();
const context = () => `${props.verification_url}|${page.props.escalated?.broadcast_channel_prefix || ''}`;
const requestCode = (email, purpose) => guestRequest(props.verification_url, { email, purpose });
const verification = useGuestVerification(() => form.guest_email, 'ticket', requestCode, context);
const lookup = reactive({ email: '', reference: '', pending: false, error: '', searched: false });
const matches = ref([]);
watch(
    () => `${lookup.email}|${lookup.reference}`,
    () => {
        matches.value = [];
        lookup.searched = false;
    },
);
const lookupVerification = useGuestVerification(() => lookup.email, 'lookup', requestCode, context);
watch(context, () => {
    form.cancel();
    form.reset();
    Object.assign(lookup, { email: '', reference: '', pending: false, error: '', searched: false });
    matches.value = [];
});

async function submit() {
    if (props.verification_url) {
        if (!(await verification.ready())) return;
        Object.assign(form, verification.fields());
    }
    form.post(route('escalated.guest.tickets.store'), { onSuccess: () => verification.reset() });
}

async function findTickets() {
    lookup.error = '';
    if (!(await lookupVerification.ready())) return;
    lookup.pending = true;
    const current = context();
    const email = lookup.email;
    const reference = lookup.reference;
    try {
        const data = await guestRequest(props.lookup_url, {
            email,
            reference: lookup.reference,
            ...lookupVerification.fields(),
        });
        if (current !== context() || email !== lookup.email || reference !== lookup.reference) return;
        matches.value = data.data || [];
        lookup.searched = true;
        lookupVerification.reset();
    } catch (error) {
        if (current === context() && email === lookup.email) lookup.error = error.message;
    } finally {
        if (current === context()) lookup.pending = false;
    }
}
</script>

<template>
    <EscalatedLayout title="Submit a Ticket">
        <div class="mx-auto max-w-2xl">
            <div class="mb-6 text-center">
                <h1 class="text-xl font-semibold text-gray-900">Submit a Support Ticket</h1>
                <p class="mt-1 text-sm text-gray-500">
                    {{
                        verification_url
                            ? 'No account needed. Verify your email to submit a ticket and receive a private link.'
                            : "No account needed. We'll give you a link to track your ticket."
                    }}
                </p>
                <Link :href="route('login')" class="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-700">
                    Already have an account? Sign in
                </Link>
            </div>

            <form class="space-y-5 rounded-lg border border-gray-200 bg-white p-6" @submit.prevent="submit">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Your Name</label>
                        <input
                            v-model="form.guest_name"
                            type="text"
                            required
                            class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <div v-if="form.errors.guest_name" class="mt-1 text-sm text-red-600">
                            {{ form.errors.guest_name }}
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            v-model="form.guest_email"
                            type="email"
                            required
                            class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <div v-if="form.errors.guest_email" class="mt-1 text-sm text-red-600">
                            {{ form.errors.guest_email }}
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                        v-model="form.subject"
                        type="text"
                        required
                        class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <div v-if="form.errors.subject" class="mt-1 text-sm text-red-600">{{ form.errors.subject }}</div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        v-model="form.description"
                        rows="6"
                        required
                        class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    ></textarea>
                    <div v-if="form.errors.description" class="mt-1 text-sm text-red-600">
                        {{ form.errors.description }}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Priority</label>
                        <select v-model="form.priority" class="mt-1 w-full rounded-lg border-gray-300 shadow-sm">
                            <option v-for="p in priorities" :key="p" :value="p" class="capitalize">{{ p }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Department</label>
                        <select v-model="form.department_id" class="mt-1 w-full rounded-lg border-gray-300 shadow-sm">
                            <option value="">General</option>
                            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                    <FileDropzone v-model="form.attachments" />
                </div>

                <GuestEmailCode
                    v-if="verification_url"
                    :verification="verification"
                    @code="verification.state.code = $event"
                />
                <p
                    v-if="form.errors.verification_code || form.errors.verification_id"
                    class="text-sm text-red-600"
                    role="alert"
                >
                    {{ form.errors.verification_code || form.errors.verification_id }}
                </p>
                <div class="flex justify-end">
                    <button
                        type="submit"
                        :disabled="form.processing || verification.state.pending"
                        class="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {{
                            form.processing
                                ? 'Submitting...'
                                : verification_url && !verification.state.id
                                  ? 'Send verification code'
                                  : 'Submit Ticket'
                        }}
                    </button>
                </div>
            </form>

            <form
                v-if="lookup_url"
                class="mt-8 space-y-4 rounded-lg border border-gray-200 bg-white p-6"
                @submit.prevent="findTickets"
            >
                <h2 class="text-lg font-semibold">Find a ticket or renew your link</h2>
                <label class="block text-sm"
                    >Email address
                    <input
                        v-model="lookup.email"
                        type="email"
                        required
                        class="mt-1 block w-full rounded-lg border-gray-300"
                    />
                </label>
                <label class="block text-sm"
                    >Tracking or ticket reference
                    <input
                        v-model="lookup.reference"
                        type="text"
                        maxlength="255"
                        required
                        class="mt-1 block w-full rounded-lg border-gray-300"
                    />
                </label>
                <GuestEmailCode :verification="lookupVerification" @code="lookupVerification.state.code = $event" />
                <p v-if="lookup.error" class="text-sm text-red-600" role="alert">{{ lookup.error }}</p>
                <button
                    type="submit"
                    :disabled="lookup.pending || lookupVerification.state.pending"
                    class="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                    {{ lookupVerification.state.id ? 'Find tickets' : 'Send verification code' }}
                </button>
                <p v-if="lookup.searched && !matches.length" class="text-sm">
                    No tickets matched that reference and email.
                </p>
                <ul v-if="matches.length" class="space-y-2">
                    <li v-for="match in matches" :key="match.reference">
                        <a
                            :href="route('escalated.guest.tickets.show', match.guest_access_token)"
                            class="text-indigo-600 underline"
                            >{{ match.reference }}: {{ match.subject }}</a
                        >
                    </li>
                </ul>
            </form>
        </div>
    </EscalatedLayout>
</template>
