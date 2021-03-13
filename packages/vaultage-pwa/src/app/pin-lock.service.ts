import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE } from './platform/providers';

const STORAGE_KEY = 'vaultage_locked';

@Injectable()
export class PinLockService {

    constructor(@Inject(LOCAL_STORAGE) private readonly ls: Storage) {
    }

    public get hasSecret(): boolean {
        return this.getStorage() != null;
    }

    public setSecret(pin: string, data: string): void {

        this.ls.setItem(STORAGE_KEY, this.encrypt(JSON.stringify({pin, data}), pin));
    }


    private encrypt(data: string, pin: string): string {
        return (window as any).sjcl.encrypt(pin, data);
    }

    public getSecret(userPin: string): string | undefined {
        const storage = this.getStorage();

        if (storage != null) {
            let pinStorage;
            try {
                pinStorage = this.checkDecryption(storage, userPin);
            } catch(e) {
                return undefined;
            }
            if(!pinStorage) {
                return undefined;
            }
            return pinStorage.data;
        }
    }
    private checkDecryption(storage: string, userPin: string): PinStorage {
        const data = (window as any).sjcl.decrypt(userPin, storage);
        return JSON.parse(data);
    }

    public reset(): void {
        this.ls.removeItem(STORAGE_KEY);
    }


    private getStorage(): string | undefined {
        const data = this.ls.getItem(STORAGE_KEY);
        if (data === null) {
            return undefined;
        }
        return data;
    }
}

interface PinStorage {
    pin: string;
    data: string;
}
