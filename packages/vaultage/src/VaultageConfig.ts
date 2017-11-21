export interface IVaultageConfig {
    /**
     * Version of this structure
     */
    version: number;

    /**
     * Default user shown in the UI.
     */
    DEFAULT_USER: string;

    /**
     * Salts used for hashing
     */
    SALTS: {
        LOCAL_KEY_SALT: string;
        REMOTE_KEY_SALT: string;
    };
}
