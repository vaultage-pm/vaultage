import { injectable } from 'tsyringe';

import { ICrypto } from '../crypto/ICrypto';
import { IHttpParams } from '../interface';
import { MergeService } from '../merge-service';
import { HttpApi } from '../transport/http-api';
import { ICredentials, Vault } from './Vault';
import { VaultDB } from './VaultDB';
import { VaultDBService } from './vaultdb-service';

@injectable()
export class VaultService {

    constructor(
            private readonly httpApi: HttpApi,
            private readonly mergeService: MergeService,
            private readonly vaultDBService: VaultDBService) { }

    public async create(
        creds: ICredentials,
        crypto: ICrypto,
        cipher: string | undefined,
        httpParams?: IHttpParams,
        demoMode?: boolean
    ): Promise<Vault> {

        let db: VaultDB;
        let lastFingerprint: string | undefined;

        if (cipher) {
            const plain = await crypto.decrypt(creds.localKey, cipher);
            db = this.vaultDBService.deserialize(plain);
            lastFingerprint = await crypto.getFingerprint(plain, creds.localKey);
        } else {
            db = this.vaultDBService.createEmpty();
        }

        return new Vault(this.httpApi, this.mergeService, this.vaultDBService, {...creds}, crypto, db, demoMode || false, httpParams, lastFingerprint);
    }
}