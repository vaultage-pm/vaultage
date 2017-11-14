export enum PasswordStrength {
    WEAK = 1,
    MEDIUM,
    STRONG
};

export class Passwords {
    
        /**
         * Returns a strong password
         * @param length the number of characters in the outputted password (strict)
         * @param useSymbols use symbols to generate the passwords
         * @param avoidSimilarCharacters avoid the use of visually similar characters, e.g. l and 1
         * @param avoidPunctuationUsedInProgramming avoid special characters used for punctuation (might be confusing, e.g. " or \)
         * @return {string} a password
         * @throws If window.crypto is not accessible (old browsers)
         */
        public generatePassword(length, useSymbols, avoidSimilarCharacters, avoidPunctuationUsedInProgramming): string {
    
            let result: string[] = []
            let i = 0;
            let numberOfDigits = 0;
            let numberOfSymbols = 0;
    
            //pick L=length letters, L/2 uppercase, L/2 lowercase in mean
            for (i = 0; i < length; i++) {
                if (this.getRandomNumber() % 2 === 0) {
                    result[i] = this.getRandomCharFromArray(this.charMapLetters(avoidSimilarCharacters)).toUpperCase();
                } else {
                    result[i] = this.getRandomCharFromArray(this.charMapLetters(avoidSimilarCharacters));
                }
            }
            //decide on a number of numbers to inject
            numberOfDigits = this.getRandomNumberInRange(length);
            for (i = 0; i < numberOfDigits; i++) {
                let pos = this.getRandomNumberInRange(length)
                let val = this.getRandomCharFromArray(this.charMapNumbers(avoidSimilarCharacters));
                result[pos] = val;
            }
            //if use symbols, to the same
            if (useSymbols) {
                numberOfSymbols = this.getRandomNumberInRange(length);
                for (i = 0; i < numberOfSymbols; i++) {
                    let pos = this.getRandomNumberInRange(length)
                    let val = this.getRandomCharFromArray(this.charMapSymbols(avoidPunctuationUsedInProgramming));
                    result[pos] = val;
                }
            }
            return result.join('');
        }
    
        private charMapSymbols(avoidCharactersUsedInProgramming: boolean): string[] {
            if (avoidCharactersUsedInProgramming) {
                return ["!", "%", "^", "*", "-", "_", "=", "+", ";", ":", "~", "|", "."]; // 13 characters
            }
            return [" ", "!", "\"", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+", "[", "{", "]", "}", ";", ":", "'", "@", "#", "~", "|", ",", "<", ".", ">", "/", "?", "\\"]; //32 characters
        }
        private charMapLetters(avoidSimilarCharacter: boolean): string[] {
            if (avoidSimilarCharacter) {
                return ["a", "b", "c", "d", "e", "f", "g", "h", "j", "k", "m", "n", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
            }
            return ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        }
        private charMapNumbers(avoidSimilarCharacters: boolean): string[] {
            if (avoidSimilarCharacters) {
                return ["2", "3", "4", "5", "6", "7", "8", "9"];
            }
            return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        }
    
        /**
         * Returns a random number using window.crypto if possible
         * @return {number} a random number
         * @throws If window.crypto is not accessible (old browsers)
         */
        private getRandomNumber(): number {
            // crypto.getRandomValues needs a TypedArray; Uint8Array is the smallest one (don’t waste entropy)
            try {
                let typedArrayWithRandomNumber = new Uint8Array(1);
                // Use crypto random functionality if the browser supports it
                if (window.crypto && window.crypto.getRandomValues) {
                    window.crypto.getRandomValues(typedArrayWithRandomNumber);
                    return typedArrayWithRandomNumber[0];
                }
            } catch (e) {
                // If the browser doesn’t support crypto random functionality, use Math.random
                if (!window.crypto || !window.crypto.getRandomValues) {
    
                    throw new Error("Your browser only supports Math.Random as an entropy source. Refusing to generate a weak password. Please update your browser.")
                        //return Math.floor(Math.random() * 255); // 256 is the size of a Uint8Array, which the other statements in this function use
                }
            }
            return -1;
        }
    
        /**
         * Returns a random letter from an array of letters
         * @param letters array of letters A
         * @return {string} a random letter in A
         */
        private getRandomCharFromArray(letters: string[]): string {
            const i = this.getRandomNumber() % letters.length;
            return letters[i];
        }
    
        /**
         * Returns a random number in [0, upperLimit[
         * @param upperLimit
         * @return {number} a random number in [0, upperLimit[
         */
        private getRandomNumberInRange(upperLimit: number) {
            return (this.getRandomNumber() % upperLimit);
        }

        /**
         * Returns an indication (heuristic) on the strength of a password (higher is better)
         * @param password the password to test
         * @return {PasswordStrength} an indication on the strength of a password
         */
        public static getPasswordStrength(password: string) : PasswordStrength {
            const index = this._getPasswordStrength(password)

            if(index < 30){
                return PasswordStrength.WEAK
            } else if(index <= 60) {
                return PasswordStrength.MEDIUM
            }
            return PasswordStrength.STRONG
        }

        private static _getPasswordStrength(password : string) : number {

            if(password.length < 8){
                return 0;
            }
            const hasDigits = /\d/.test(password);
            const hasUpper = /\d/.test(password);
            
            if(password.length < 14 && !hasDigits && !hasUpper){
                return 0;
            }

            let score = 0;
            if (!password)
                return score;
        
            // award every unique letter until 5 repetitions
            let letters = new Object();
            for (var i=0; i<password.length; i++) {
                letters[password[i]] = (letters[password[i]] || 0) + 1;
                score += 5.0 / letters[password[i]];
            }
        
            // bonus points for mixing it up
            let variations = {
                digits: /\d/.test(password),
                lower: /[a-z]/.test(password),
                upper: /[A-Z]/.test(password),
                nonWords: /\W/.test(password),
            }
        
            let variationCount = 0;
            for (let check in variations) {
                variationCount += (variations[check] == true) ? 1 : 0;
            }
            score += (variationCount - 1) * 10;
        
            return Math.floor(score);
        }
    }