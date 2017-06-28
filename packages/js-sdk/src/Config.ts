
/*  === Config parameters ===
 *
 * These can be tweaked from outside the module like this:
 * ```
 * vaultage.PBKF2_DIFFICULTY = 10000;
 * ```
 */
export interface Config {
    /**
     * How hard should the computation to derive the local and remote keys be.
     *
     * Higher is harder.
     * The harder, the longer it takes to brute-force but also the longer it takes to log in.
     */
    PBKDF2_DIFFICULTY: number;

    /**
     * How many bytes should an entry in the vault be.
     *
     * When serializing the DB, vaultage adds some padding to make sure the cleartext is
     * at least BYTES_PER_ENTRY * n_entries + constant bytes long.
     *
     * This prevents an attacker from guessing the vault's contents by its length but the
     * tradeof is that it reveals how many entries the DB contains.
     *
     * If you want to disable padding, set BYTES_PER_ENTRY to 0.
     */
    BYTES_PER_ENTRY: number;

    /**
     * Minimum length of the serialized vault.
     * Accounts for the overhead of the JSON skeleton when computing the padding needed.
     */
    MIN_DB_LENGTH: number;
}

