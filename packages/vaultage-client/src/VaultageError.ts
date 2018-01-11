
export enum ERROR_CODE {
    SERVER_ERROR = 2,
    CANNOT_DECRYPT,
    NETWORK_ERROR,
    NOT_FAST_FORWARD,
    DUPLICATE_ENTRY,
    NO_SUCH_ENTRY
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
        public readonly message: string,
        public readonly cause?: Error) {
            super(message);
    }

    public toString(): string {
        let str = this.message;
        if (this.cause) {
            str += '\nCaused by: ' + this.cause;
        }
        return str;
    }
}
