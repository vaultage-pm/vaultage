import { injectable } from 'tsyringe';
import { IErrorPushPullResponse, ISuccessfulPushPullResponse, PushPullResponse } from 'vaultage-protocol';

import { ERROR_CODE, VaultageError } from '../VaultageError';

@injectable()
export class ResponseUtils {

    public checkResponseBody(body: PushPullResponse): asserts body is ISuccessfulPushPullResponse {
        if (body.error === true) {
            return this.throwProtocolError(body);
        }
    }

    errorMapping: { [k in IErrorPushPullResponse['code']]: ERROR_CODE } = {
        EFAST: ERROR_CODE.NOT_FAST_FORWARD,
        EAUTH: ERROR_CODE.NOT_FAST_FORWARD,
        EDEMO: ERROR_CODE.NOT_FAST_FORWARD,
    };

    private throwProtocolError(err: IErrorPushPullResponse): never {
        const mapped = this.errorMapping[err.code];
        if (mapped != null) {
            throw new VaultageError(mapped, err.description);
        }

        throw new VaultageError(ERROR_CODE.PROTOCOL_ERROR, 'Bad server response');
    }
}