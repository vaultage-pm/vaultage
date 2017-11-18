import { Passwords, PasswordStrength } from '../src/Passwords';

describe('Passwords.ts', () => {
    let passwords: Passwords = new Passwords
    let defaultLength = 10


    describe('the password generation function', () => {
        it('can be used with any parameters', () => {
            let pwd = passwords.generatePassword(defaultLength, false, true, true)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = passwords.generatePassword(defaultLength, true, true, true)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = passwords.generatePassword(defaultLength, false, false, true)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = passwords.generatePassword(defaultLength, true, false, true)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = passwords.generatePassword(defaultLength, false, true, false)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = passwords.generatePassword(defaultLength, true, true, false)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = passwords.generatePassword(defaultLength, false, false, false)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = passwords.generatePassword(defaultLength, true, false, false)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any length', () => {
            for(let l=1; l<100; l++) {
                let pwd = passwords.generatePassword(l, true, false, false)
                expect(pwd).not.toEqual("");
            }
        });
    })


    describe('the password strength function', () => {
        it('can be used with any parameters', () => {
            let s1 = Passwords.getPasswordStrength("ninja")
            let s2 = Passwords.getPasswordStrength("N1N2N3N4")
            let s3 = Passwords.getPasswordStrength("v9835sy6SP3y8mH")
            let s4 = Passwords.getPasswordStrength("N1Naa23489zasdel123")

            expect(s1).toEqual(PasswordStrength.WEAK)
            expect(s2).toEqual(PasswordStrength.MEDIUM)
            expect(s3).toEqual(PasswordStrength.STRONG)
            expect(s4).toEqual(PasswordStrength.STRONG)
        });
    })
});
