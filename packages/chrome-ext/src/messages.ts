import { IVaultDBEntry } from 'vaultage-client';

import { defineMessage, IMessage } from './Messenger';

export const LOGIN_MESSAGE: IMessage<{
    username: string,
    password: string,
    host: string
}, {
    entries: IVaultDBEntry[]
}> = defineMessage('login');


export const USE_PASSWORD_MESSAGE: IMessage<{
    password: string
}, void> = defineMessage('usePassword');

export const INJECT_PASSWORD: IMessage<{
    password: string
}, void> = defineMessage('injectPassword');
