<script setup>
import { ref, computed, inject } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    action: { type: String, required: true },
    isFollowing: { type: Boolean, default: false },
    followersCount: { type: Number, default: 0 },
});

const escDark = inject('esc-dark', computed(() => false));
const following = ref(props.isFollowing);
const count = ref(props.followersCount);
const processing = ref(false);

function toggle() {
    if (processing.value) return;
    processing.value = true;
    router.post(props.action, {}, {
        preserveScroll: true,
        onSuccess: () => {
            following.value = !following.value;
            count.value += following.value ? 1 : -1;
        },
        onFinish: () => {
            processing.value = false;
        },
    });
}
</script>

<template>
    <button @click="toggle"
            :disabled="processing"
            :class="['inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                     escDark
                         ? (following
                             ? 'bg-cyan-500/15 text-white ring-1 ring-cyan-500/20 hover:bg-cyan-500/25'
                             : 'border border-white/10 bg-white/[0.03] text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200')
                         : (following
                             ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-200'
                             : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'),
                     processing && 'opacity-50 cursor-not-allowed']">
        <!-- Eye icon -->
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <template v-if="following">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </template>
            <template v-else>
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </template>
        </svg>
        {{ following ? 'Following' : 'Follow' }}
        <span v-if="count > 0"
              :class="['rounded-full px-1.5 py-0.5 text-xs',
                       escDark
                           ? 'bg-white/[0.06] text-neutral-400'
                           : 'bg-gray-100 text-gray-500']">
            {{ count }}
        </span>
    </button>
</template>
