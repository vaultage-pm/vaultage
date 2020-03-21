import { VaultageError, ERROR_CODE } from './VaultageError';

describe('VaultageError', () => {

    it('is a regular error', () => {
        const err = new VaultageError(ERROR_CODE.SERVER_ERROR, 'message');
        expect(err.toString()).toBe('Error: message');
    });

    it('chains a cause', () => {
        const err = new VaultageError(ERROR_CODE.SERVER_ERROR, 'message', new Error('the cause'));
        expect(err.toString()).toBe('Error: message: the cause\nCaused by: Error: the cause');
    });

    it('chains a cause recursively', () => {
        const err = new VaultageError(ERROR_CODE.SERVER_ERROR, 'message', new VaultageError(ERROR_CODE.SERVER_ERROR, 'the cause'));
        expect(err.toString()).toBe('Error: message: the cause\nCaused by: Error: the cause');
    });
});
