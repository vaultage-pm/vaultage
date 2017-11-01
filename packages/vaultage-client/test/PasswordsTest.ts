import { Passwords } from '../src/Passwords';

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
            let s2 = Passwords.getPasswordStrength("N1N$a")
            let s3 = Passwords.getPasswordStrength("v9835sy6SP3y8mH")
            let s4 = Passwords.getPasswordStrength("N1N$a23489zasdél123")

            expect(s1).toBeLessThan(30) //weak
            expect(s2).toBeLessThan(60) //medium
            expect(s3).toBeGreaterThan(80) //strong
            expect(s4).toBeGreaterThan(80)
        });
    })
});
