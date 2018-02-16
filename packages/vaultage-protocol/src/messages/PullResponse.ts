
/**
 * Describes the body of a response to the client (contains a possible error, and possible data).
 */
export interface IPushPullResponse {

    /**
     * True if an error occurred. Usually, if true, data=""
     */
    error: boolean;

    /**
     * A verbose description of the error. If no error occured, equals ""
     */
    description: string;

    /**
     * If no error occured, the ciphertext of the password database
     */
    data: string;
}
