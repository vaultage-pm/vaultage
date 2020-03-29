import { Boolean, Literal, Number, Partial, Record, Static, String, Union } from 'runtypes';

export type VaultageConfig = Static<typeof VaultageConfig>;
export const VaultageConfig = Record({
    /**
     * Version of this structure
     */
    version: Number,

    /**
     * Salts used for hashing
     */
    salts: Record({
        local_key_salt: String,
        remote_key_salt: String
    }),
    /*
     * Whether this instance is running in demo mode.
     */
    demo: Boolean
});

/**
 * Describes the body of a POST request to the cipher API (implemented in CipherController).
 */
export type UpdateCipherRequest = Static<typeof UpdateCipherRequest>;
export const UpdateCipherRequest = Record({

    /**
     * The new cipher data. Overwrites entirely the previous value.
     */
    new_data: String,

    /**
     * The new cipher fingerprint. This value is determined client-side and the server
     * doesn't know how it is computed.
     */
    new_hash: String,
}).And(Partial({

    /**
     * If set, tells the server to use this key as the remote authentication key from now on.
     */
    new_password: String,

    /**
     * The previous cipher fingerprint. If it doesn't match the one stored on the server,
     * the update is rejected.
     */
    old_hash: String,

    /**
     * If set to true, ignores the value of old_hash and updates regardless.
     */
    force: Boolean
}));

export type IErrorPushPullResponse = Static<typeof IErrorPushPullResponse>;
export const IErrorPushPullResponse = Record({
    /**
     * True if an error occurred. Usually, if true, data=""
     */
    error: Literal(true),

    /**
     * A human readable description of the error. This must not be used by programs; use `code` instead.
     */
    description: String,

    /**
     * The code associated to the error which occured. Possible codes are:
     *
     * - 'EFAST': An attempt to push was not fast-forward.
     * - 'EAUTH': The credentials provided are invalid
     * - 'EDEMO': The server is running in demo mode
     */
    code: Union(Literal('EFAST'), Literal('EAUTH'), Literal('EDEMO'))
});

export type ISuccessfulPushPullResponse = Static<typeof ISuccessfulPushPullResponse>;
export const ISuccessfulPushPullResponse = Record({
    /**
     * True if an error occurred. Usually, if true, data=""
     */
    error: Literal(false),

    /**
     * If no error occured, the ciphertext of the password database
     */
    data: String
});

/**
 * Describes the body of a response to the client (contains a possible error, and possible data).
 */
export type PushPullResponse = Static<typeof PushPullResponse>;
export const PushPullResponse = Union(ISuccessfulPushPullResponse, IErrorPushPullResponse);
