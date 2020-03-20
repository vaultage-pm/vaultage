import { injectable } from 'inversify';
import { W3CCryptoProvider } from './w3c-crypto-provider';

export interface IRandomness {
    getRandomNumber(): number;
}
export const IRandomness = Symbol('IRandomness');

@injectable()
export class ConcreteRandomnessGenerator implements IRandomness {

    constructor(private readonly w3CCryptoProvider: W3CCryptoProvider) {}

    /**
     * Returns a random number using window.crypto if possible
     * @return {number} a random number
     * @throws If window.crypto is not accessible (old browsers)
     */
    public getRandomNumber(): number {
        const typedArrayWithRandomNumber = new Uint32Array(1);
        const crypto = this.w3CCryptoProvider.getCrypto();
        crypto.getRandomValues(typedArrayWithRandomNumber);
        return typedArrayWithRandomNumber[0];
    }
}
