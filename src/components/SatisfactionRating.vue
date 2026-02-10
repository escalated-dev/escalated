<script setup>
import { ref, computed, inject } from 'vue';
import { router } from '@inertiajs/vue3';

const props = defineProps({
    action: { type: String, required: true },
    existingRating: { type: Object, default: null },
});

const escDark = inject('esc-dark', computed(() => false));
const hoveredStar = ref(0);
const selectedRating = ref(props.existingRating?.rating || 0);
const comment = ref(props.existingRating?.comment || '');
const processing = ref(false);
const submitted = ref(false);

const isReadOnly = computed(() => !!props.existingRating);

const displayRating = computed(() => {
    if (isReadOnly.value) return props.existingRating.rating;
    if (hoveredStar.value > 0) return hoveredStar.value;
    return selectedRating.value;
});

const ratingLabels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

function selectStar(star) {
    if (isReadOnly.value) return;
    selectedRating.value = star;
}

function hoverStar(star) {
    if (isReadOnly.value) return;
    hoveredStar.value = star;
}

function leaveStars() {
    hoveredStar.value = 0;
}

function submit() {
    if (!selectedRating.value || processing.value || isReadOnly.value) return;
    processing.value = true;
    router.post(props.action, {
        rating: selectedRating.value,
        comment: comment.value || null,
    }, {
        preserveScroll: true,
        onSuccess: () => {
            submitted.value = true;
        },
        onFinish: () => {
            processing.value = false;
        },
    });
}
</script>

<template>
    <div :class="['rounded-xl border p-5',
                  escDark ? 'border-white/[0.06] bg-neutral-900/60' : 'border-gray-200 bg-white']">
        <h3 :class="['text-sm font-semibold',
                      escDark ? 'text-neutral-200' : 'text-gray-900']">
            {{ isReadOnly ? 'Customer Rating' : 'How was your experience?' }}
        </h3>

        <!-- Stars -->
        <div class="mt-3 flex items-center gap-1" @mouseleave="leaveStars">
            <button v-for="star in 5" :key="star"
                    @click="selectStar(star)"
                    @mouseenter="hoverStar(star)"
                    :disabled="isReadOnly"
                    :class="['transition-transform', !isReadOnly && 'hover:scale-110', isReadOnly && 'cursor-default']">
                <!-- Filled star -->
                <svg v-if="star <= displayRating" class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"
                     :class="escDark ? 'text-amber-400' : 'text-yellow-400'">
                    <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
                </svg>
                <!-- Empty star -->
                <svg v-else class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"
                     :class="escDark ? 'text-neutral-600' : 'text-gray-300'">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
            </button>
            <span v-if="displayRating > 0"
                  :class="['ml-2 text-sm font-medium',
                           escDark ? 'text-neutral-400' : 'text-gray-500']">
                {{ ratingLabels[displayRating] }}
            </span>
        </div>

        <!-- Comment -->
        <div v-if="!isReadOnly" class="mt-4">
            <textarea v-model="comment" rows="3"
                      placeholder="Any additional feedback? (optional)"
                      :class="['w-full rounded-lg border px-3 py-2 text-sm focus:outline-none',
                               escDark
                                   ? 'border-white/10 bg-neutral-950 text-neutral-200 placeholder-neutral-600 focus:border-white/20 focus:ring-1 focus:ring-white/10'
                                   : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500']">
            </textarea>
        </div>

        <!-- Read-only comment display -->
        <div v-if="isReadOnly && existingRating.comment" class="mt-3">
            <p :class="['text-sm italic', escDark ? 'text-neutral-400' : 'text-gray-600']">
                "{{ existingRating.comment }}"
            </p>
        </div>

        <!-- Submit -->
        <div v-if="!isReadOnly" class="mt-3">
            <div v-if="submitted"
                 :class="['rounded-lg px-3 py-2 text-sm font-medium',
                          escDark ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-green-50 text-green-700']">
                Thank you for your feedback!
            </div>
            <button v-else @click="submit"
                    :disabled="!selectedRating || processing"
                    :class="['rounded-lg px-4 py-2 text-sm font-medium text-white transition-all',
                             escDark
                                 ? 'bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400'
                                 : 'bg-blue-600 hover:bg-blue-700',
                             (!selectedRating || processing) && 'cursor-not-allowed opacity-40']">
                Submit Rating
            </button>
        </div>
    </div>
</template>
