<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
    modelValue: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'complete']);

const digits = ref(Array(6).fill(''));
const inputs = ref([]);

function setRef(el, index) {
    if (el) inputs.value[index] = el;
}

function handleInput(index, event) {
    const val = event.target.value.replace(/\D/g, '');
    digits.value[index] = val.slice(-1);

    const code = digits.value.join('');
    emit('update:modelValue', code);

    if (val && index < 5) {
        nextTick(() => inputs.value[index + 1]?.focus());
    }

    if (code.length === 6 && !code.includes('')) {
        emit('complete', code);
    }
}

function handleKeydown(index, event) {
    if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
        nextTick(() => inputs.value[index - 1]?.focus());
    }
}

function handlePaste(event) {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    for (let i = 0; i < 6; i++) {
        digits.value[i] = pasted[i] || '';
    }
    const code = digits.value.join('');
    emit('update:modelValue', code);

    if (code.length === 6) {
        emit('complete', code);
    } else {
        nextTick(() => inputs.value[Math.min(pasted.length, 5)]?.focus());
    }
}

watch(
    () => props.modelValue,
    (val) => {
        if (!val) {
            digits.value = Array(6).fill('');
        }
    },
);
</script>

<template>
    <div class="flex gap-2">
        <input
            v-for="(_, index) in 6"
            :key="index"
            :ref="(el) => setRef(el, index)"
            :value="digits[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="h-12 w-10 rounded-lg border border-white/10 bg-neutral-950 text-center text-lg font-semibold text-neutral-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            @input="handleInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
            @paste="handlePaste"
        />
    </div>
</template>
