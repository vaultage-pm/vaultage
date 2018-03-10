import { PasswordStrength } from '../src/interface';
import { IRandomness, Passwords } from '../src/Passwords';

/**
 * This test suite is broken.
 *
 *  (#109): mock native crypto and make deterministic tests.
 */
describe('Passwords.ts', () => {

    const seed = 123;
    let rnd: IRandomness;

    let passwords: Passwords;
    const defaultLength = 10;

    beforeEach(() => {
        rnd = new FakeRandomnessGenerator(seed);
        passwords = new Passwords(rnd);
    });

    describe('the password generation function', () => {
        it('can be used with any parameters', () => {
            const pwd = passwords.generatePassword(defaultLength, false, true, true);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwords.generatePassword(defaultLength, true, true, true);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwords.generatePassword(defaultLength, false, false, true);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwords.generatePassword(defaultLength, true, false, true);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwords.generatePassword(defaultLength, false, true, false);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwords.generatePassword(defaultLength, true, true, false);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwords.generatePassword(defaultLength, false, false, false);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwords.generatePassword(defaultLength, true, false, false);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any length', () => {
            for (let l = 1; l < 100; l++) {
                const pwd = passwords.generatePassword(l, true, false, false);
                expect(pwd).not.toEqual('');
            }
        });
    });


    describe('the password strength function', () => {
        it('can be used with any parameters', () => {
            const s1 = Passwords.getPasswordStrength('ninja');
            const s2 = Passwords.getPasswordStrength('N1N2N3N4');
            const s3 = Passwords.getPasswordStrength('v9835sy6SP3y8mH');
            const s4 = Passwords.getPasswordStrength('N1Naa23489zasdel123');

            expect(s1).toEqual(PasswordStrength.WEAK);
            expect(s2).toEqual(PasswordStrength.MEDIUM);
            expect(s3).toEqual(PasswordStrength.STRONG);
            expect(s4).toEqual(PasswordStrength.STRONG);
        });
    });
});

export class FakeRandomnessGenerator implements IRandomness {

    private maxValue: number = 256;

    private primeGroup: number = 257;
    private multiplicativeFactor = 263;
    private currentValue: number = 0;


    constructor(
        private seed: number) {
            this.currentValue = this.seed;
    }

    public getRandomNumber(): number {
        // generates a deterministic random-looking number in Z_p, p=primeGroup
        this.currentValue = (this.currentValue * this.multiplicativeFactor) % this.primeGroup;

        // returns a result in [0, maxValue[. Uniform only if maxValue == primeGroup
        return this.currentValue % this.maxValue;
    }
}
