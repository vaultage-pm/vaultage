import { Injectable } from '@angular/core';
import { LocalStorageService } from './platform/local-storage.service';

const STORAGE_KEY = 'vaultage_locked';

@Injectable()
export class PinLockService {

    // TODO: Encrypt with pin and persist
    private get secret(): string | undefined {
        return this.getStorage()?.data;
    }

    private get pin(): string | undefined {
        return this.getStorage()?.pin;
    }

    constructor(private readonly ls: LocalStorageService) {
    }

    public get hasSecret(): boolean {
        return this.pin != null;
    }

    public setSecret(pin: string, data: string): void {
        this.ls.getStorage().setItem(STORAGE_KEY, JSON.stringify({pin, data}));
    }

    public getSecret(pin: string): string | undefined {
        if (this.pin != null && pin === this.pin) {
            return this.secret;
        }
    }

    public reset(): void {
        this.ls.getStorage().removeItem(STORAGE_KEY);
    }

    private getStorage(): PinStorage | undefined {
        const data = this.ls.getStorage().getItem(STORAGE_KEY);
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
