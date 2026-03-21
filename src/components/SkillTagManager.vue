<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    availableSkills: { type: Array, default: () => [] },
    modelValue: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue']);

const showDropdown = ref(false);

const selectedSkills = computed(() => {
    return props.availableSkills.filter((s) => props.modelValue.includes(s.id));
});

const unselectedSkills = computed(() => {
    return props.availableSkills.filter((s) => !props.modelValue.includes(s.id));
});

function addSkill(skillId) {
    emit('update:modelValue', [...props.modelValue, skillId]);
    showDropdown.value = false;
}

function removeSkill(skillId) {
    emit(
        'update:modelValue',
        props.modelValue.filter((id) => id !== skillId),
    );
}
</script>

<template>
    <div class="space-y-2">
        <!-- Selected skill tags -->
        <div class="flex flex-wrap gap-1.5">
            <span
                v-for="skill in selectedSkills"
                :key="skill.id"
                class="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 px-2 py-1 text-xs font-medium text-cyan-300 ring-1 ring-cyan-500/20"
            >
                {{ skill.name }}
                <button
                    aria-label="Remove skill"
                    class="ml-0.5 text-cyan-400 hover:text-cyan-200"
                    @click="removeSkill(skill.id)"
                >
                    &times;
                </button>
            </span>
            <span v-if="!selectedSkills.length" class="text-xs text-neutral-500">No skills assigned</span>
        </div>

        <!-- Add button / dropdown -->
        <div class="relative">
            <button
                v-if="unselectedSkills.length"
                class="rounded-lg border border-dashed border-white/[0.08] px-2 py-1 text-xs text-neutral-400 transition-colors hover:border-white/[0.15] hover:text-neutral-300"
                @click="showDropdown = !showDropdown"
            >
                + Add Skill
            </button>
            <div
                v-if="showDropdown && unselectedSkills.length"
                class="absolute left-0 top-full z-10 mt-1 max-h-40 w-48 overflow-y-auto rounded-lg border border-white/[0.06] bg-neutral-900 py-1 shadow-xl"
            >
                <button
                    v-for="skill in unselectedSkills"
                    :key="skill.id"
                    class="w-full px-3 py-1.5 text-left text-xs text-neutral-300 transition-colors hover:bg-white/[0.04]"
                    @click="addSkill(skill.id)"
                >
                    {{ skill.name }}
                </button>
            </div>
        </div>
    </div>
</template>
