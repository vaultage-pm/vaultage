import { InjectionToken } from '@angular/core';
import * as vt from 'vaultage-client';

export class Vaultage {
    static staticControl = vt;
    control = Vaultage.staticControl;
}

export const LOCAL_STORAGE = new InjectionToken<Storage>('LocalStorage');
export const VAULTAGE = new InjectionToken<Vaultage>('Vaultage');
export const WINDOW = new InjectionToken<Window>('Window');
