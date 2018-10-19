export interface IVaultageConfig {
    /**
     * Version of this structure
     */
    version: number;

    /**
     * Salts used for hashing
     */
    salts: {
        local_key_salt: string;
        remote_key_salt: string;
    };
    /*
     * Whether this instance is running in demo mode.
     */
    demo: boolean;
}
