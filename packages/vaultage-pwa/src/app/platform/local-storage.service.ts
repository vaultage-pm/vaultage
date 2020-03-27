import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

    public getStorage(): Storage {
        return localStorage;
    }
}
