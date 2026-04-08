<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
    baseUrl: { type: String, default: '' },
    initialColor: { type: String, default: '#4F46E5' },
    initialPosition: { type: String, default: 'bottom-right' },
});

const isOpen = ref(false);
const activeTab = ref('help');
const error = ref('');
const widgetConfig = ref(null);

const color = computed(() => widgetConfig.value?.color || props.initialColor);
const position = computed(() => widgetConfig.value?.position || props.initialPosition);
const greeting = computed(() => widgetConfig.value?.greeting || 'Hi there! How can we help?');
const departments = computed(() => widgetConfig.value?.departments || []);
const kbEnabled = computed(() => widgetConfig.value?.kb_enabled ?? true);

const searchQuery = ref('');
const searchResults = ref([]);
const searchLoading = ref(false);
const selectedArticle = ref(null);
const articleLoading = ref(false);

const ticketForm = ref({
    name: '',
    email: '',
    subject: '',
    description: '',
    department_id: '',
});
const ticketSubmitting = ref(false);
const ticketSuccess = ref(null);

const statusForm = ref({ email: '', reference: '' });
const statusLoading = ref(false);
const statusResult = ref(null);

let searchTimer = null;

async function api(method, apiPath, body = null) {
    const url = `${props.baseUrl}/support/widget${apiPath}`;
    const opts = {
        method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw { status: res.status, data };
    return data;
}

onMounted(async () => {
    try {
        widgetConfig.value = await api('GET', '/config');
    } catch {
        // Widget may be disabled
    }
});

watch(searchQuery, (q) => {
    clearTimeout(searchTimer);
    if (!q || q.length < 2) {
        searchResults.value = [];
        return;
    }
    searchTimer = setTimeout(async () => {
        searchLoading.value = true;
        error.value = '';
        try {
            const data = await api('GET', `/articles?q=${encodeURIComponent(q)}`);
            searchResults.value = data.articles;
        } catch {
            searchResults.value = [];
        } finally {
            searchLoading.value = false;
        }
    }, 300);
});

async function viewArticle(slug) {
    articleLoading.value = true;
    error.value = '';
    try {
        selectedArticle.value = await api('GET', `/articles/${slug}`);
    } catch {
        error.value = 'Could not load article.';
    } finally {
        articleLoading.value = false;
    }
}

function backToSearch() {
    selectedArticle.value = null;
}

async function submitTicket() {
    ticketSubmitting.value = true;
    error.value = '';
    try {
        const data = await api('POST', '/tickets', {
            name: ticketForm.value.name,
            email: ticketForm.value.email,
            subject: ticketForm.value.subject,
            description: ticketForm.value.description,
            department_id: ticketForm.value.department_id || null,
        });
        ticketSuccess.value = data;
        ticketForm.value = {
            name: '',
            email: '',
            subject: '',
            description: '',
            department_id: '',
        };
    } catch (e) {
        if (e.data?.errors) {
            error.value = Object.values(e.data.errors).flat().join(' ');
        } else {
            error.value = e.data?.message || 'Failed to submit ticket.';
        }
    } finally {
        ticketSubmitting.value = false;
    }
}

async function checkStatus() {
    statusLoading.value = true;
    error.value = '';
    statusResult.value = null;
    try {
        const data = await api(
            'GET',
            `/tickets/${encodeURIComponent(statusForm.value.reference)}?email=${encodeURIComponent(statusForm.value.email)}`,
        );
        statusResult.value = data;
    } catch (e) {
        error.value = e.data?.message || 'Ticket not found.';
    } finally {
        statusLoading.value = false;
    }
}

function togglePanel() {
    isOpen.value = !isOpen.value;
    error.value = '';
}

function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
}
</script>

<template>
    <button
        class="esc-w-fab"
        :class="position"
        :style="{ backgroundColor: color }"
        :aria-label="isOpen ? 'Close support widget' : 'Open support widget'"
        @click="togglePanel"
    >
        <svg v-if="!isOpen" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
            <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
        </svg>
    </button>

    <div
        class="esc-w-panel"
        :class="[position, { 'esc-open': isOpen }]"
        :style="{ '--esc-widget-color': color }"
        data-widget-panel
    >
        <div class="esc-w-header" :style="{ backgroundColor: color }">
            <h2>Support</h2>
            <p>{{ greeting }}</p>
        </div>

        <div class="esc-w-tabs">
            <button
                v-if="kbEnabled"
                class="esc-w-tab"
                :class="{ active: activeTab === 'help' }"
                @click="
                    activeTab = 'help';
                    error = '';
                "
            >
                Help
            </button>
            <button
                class="esc-w-tab"
                :class="{ active: activeTab === 'contact' }"
                @click="
                    activeTab = 'contact';
                    error = '';
                    ticketSuccess = null;
                "
            >
                Contact
            </button>
            <button
                class="esc-w-tab"
                :class="{ active: activeTab === 'status' }"
                @click="
                    activeTab = 'status';
                    error = '';
                    statusResult = null;
                "
            >
                Check Status
            </button>
        </div>

        <div class="esc-w-body">
            <template v-if="activeTab === 'help' && kbEnabled">
                <template v-if="!selectedArticle">
                    <div class="esc-w-field">
                        <input v-model="searchQuery" type="text" class="esc-w-input" placeholder="Search for help..." />
                    </div>
                    <div v-if="searchLoading" class="esc-w-spinner"></div>
                    <div v-else-if="searchResults.length">
                        <div
                            v-for="article in searchResults"
                            :key="article.slug"
                            class="esc-w-article"
                            @click="viewArticle(article.slug)"
                        >
                            <h4>{{ article.title }}</h4>
                            <p>{{ article.excerpt }}</p>
                        </div>
                    </div>
                    <div v-else-if="searchQuery.length >= 2 && !searchLoading" class="esc-w-empty">
                        No articles found.
                    </div>
                </template>
                <template v-else>
                    <div class="esc-w-article-detail">
                        <button class="esc-w-back" @click="backToSearch">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                            </svg>
                            Back
                        </button>
                        <div v-if="articleLoading" class="esc-w-spinner"></div>
                        <template v-else>
                            <h3>{{ selectedArticle.title }}</h3>
                            <!-- eslint-disable-next-line vue/no-v-html -->
                            <div class="esc-w-article-body" v-html="selectedArticle.body"></div>
                        </template>
                    </div>
                </template>
            </template>

            <template v-if="activeTab === 'contact'">
                <template v-if="ticketSuccess">
                    <div class="esc-w-success">
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                            />
                        </svg>
                        <h4>Ticket Submitted</h4>
                        <p>We'll get back to you shortly.</p>
                        <span class="esc-w-ref">{{ ticketSuccess.reference }}</span>
                    </div>
                </template>
                <template v-else>
                    <div v-if="error" class="esc-w-error">{{ error }}</div>
                    <form @submit.prevent="submitTicket">
                        <div class="esc-w-field">
                            <label class="esc-w-label">Name</label>
                            <input v-model="ticketForm.name" type="text" class="esc-w-input" required />
                        </div>
                        <div class="esc-w-field">
                            <label class="esc-w-label">Email</label>
                            <input v-model="ticketForm.email" type="email" class="esc-w-input" required />
                        </div>
                        <div class="esc-w-field">
                            <label class="esc-w-label">Subject</label>
                            <input v-model="ticketForm.subject" type="text" class="esc-w-input" required />
                        </div>
                        <div class="esc-w-field">
                            <label class="esc-w-label">Description</label>
                            <textarea v-model="ticketForm.description" class="esc-w-textarea" required></textarea>
                        </div>
                        <div v-if="departments.length" class="esc-w-field">
                            <label class="esc-w-label">Department</label>
                            <select v-model="ticketForm.department_id" class="esc-w-select">
                                <option value="">Select a department...</option>
                                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                                    {{ dept.name }}
                                </option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            class="esc-w-btn"
                            :style="{ backgroundColor: color }"
                            :disabled="ticketSubmitting"
                        >
                            {{ ticketSubmitting ? 'Submitting...' : 'Submit Ticket' }}
                        </button>
                    </form>
                </template>
            </template>

            <template v-if="activeTab === 'status'">
                <div v-if="error" class="esc-w-error">{{ error }}</div>
                <template v-if="!statusResult">
                    <form @submit.prevent="checkStatus">
                        <div class="esc-w-field">
                            <label class="esc-w-label">Email Address</label>
                            <input
                                v-model="statusForm.email"
                                type="email"
                                class="esc-w-input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div class="esc-w-field">
                            <label class="esc-w-label">Ticket Reference</label>
                            <input
                                v-model="statusForm.reference"
                                type="text"
                                class="esc-w-input"
                                placeholder="ESC-00001"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            class="esc-w-btn"
                            :style="{ backgroundColor: color }"
                            :disabled="statusLoading"
                        >
                            {{ statusLoading ? 'Checking...' : 'Check Status' }}
                        </button>
                    </form>
                </template>
                <template v-else>
                    <button
                        class="esc-w-back"
                        @click="
                            statusResult = null;
                            error = '';
                        "
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                        Back
                    </button>
                    <div class="esc-w-status-card">
                        <div
                            style="
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-start;
                                margin-bottom: 8px;
                            "
                        >
                            <h4>{{ statusResult.subject }}</h4>
                            <span
                                class="esc-w-status-badge"
                                :style="{
                                    backgroundColor: statusResult.status_color,
                                }"
                            >
                                {{ statusResult.status_label }}
                            </span>
                        </div>
                        <div style="font-size: 12px; color: #6b7280">
                            <span>{{ statusResult.reference }}</span>
                            <span v-if="statusResult.department"> &middot; {{ statusResult.department }}</span>
                            <span>
                                &middot;
                                {{ formatDate(statusResult.created_at) }}</span
                            >
                        </div>
                    </div>
                    <div v-if="statusResult.replies?.length">
                        <div v-for="(reply, i) in statusResult.replies" :key="i" class="esc-w-reply">
                            <div style="display: flex; justify-content: space-between; align-items: center">
                                <span>
                                    <span class="esc-w-reply-author">{{ reply.author }}</span>
                                    <span v-if="reply.is_agent" class="esc-w-reply-agent">Staff</span>
                                </span>
                                <span class="esc-w-reply-time">{{ formatDate(reply.created_at) }}</span>
                            </div>
                            <!-- eslint-disable-next-line vue/no-v-html -->
                            <div class="esc-w-reply-body" v-html="reply.body"></div>
                        </div>
                    </div>
                    <div v-else class="esc-w-empty">No replies yet.</div>
                </template>
            </template>
        </div>
    </div>
</template>
