import { PasswordStrength } from 'src/interface';
import { PasswordsService } from 'src/passwords/passwords-service';
import { IRandomness } from './randomness-generator';

describe('PasswordsService', () => {

    const seed = 123;

    let passwordsService: PasswordsService;
    const defaultLength = 10;

    beforeEach(() => {
        const rnd = new FakeRandomnessGenerator(seed);
        passwordsService = new PasswordsService(rnd);
    });

    describe('the password generation function', () => {
        it('can be used with any parameters', () => {
            const pwd = passwordsService.generatePassword(defaultLength, false, true, true);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwordsService.generatePassword(defaultLength, true, true, true);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwordsService.generatePassword(defaultLength, false, false, true);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwordsService.generatePassword(defaultLength, true, false, true);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwordsService.generatePassword(defaultLength, false, true, false);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwordsService.generatePassword(defaultLength, true, true, false);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwordsService.generatePassword(defaultLength, false, false, false);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any parameters', () => {
            const pwd = passwordsService.generatePassword(defaultLength, true, false, false);
            expect(pwd).not.toEqual('');
        });
        it('can be used with any length', () => {
            for (let l = 1; l < 100; l++) {
                const pwd = passwordsService.generatePassword(l, true, false, false);
                expect(pwd).not.toEqual('');
            }
        });
    });


    describe('the password strength function', () => {
        it('can be used with any parameters', () => {
            const s1 = passwordsService.getPasswordStrength('ninja');
            const s2 = passwordsService.getPasswordStrength('N1N2N3N4');
            const s3 = passwordsService.getPasswordStrength('v9835sy6SP3y8mH');
            const s4 = passwordsService.getPasswordStrength('N1Naa23489zasdel123');

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
