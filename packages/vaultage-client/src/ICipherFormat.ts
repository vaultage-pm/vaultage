
export interface ICipherFormat {
    /**
     * Initialization vector, b64 encoded.
     */
    iv: string;

    /**
     * pbkdf2 iterations
     */
    iter: number;

    /**
     * Key size in bits
     */
    ks: 128;

    /**
     * Tag size in bits
     */
    ts: 64;

    /**
     * Cipher mode
     */
    mode: 'ccm';

    /**
     * Cryptographic salt, b64 encoded.
     */
    salt: string;

    /**
     * Encrypted data, b64 encoded.
     */
    ct: string;

    /**
     * unused
     */
    v: 1;
}
