<script setup>
import { ref, computed, inject, nextTick } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    savedViews: { type: Array, default: () => [] },
    currentFilters: { type: Object, default: () => ({}) },
    route: { type: String, required: true },
});

const emit = defineEmits(['apply-view']);
const escDark = inject(
    'esc-dark',
    computed(() => false),
);

const activeViewId = ref(null);
const menuOpenId = ref(null);
const editingView = ref(null);
const editName = ref('');

function applyView(view) {
    if (view === null) {
        activeViewId.value = null;
        emit('apply-view', {});
        router.get(props.route, {}, { preserveState: true, preserveScroll: true });
        return;
    }
    activeViewId.value = view.id;
    emit('apply-view', view.filters);
    router.get(props.route, view.filters || {}, { preserveState: true, preserveScroll: true });
}

function toggleMenu(viewId) {
    menuOpenId.value = menuOpenId.value === viewId ? null : viewId;
}

function startEdit(view) {
    editingView.value = view.id;
    editName.value = view.name;
    menuOpenId.value = null;
    nextTick(() => {
        const input = document.querySelector(`[data-edit-view="${view.id}"]`);
        if (input) input.focus();
    });
}

function saveEdit(view) {
    if (!editName.value.trim()) {
        editingView.value = null;
        return;
    }
    fetch(route('escalated.admin.saved-views.update', view.id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ name: editName.value, filters: view.filters }),
    }).then(() => {
        view.name = editName.value;
        editingView.value = null;
    });
}

function updateViewFilters(view) {
    menuOpenId.value = null;
    const nonEmptyFilters = {};
    for (const [key, value] of Object.entries(props.currentFilters)) {
        if (value !== '' && value !== null && value !== undefined) {
            nonEmptyFilters[key] = value;
        }
    }
    fetch(route('escalated.admin.saved-views.update', view.id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ name: view.name, filters: nonEmptyFilters }),
    }).then(() => {
        view.filters = nonEmptyFilters;
        router.reload({ only: ['savedViews'] });
    });
}

function deleteView(view) {
    menuOpenId.value = null;
    if (!confirm(`Delete view "${view.name}"?`)) return;
    fetch(route('escalated.admin.saved-views.destroy', view.id), {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    }).then(() => {
        if (activeViewId.value === view.id) {
            activeViewId.value = null;
        }
        router.reload({ only: ['savedViews'] });
    });
}

const itemClass = computed(
    () => (isActive) =>
        [
            'flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors group',
            isActive
                ? escDark.value
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'bg-blue-50 text-blue-700 font-medium'
                : escDark.value
                  ? 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        ].flat(),
);
</script>

<template>
    <div class="space-y-1">
        <div :class="itemClass(activeViewId === null)" @click="applyView(null)">
            <span class="truncate">All Tickets</span>
        </div>

        <div v-for="view in savedViews" :key="view.id" class="relative">
            <div v-if="editingView === view.id" class="flex items-center gap-1 px-1">
                <input
                    v-model="editName"
                    :data-edit-view="view.id"
                    type="text"
                    class="flex-1 rounded border px-2 py-1 text-sm"
                    :class="
                        escDark
                            ? 'border-white/10 bg-white/5 text-neutral-200'
                            : 'border-gray-300 bg-white text-gray-900'
                    "
                    @keydown.enter="saveEdit(view)"
                    @keydown.escape="editingView = null"
                    @blur="saveEdit(view)"
                />
            </div>
            <div v-else :class="itemClass(activeViewId === view.id)" @click="applyView(view)">
                <span class="flex items-center gap-2 truncate">
                    <span
                        v-if="view.color"
                        class="inline-block h-2 w-2 shrink-0 rounded-full"
                        :style="{ backgroundColor: view.color }"
                    ></span>
                    <span class="truncate">{{ view.name }}</span>
                    <span
                        v-if="view.is_shared"
                        :class="[
                            'shrink-0 rounded px-1 py-0.5 text-[10px] leading-none font-medium',
                            escDark ? 'bg-white/[0.06] text-neutral-500' : 'bg-gray-100 text-gray-400',
                        ]"
                        >shared</span
                    >
                </span>
                <button
                    aria-label="View options"
                    class="shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                    :class="escDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'"
                    @click.stop="toggleMenu(view.id)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"
                        />
                    </svg>
                </button>
            </div>

            <!-- Kebab menu -->
            <div
                v-if="menuOpenId === view.id"
                class="absolute right-0 z-20 mt-1 w-44 rounded-md border py-1 shadow-lg"
                :class="escDark ? 'border-white/10 bg-[var(--esc-panel-surface)]' : 'border-gray-200 bg-white'"
            >
                <button
                    class="block w-full px-3 py-1.5 text-left text-sm"
                    :class="escDark ? 'text-neutral-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'"
                    @click="startEdit(view)"
                >
                    Rename
                </button>
                <button
                    class="block w-full px-3 py-1.5 text-left text-sm"
                    :class="escDark ? 'text-neutral-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'"
                    @click="updateViewFilters(view)"
                >
                    Save current filters
                </button>
                <button
                    class="block w-full px-3 py-1.5 text-left text-sm"
                    :class="escDark ? 'text-red-400 hover:bg-white/5' : 'text-red-600 hover:bg-red-50'"
                    @click="deleteView(view)"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>
