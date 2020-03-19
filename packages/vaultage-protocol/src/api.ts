
import { defineAPI, GET, POST } from 'rest-ts-core';
import { PushPullResponse, VaultageConfig, UpdateCipherRequest } from './dtos';

export const api = defineAPI({
    pullConfig: GET `/config`
        .response(VaultageConfig),

    pullCipher: GET `${'serverURL'}/${'username'}/${'remotePwdHash'}/vaultage_api`
        .response(PushPullResponse),

    pushCipher: POST `${'serverURL'}/${'username'}/${'remotePwdHash'}/vaultage_api`
        .body(UpdateCipherRequest)
        .response(PushPullResponse)
})