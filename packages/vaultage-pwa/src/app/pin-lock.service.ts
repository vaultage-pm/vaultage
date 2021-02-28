import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE } from './platform/providers';

import { sha384, sha512 } from 'js-sha512';
import { ModeOfOperation, utils as AESUtil } from "aes-js";

const STORAGE_KEY = 'vaultage_locked';

@Injectable()
export class PinLockService {

    constructor(@Inject(LOCAL_STORAGE) private readonly ls: Storage) {
    }

    public get hasSecret(): boolean {
        return this.getStorage() != null;
    }

    public setSecret(pin: string, data: string): void {

        this.ls.setItem(STORAGE_KEY, JSON.stringify(this.encrypt(JSON.stringify({pin, data}), pin)));
    }


    private encrypt(data: string, pin: string): string[] {
        data = this.checkMultipleSize(data, 16);
        const pinHash = sha384(pin);
        const iv = AESUtil.hex.toBytes(pinHash.substr(0, 32));
        const key = AESUtil.hex.toBytes(pinHash.substr(32, 64));
        const crytoData = AESUtil.hex.fromBytes(new ModeOfOperation.cbc(key, iv).encrypt(
            AESUtil.utf8.toBytes(data)));
        const checksum = sha512(pinHash + data);
        return [checksum,crytoData];
    }
    private checkMultipleSize(data: string, sizeMultiple: number): string {
        while(data.length % sizeMultiple > 0) {
            data += ' ';
        }
        return data;
    }

    public getSecret(userPin: string): string | undefined {
        const storage = this.getStorage();

        if (storage != null) {
            const pinStorage = this.checkDecryption(storage, userPin);
            if(!pinStorage) {
                return undefined;
            }
            return pinStorage.data;
        }
    }
    private checkDecryption(storageAsString: string, userPin: string): PinStorage | undefined {
        const storage: string[] = JSON.parse(storageAsString);
        const pinHash = sha384(userPin);
        const iv = AESUtil.hex.toBytes(pinHash.substr(0, 32));
        const key = AESUtil.hex.toBytes(pinHash.substr(32, 64));
        const data = AESUtil.utf8.fromBytes(new ModeOfOperation.cbc(key, iv).decrypt(
            AESUtil.hex.toBytes(storage[1])));
        const checksum = sha512(pinHash + data);
        if(checksum == storage[0]) {
            return JSON.parse(data);
        }
        return undefined;
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
