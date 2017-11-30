export interface IVaultageConfig {
    /**
     * Version of this structure
     */
    version: number;

    /**
     * Default user shown in the UI.
     */
    default_user: string;

    /**
     * Salts used for hashing
     */
    salts: {
        local_key_salt: string;
        remote_key_salt: string;
    };
}
