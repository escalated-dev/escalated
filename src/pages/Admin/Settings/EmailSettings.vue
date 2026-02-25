<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    addresses: { type: Array, default: () => [] },
    defaultReplyAddress: { type: String, default: '' },
});

const form = useForm({
    addresses: props.addresses.map((a) => ({ ...a })),
    default_reply_address: props.defaultReplyAddress,
});

const showAddForm = ref(false);
const newAddress = ref({
    email: '',
    display_name: '',
    department_id: null,
});

function addAddress() {
    form.addresses.push({
        email: newAddress.value.email,
        display_name: newAddress.value.display_name,
        department_id: newAddress.value.department_id,
        dkim_status: 'unknown',
    });
    newAddress.value = { email: '', display_name: '', department_id: null };
    showAddForm.value = false;
}

function removeAddress(index) {
    form.addresses.splice(index, 1);
}

function submit() {
    form.post(route('escalated.admin.settings.email.update'));
}

const dkimStatusClasses = {
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    unknown: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
};
</script>

<template>
    <EscalatedLayout title="Email Channel Settings">
        <form class="mx-auto max-w-3xl space-y-6" @submit.prevent="submit">
            <!-- Email Addresses -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <div class="mb-5 flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-semibold text-white">Support Email Addresses</h3>
                        <p class="mt-0.5 text-xs text-neutral-500">
                            Configure multiple email addresses for receiving and responding to tickets
                        </p>
                    </div>
                    <button
                        type="button"
                        class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400"
                        @click="showAddForm = true"
                    >
                        Add Address
                    </button>
                </div>

                <!-- Address Table -->
                <div v-if="form.addresses.length" class="overflow-hidden rounded-lg border border-white/[0.06]">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-white/[0.06] bg-white/[0.02]">
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500"
                                >
                                    Email
                                </th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500"
                                >
                                    Display Name
                                </th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500"
                                >
                                    Department
                                </th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500"
                                >
                                    DKIM
                                </th>
                                <th
                                    class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/[0.04]">
                            <tr v-for="(addr, idx) in form.addresses" :key="idx" class="hover:bg-white/[0.02]">
                                <td class="px-4 py-3 text-sm text-neutral-200">{{ addr.email }}</td>
                                <td class="px-4 py-3 text-sm text-neutral-400">{{ addr.display_name || '---' }}</td>
                                <td class="px-4 py-3 text-sm text-neutral-400">
                                    {{ addr.department_id ? `Dept #${addr.department_id}` : 'All' }}
                                </td>
                                <td class="px-4 py-3">
                                    <span
                                        :class="[
                                            'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                                            dkimStatusClasses[addr.dkim_status] || dkimStatusClasses.unknown,
                                        ]"
                                    >
                                        {{ addr.dkim_status || 'Unknown' }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        class="text-sm text-red-500/60 hover:text-red-400"
                                        @click="removeAddress(idx)"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="rounded-lg border border-dashed border-white/[0.08] px-6 py-8 text-center">
                    <p class="text-sm text-neutral-500">No email addresses configured yet.</p>
                </div>

                <!-- Add Address Form -->
                <div v-if="showAddForm" class="mt-4 rounded-lg border border-white/[0.06] bg-neutral-950 p-4">
                    <h4 class="mb-3 text-sm font-medium text-neutral-200">Add Email Address</h4>
                    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label class="block text-xs font-medium text-neutral-400">Email Address</label>
                            <input
                                v-model="newAddress.email"
                                type="email"
                                placeholder="support@example.com"
                                class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                            />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-neutral-400">Display Name</label>
                            <input
                                v-model="newAddress.display_name"
                                type="text"
                                placeholder="Support Team"
                                class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                            />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-neutral-400">Department Routing</label>
                            <input
                                v-model.number="newAddress.department_id"
                                type="number"
                                placeholder="All departments"
                                class="mt-1 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                            />
                        </div>
                    </div>
                    <div class="mt-3 flex gap-2">
                        <button
                            type="button"
                            class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-1.5 text-sm font-medium text-white"
                            :disabled="!newAddress.email"
                            @click="addAddress"
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            class="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-neutral-400 hover:text-neutral-200"
                            @click="showAddForm = false"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <!-- Default Reply Address -->
            <div class="rounded-xl border border-white/[0.06] bg-neutral-900/60 p-6">
                <h3 class="mb-5 text-sm font-semibold text-white">Default Reply Address</h3>
                <p class="mb-3 text-xs text-neutral-500">Select the default email address for outbound replies</p>
                <select
                    v-model="form.default_reply_address"
                    class="w-full max-w-sm rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
                >
                    <option value="">Select an address...</option>
                    <option v-for="(addr, idx) in form.addresses" :key="idx" :value="addr.email">
                        {{ addr.display_name ? `${addr.display_name} <${addr.email}>` : addr.email }}
                    </option>
                </select>
            </div>

            <!-- Submit -->
            <div class="flex items-center justify-end gap-3">
                <span v-if="form.recentlySuccessful" class="text-sm text-emerald-400">Saved.</span>
                <button
                    type="submit"
                    :disabled="form.processing"
                    class="rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-black/20 transition-all hover:from-cyan-400 hover:to-violet-400 disabled:opacity-50"
                >
                    {{ form.processing ? 'Saving...' : 'Save Email Settings' }}
                </button>
            </div>
        </form>
    </EscalatedLayout>
</template>
