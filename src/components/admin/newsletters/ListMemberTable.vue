<template>
    <table class="list-member-table">
        <thead>
            <tr>
                <th>Contact</th>
                <th>Added</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="m in members" :key="m.id">
                <td>
                    <div>{{ m.contact.name ?? '—' }}</div>
                    <div class="list-member-table__email">{{ m.contact.email }}</div>
                </td>
                <td>{{ new Date(m.added_at).toLocaleDateString() }}</td>
                <td>
                    <button
                        type="button"
                        data-action="remove"
                        :data-contact-id="m.contact.id"
                        @click="$emit('remove', m.contact.id)"
                    >
                        Remove
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
defineProps({ members: { type: Array, required: true } });
defineEmits(['remove']);
</script>

<style scoped>
.list-member-table {
    width: 100%;
    border-collapse: collapse;
}
.list-member-table th,
.list-member-table td {
    text-align: left;
    padding: 8px 12px;
    border-bottom: 1px solid var(--escalated-border, #e2e8f0);
    font-size: 14px;
}
.list-member-table__email {
    color: var(--escalated-text-muted, #64748b);
    font-size: 12px;
}
</style>
