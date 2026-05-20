import { ref, watch } from 'vue';

/**
 * Debounced HTTP preview composable for the newsletter compose form.
 *
 * @param {import('vue').Ref<object>} formRef — reactive form snapshot to POST as the preview payload
 * @param {string} endpoint — POST URL that returns `{ html: string }`
 */
export function usePreview(formRef, endpoint) {
    const html = ref('<p>(empty)</p>');
    const loading = ref(false);
    let timer = null;

    watch(
        formRef,
        () => {
            clearTimeout(timer);
            loading.value = true;
            timer = setTimeout(async () => {
                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        body: JSON.stringify(formRef.value),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        html.value = data.html;
                    }
                } catch {
                    // Swallow — preview is best-effort
                } finally {
                    loading.value = false;
                }
            }, 500);
        },
        { deep: true, immediate: true },
    );

    return { html, loading };
}
