import { anything, instance, Mock, mock, mockInstance, when } from 'omnimock';

import { ConcreteRandomnessGenerator, IRandomness } from './randomness-generator';
import { W3CCryptoProvider } from './w3c-crypto-provider';

describe('RandomnessGenerator', () => {
    let rng: IRandomness;
    let crypto: Mock<Crypto>;

    beforeEach(() => {
        const w3cCryptoProvider = mockInstance(W3CCryptoProvider, {
            getCrypto: () => instance(crypto)
        });
        crypto = mock<Crypto>('crypto');
        rng = new ConcreteRandomnessGenerator(w3cCryptoProvider);
    });

    it('returns a random number generated with the secure rng', () => {
        when(crypto.getRandomValues(anything())).call(arr => {
            if (arr) {
                arr[0] = 1337;
            }
            return arr;
        });
        expect(rng.getRandomNumber()).toBe(1337);
    });
    it('throws if no secure rng is available', () => {
        when(crypto.getRandomValues(anything())).throw(new Error('Crypto not available'))
        expect(() => rng.getRandomNumber()).toThrow(/Crypto not available/);
    });
});
