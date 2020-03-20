import { injectable } from 'inversify';

import { ICrypto } from 'src/crypto/ICrypto';
import { HttpApi } from 'src/transport/http-api';
import { IHttpParams } from 'src/interface';
import { ICredentials, Vault } from 'src/vault/Vault';
import { MergeService } from 'src/merge-service';
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

        let db = this.vaultDBService.createEmpty();
        let lastFingerprint: string | undefined;

        if (cipher) {
            const plain = await crypto.decrypt(creds.localKey, cipher);
            db = this.vaultDBService.deserialize(plain);
            lastFingerprint = await crypto.getFingerprint(plain, creds.localKey);
        }

        return new Vault(this.httpApi, this.mergeService, this.vaultDBService, {...creds}, crypto, db, demoMode || false, httpParams, lastFingerprint);
    }
}