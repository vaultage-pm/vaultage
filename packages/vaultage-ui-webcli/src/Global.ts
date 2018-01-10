import { Vault } from 'vaultage-client';

export abstract class Global {
    public static vault?: Vault;
}
