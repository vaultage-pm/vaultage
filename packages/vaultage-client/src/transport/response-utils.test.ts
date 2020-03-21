import { PushPullResponse } from 'vaultage-protocol';

import { ERROR_CODE } from '../VaultageError';
import { ResponseUtils } from './response-utils';

describe('ResponseUtils', () => {
    let service: ResponseUtils;

    const createOKResponse = (): PushPullResponse => ({
        error: false,
        data: 'response'
    });

    beforeEach(() => {
        service = new ResponseUtils();
    });

    describe('checkResponseBody', () => {
        it('Filters response type', () => {
            const response = createOKResponse();
            service.checkResponseBody(response);
            // This would fail at compile time if checkResponseBody wasn't a type guard
            expect(response.data).toBe('response');
        });

        it('converts error types', () => {
            const response: PushPullResponse = {
                error: true,
                code: 'EFAST',
                description: 'test error'
            }
            try {
                service.checkResponseBody(response);
                fail('expected to throw');
            } catch (e) {
                expect(e.code).toBe(ERROR_CODE.NOT_FAST_FORWARD);
                expect(e.message).toBe('test error');
            }
        });

        it('throws appropriate error on garbage response', () => {
            const response: PushPullResponse = {
                error: true,
                code: 'EGARBAGE' as 'EFAST',
                description: 'garbage'
            };
            try {
                service.checkResponseBody(response);
                fail('expected to throw');
            } catch (e) {
                expect(e.code).toBe(ERROR_CODE.PROTOCOL_ERROR);
                expect(e.message).toBe('Bad server response');
            }
        })
    });
});
