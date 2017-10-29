import { PwdGen } from '../src/PwdGen';

describe('PwdGen.ts', () => {
    let pwdgen: PwdGen = new PwdGen
    let defaultLength = 10


    describe('the password generation function', () => {
        it('can be used with any parameters', () => {
            let pwd = pwdgen.generatePassword(defaultLength, false, true, true)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = pwdgen.generatePassword(defaultLength, true, true, true)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = pwdgen.generatePassword(defaultLength, false, false, true)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = pwdgen.generatePassword(defaultLength, true, false, true)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = pwdgen.generatePassword(defaultLength, false, true, false)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = pwdgen.generatePassword(defaultLength, true, true, false)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = pwdgen.generatePassword(defaultLength, false, false, false)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any parameters', () => {
            let pwd = pwdgen.generatePassword(defaultLength, true, false, false)
            expect(pwd).not.toEqual("");
        });
        it('can be used with any length', () => {
            for(let l=1; l<100; l++) {
                let pwd = pwdgen.generatePassword(l, true, false, false)
                expect(pwd).not.toEqual("");
            }
        });
    })
});
