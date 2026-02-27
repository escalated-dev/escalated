<script setup>
import EscalatedLayout from '../../../components/EscalatedLayout.vue';
import { router, Link } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    article: Object,
    related: Array,
});

const feedbackSent = ref(false);

function sendFeedback(helpful) {
    router.post(
        route('escalated.customer.kb.feedback', props.article.slug),
        {
            helpful,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                feedbackSent.value = true;
            },
        },
    );
}
</script>

<template>
    <EscalatedLayout :title="article.title">
        <div class="mx-auto max-w-3xl">
            <div class="mb-6">
                <Link :href="route('escalated.customer.kb.index')" class="text-sm text-gray-500 hover:text-gray-700">
                    &larr; Back to Knowledge Base
                </Link>
            </div>

            <!-- Breadcrumb -->
            <div v-if="article.category" class="mb-4 flex items-center gap-2 text-xs text-gray-500">
                <Link :href="route('escalated.customer.kb.index')" class="hover:text-gray-700">Knowledge Base</Link>
                <span>/</span>
                <Link
                    :href="route('escalated.customer.kb.index', { category: article.category.id })"
                    class="hover:text-gray-700"
                    >{{ article.category.name }}</Link
                >
            </div>

            <!-- Article -->
            <article class="rounded-lg border border-gray-200 bg-white p-8">
                <h1 class="mb-4 text-2xl font-bold text-gray-900">{{ article.title }}</h1>
                <div class="mb-6 flex items-center gap-4 text-xs text-gray-500">
                    <span>{{ article.view_count }} views</span>
                    <span v-if="article.published_at"
                        >Published {{ new Date(article.published_at).toLocaleDateString() }}</span
                    >
                </div>

                <!-- Article body rendered as HTML -->
                <div class="prose prose-gray max-w-none text-gray-700" v-html="article.body"></div>
            </article>

            <!-- Feedback -->
            <div class="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center">
                <template v-if="!feedbackSent">
                    <p class="mb-3 text-sm font-medium text-gray-700">Was this article helpful?</p>
                    <div class="flex items-center justify-center gap-3">
                        <button
                            class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                            @click="sendFeedback(true)"
                        >
                            <svg
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h.904"
                                />
                            </svg>
                            Yes
                        </button>
                        <button
                            class="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            @click="sendFeedback(false)"
                        >
                            <svg
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-.904c-.26 0-.507-.098-.672-.28a5.002 5.002 0 01-.188-.226M7.5 15c-.863 0-1.706-.12-2.514-.348m2.514.348c.26.044.507.22.672.44a4.992 4.992 0 001.423 1.305M4.986 14.652a4.5 4.5 0 01-.236-.442m.236.442c-.31.652-.762 1.168-1.285 1.5m4.78-1.5a11.92 11.92 0 01-.813 1.25m.813-1.25c-.418.593-.91 1.098-1.459 1.5m1.459-1.5a6.12 6.12 0 01-.813 1.25m-2.606 0c-.5.338-1.1.5-1.71.5h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h.904"
                                />
                            </svg>
                            No
                        </button>
                    </div>
                </template>
                <p v-else class="text-sm text-green-600">Thank you for your feedback!</p>
            </div>

            <!-- Related Articles -->
            <div v-if="related?.length" class="mt-6">
                <h3 class="mb-3 text-sm font-semibold text-gray-900">Related Articles</h3>
                <div class="space-y-2">
                    <Link
                        v-for="item in related"
                        :key="item.id"
                        :href="route('escalated.customer.kb.show', item.slug)"
                        class="block rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                        {{ item.title }}
                    </Link>
                </div>
            </div>
        </div>
    </EscalatedLayout>
</template>
