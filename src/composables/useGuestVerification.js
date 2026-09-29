import { onScopeDispose, reactive, watch } from 'vue';

/** Keep each mailbox proof tied to the form and destination that requested it. */
export function useGuestVerification(email, purpose, requestCode, context = () => '') {
    const state = reactive({ id: '', code: '', message: '', error: '', pending: false });
    let generation = 0;
    function reset() {
        generation++;
        Object.assign(state, { id: '', code: '', message: '', error: '', pending: false });
    }
    watch([email, context], reset, { flush: 'sync' });
    onScopeDispose(reset);

    async function send() {
        if (state.pending) return;
        reset();
        const current = generation;
        state.pending = true;
        try {
            const result = await requestCode(email(), purpose);
            if (current !== generation) return;
            if (typeof result.verification_id !== 'string' || !result.verification_id) {
                throw new Error('Could not request a verification code.');
            }
            state.id = result.verification_id;
            state.message = 'Check your email. Enter the 8-digit code to continue; it expires in 10 minutes.';
        } catch (error) {
            if (current === generation) state.error = error.message || 'Could not request a verification code.';
        } finally {
            if (current === generation) state.pending = false;
        }
    }

    async function ready() {
        if (!state.id) {
            await send();
            return false;
        }
        state.error = '';
        if (!/^[0-9]{8}$/.test(state.code)) {
            state.error = 'Enter the 8-digit code from your email.';
            return false;
        }
        return true;
    }

    return { state, ready, send, reset, fields: () => ({ verification_id: state.id, verification_code: state.code }) };
}
