import { Crypto } from './Crypto.node';

import { ISaltsConfig } from '../interface';
import { ICrypto } from './ICrypto';

export function getCrypto(salts: ISaltsConfig): ICrypto {
    return new Crypto(salts);
}
