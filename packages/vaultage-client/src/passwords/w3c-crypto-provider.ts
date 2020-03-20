import { injectable } from 'inversify';

/**
 * Provides a W3C crypto implementation if available.
 */
@injectable()
export class W3CCryptoProvider {

    /* istanbul ignore next */
    getCrypto(): Crypto {
        if (window.crypto && window.crypto.getRandomValues) {
            return window.crypto;
        }
        throw new Error('Crypto is not available in this runtime.')
    }
}