
export enum ERROR_CODE {

    /**
     * An internal server error occurred.
     */
    SERVER_ERROR = 2,

    CANNOT_DECRYPT,
    NETWORK_ERROR,
    NOT_FAST_FORWARD,
    DUPLICATE_ENTRY,
    NO_SUCH_ENTRY,

    /**
     * Invalid Vaultage credentials
     */
    BAD_CREDENTIALS,

    /**
     * The server responded with an HTTP-level auth error.
     * Most likely due to a missing or invalid Authorization header.
     */
    NOT_AUTHORIZED,

    /**
     * The server is in demo mode and is refusing "push" operations.
     */
    DEMO_MODE
}

/**
 * Class for errors coming from the Vaultage lib.
 * @constructor
 *
 * @member {number} code Code as defined in Vaultage.ERROR_CODES. Rely on this when processing the error.
 * @member {string} message Human readable error message. Do not rely on this when processing the error.
 * @member {?Error} cause Exception causing this error
 */
export class VaultageError extends Error {
    constructor(
        public readonly code: ERROR_CODE,
        message: string,
        public readonly cause?: Error) {
            super(message + (cause ? `: ${cause.message}` : ''));
    }

    public toString(): string {
        let str = 'Error: ' + this.message;
        if (this.cause) {
            str += '\nCaused by: ' + this.cause;
        }
        return str;
    }
}
