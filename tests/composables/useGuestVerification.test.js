import { describe, it, expect, vi } from 'vitest';
import { effectScope, ref } from 'vue';
import { useGuestVerification } from '../../src/composables/useGuestVerification';

describe('guest email verification', () => {
    it('waits for a mailed code before exposing proof fields', async () => {
        const scope = effectScope();
        const email = ref('guest@example.com');
        const send = vi.fn().mockResolvedValue({ verification_id: 'challenge-id' });
        const verification = scope.run(() => useGuestVerification(() => email.value, 'ticket', send));
        expect(await verification.ready()).toBe(false);
        expect(send).toHaveBeenCalledWith('guest@example.com', 'ticket');
        verification.state.code = '12';
        expect(await verification.ready()).toBe(false);
        verification.state.code = '12345678';
        expect(await verification.ready()).toBe(true);
        expect(verification.fields()).toEqual({ verification_id: 'challenge-id', verification_code: '12345678' });
        email.value = 'other@example.com';
        expect(verification.state.id).toBe('');
        expect(verification.state.code).toBe('');
        scope.stop();
    });

    it('discards in-flight responses after an email or destination change', async () => {
        const scope = effectScope();
        const email = ref('guest@example.com');
        const destination = ref('merchant-a');
        let resolve;
        const send = vi.fn(
            () =>
                new Promise((done) => {
                    resolve = done;
                }),
        );
        const verification = scope.run(() =>
            useGuestVerification(
                () => email.value,
                'lookup',
                send,
                () => destination.value,
            ),
        );
        const pending = verification.send();
        destination.value = 'merchant-b';
        resolve({ verification_id: 'old-merchant' });
        await pending;
        expect(verification.state.id).toBe('');
        expect(verification.state.pending).toBe(false);
        scope.stop();
    });

    it('prevents duplicate code requests and reports server failures', async () => {
        const scope = effectScope();
        let reject;
        const send = vi.fn(
            () =>
                new Promise((_resolve, fail) => {
                    reject = fail;
                }),
        );
        const verification = scope.run(() => useGuestVerification(() => 'guest@example.com', 'chat', send));
        const pending = verification.send();
        await verification.send();
        expect(send).toHaveBeenCalledTimes(1);
        reject(new Error('Please wait before requesting another code.'));
        await pending;
        expect(verification.state.error).toContain('Please wait');
        expect(verification.state.pending).toBe(false);
        scope.stop();
    });

    it('discards a code response after its form is unmounted', async () => {
        const scope = effectScope();
        let resolve;
        const send = () =>
            new Promise((done) => {
                resolve = done;
            });
        const verification = scope.run(() => useGuestVerification(() => 'guest@example.com', 'ticket', send));
        const pending = verification.send();
        scope.stop();
        resolve({ verification_id: 'late-code' });
        await pending;
        expect(verification.state.id).toBe('');
        expect(verification.state.pending).toBe(false);
    });
});
