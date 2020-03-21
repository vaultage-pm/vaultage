
import { defineAPI, GET, POST } from 'rest-ts-core';
import { PushPullResponse, VaultageConfig, UpdateCipherRequest } from './dtos';

export const api = defineAPI({
    pullConfig: GET `/config`
        .response(VaultageConfig),

    pullCipher: GET `/${'username'}/${'remoteKey'}/vaultage_api`
        .response(PushPullResponse),

    pushCipher: POST `/${'username'}/${'remoteKey'}/vaultage_api`
        .body(UpdateCipherRequest)
        .response(PushPullResponse)
});
