<script setup>
import { computed } from 'vue';

const props = defineProps({
    permissions: {
        type: Object,
        required: true,
    },
    modelValue: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['update:modelValue']);

const groups = computed(() => Object.keys(props.permissions || {}));

const actions = ['view', 'create', 'edit', 'delete'];

function getPermission(group, action) {
    const perms = props.permissions[group] || [];
    return perms.find((p) => p.slug === `${group.toLowerCase()}.${action}` || p.slug.endsWith(`.${action}`));
}

function isChecked(permissionId) {
    return props.modelValue.includes(permissionId);
}

function toggle(permissionId) {
    if (!permissionId) return;
    const updated = isChecked(permissionId)
        ? props.modelValue.filter((id) => id !== permissionId)
        : [...props.modelValue, permissionId];
    emit('update:modelValue', updated);
}

function toggleGroup(group) {
    const groupPerms = (props.permissions[group] || []).map((p) => p.id);
    const allChecked = groupPerms.every((id) => props.modelValue.includes(id));

    let updated;
    if (allChecked) {
        updated = props.modelValue.filter((id) => !groupPerms.includes(id));
    } else {
        const newIds = groupPerms.filter((id) => !props.modelValue.includes(id));
        updated = [...props.modelValue, ...newIds];
    }
    emit('update:modelValue', updated);
}

function isGroupAllChecked(group) {
    const groupPerms = (props.permissions[group] || []).map((p) => p.id);
    return groupPerms.length > 0 && groupPerms.every((id) => props.modelValue.includes(id));
}
</script>

<template>
    <div class="overflow-hidden rounded-xl border border-white/[0.06] bg-neutral-900/60">
        <table class="min-w-full divide-y divide-white/[0.06]">
            <thead>
                <tr class="bg-white/[0.02]">
                    <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Group
                    </th>
                    <th
                        v-for="action in actions"
                        :key="action"
                        class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                    >
                        {{ action }}
                    </th>
                    <th
                        class="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                    >
                        All
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.04]">
                <tr v-for="group in groups" :key="group" class="transition-colors hover:bg-white/[0.03]">
                    <td class="px-4 py-3 text-sm font-medium text-neutral-200">{{ group }}</td>
                    <td v-for="action in actions" :key="action" class="px-4 py-3 text-center">
                        <template v-if="getPermission(group, action)">
                            <input
                                type="checkbox"
                                :checked="isChecked(getPermission(group, action).id)"
                                class="rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-white/10"
                                @change="toggle(getPermission(group, action).id)"
                            />
                        </template>
                        <span v-else class="text-neutral-600">-</span>
                    </td>
                    <td class="px-4 py-3 text-center">
                        <input
                            type="checkbox"
                            :checked="isGroupAllChecked(group)"
                            class="rounded border-white/20 bg-neutral-900 text-cyan-500 focus:ring-white/10"
                            @change="toggleGroup(group)"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
