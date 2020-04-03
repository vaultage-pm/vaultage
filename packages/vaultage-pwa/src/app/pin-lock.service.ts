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
        this.ls.setItem(STORAGE_KEY, JSON.stringify({pin, data}));
    }

    public getSecret(userPin: string): string | undefined {
        const storage = this.getStorage();
        if (storage != null && storage.pin === userPin) {
            return storage.data;
        }
    }

    public reset(): void {
        this.ls.removeItem(STORAGE_KEY);
    }

    private getStorage(): PinStorage | undefined {
        const data = this.ls.getItem(STORAGE_KEY);
        if (data === null) {
            return undefined;
        }
        return JSON.parse(data);
    }
}

interface PinStorage {
    pin: string;
    data: string;
}
