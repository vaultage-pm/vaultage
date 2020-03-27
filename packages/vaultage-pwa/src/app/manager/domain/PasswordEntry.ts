import { IVaultDBEntryAttrs } from 'vaultage-client';

/**
 * A complete entry in the vault database
 */
export interface PasswordEntry {
    title: string;
    id: string;
    url: string;
    login: string;
    password: string;
}

export function toVaultageEntry(pwEntry: PasswordEntry): IVaultDBEntryAttrs {
    // The conversion is trivial because our domain model is very similar to the vaultage DTO.
    // However, this function is required to make sure that our model is type-compatible with that of Vaultage.
    return { ...pwEntry };
}
