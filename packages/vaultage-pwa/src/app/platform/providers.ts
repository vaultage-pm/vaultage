import { InjectionToken } from '@angular/core';
import { Vaultage } from 'vaultage-client';

export const LOCAL_STORAGE = new InjectionToken<Storage>('LocalStorage');
export const VAULTAGE = new InjectionToken<Vaultage>('Vaultage');
