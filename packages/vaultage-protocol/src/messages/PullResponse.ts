
export interface IErrorPushPullResponse {
    /**
     * True if an error occurred. Usually, if true, data=""
     */
    error: true;

    /**
     * A human readable description of the error. This must not be used by programs; use `code` instead.
     */
    description: string;

    /**
     * The code associated to the error which occured. Possible codes are:
     *
     * - 'EFAST': An attempt to push was not fast-forward.
     * - 'EAUTH': The credentials provided are invalid
     */
    code: 'EFAST' | 'EAUTH';
}

export interface ISuccessfulPushPullResponse {
    /**
     * If no error occured, the ciphertext of the password database
     */
    data: string;
}

/**
 * Describes the body of a response to the client (contains a possible error, and possible data).
 */
export type PushPullResponse = ISuccessfulPushPullResponse | IErrorPushPullResponse;
