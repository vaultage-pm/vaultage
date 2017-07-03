function theSymbols(bAvoidCharactersUsedInProgramming) { "use strict";
	if (bAvoidCharactersUsedInProgramming) {
		return ["!", "%", "^", "*", "-", "_", "=", "+", ";", ":", "~", "|", "."]; // 13 characters
	}
	return [" ", "!", "\"", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+", "[", "{", "]", "}", ";", ":", "'", "@", "#", "~", "|", ",", "<", ".", ">", "/", "?", "\\"]; //32 characters
}
function theLetters(bAvoidSimilarCharacters) { "use strict";
	if (bAvoidSimilarCharacters) {
		return ["a", "b", "c", "d", "e", "f", "g", "h", "j", "k", "m", "n", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
	}
	return ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
}
function theNumbers(bAvoidSimilarCharacters) { "use strict";
	if (bAvoidSimilarCharacters) {
		return ["2", "3", "4", "5", "6", "7", "8", "9"];
	}
	return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
}
function getRandomNumber() { "use strict";
	// crypto.getRandomValues needs a TypedArray; Uint8Array is the smallest one (don’t waste entropy)
	try {
		var typedArrayWithRandomNumber = new Uint8Array(1);
		// Use crypto random functionality if the browser supports it
		if (window.crypto && window.crypto.getRandomValues) {
			window.crypto.getRandomValues(typedArrayWithRandomNumber);
			return typedArrayWithRandomNumber[0];
		}
		// Use Microsoft’s crypto random functionality if the browser supports it
		if (window.msCrypto && window.msCrypto.getRandomValues) {
			window.msCrypto.getRandomValues(typedArrayWithRandomNumber);
			return typedArrayWithRandomNumber[0];
		}
	} catch (e) {
		// If the browser doesn’t support crypto random functionality, use Math.random
		if (!(window.crypto && window.crypto.getRandomValues) && !(window.msCrypto && window.msCrypto.getRandomValues)) {

			alert("Your browser only supports Math.Random as an entropy source. This may lead to weak passwords.")
			return Math.floor(Math.random() * 255);	// 256 is the size of a Uint8Array, which the other statements in this function use
		}
	}
}
// Hat-tip: https://defuse.ca/generating-random-passwords.htm
function getRandomCharacterFromAnArray(theArray) { "use strict";
	var x;
	do {
		x = getRandomNumber();
	} while (x >= theArray.length);
	return theArray[x];
}
function getRandomNumberLessThanOrEqualToALimit(theUpperLimit) { "use strict";
	var x;
	do {
		x = getRandomNumber();
	} while (x >= theUpperLimit);
	return x;
}
function generatePassword(lengthOfPassword, wantSymbols, avoidSimilarCharacters, avoidPunctuationUsedInProgramming) { "use strict";
	var StrongPasswordArray = [],
		i,
		numberOfDigits,
		numberOfSymbols;
	for (i = 0; i < lengthOfPassword; i=i+1) {
		if (getRandomNumber() % 2 === 0) {
			StrongPasswordArray[i] = getRandomCharacterFromAnArray(theLetters(avoidSimilarCharacters)).toUpperCase();
		}
		else {
			StrongPasswordArray[i] = getRandomCharacterFromAnArray(theLetters(avoidSimilarCharacters));
		}
	}
	numberOfDigits = getRandomNumberLessThanOrEqualToALimit(lengthOfPassword);
	for (i = 0; i < numberOfDigits; i=i+1) {
		StrongPasswordArray[(getRandomNumberLessThanOrEqualToALimit(lengthOfPassword)) - 1] = getRandomCharacterFromAnArray(theNumbers(avoidSimilarCharacters));
	}
	if (wantSymbols) {
		numberOfSymbols = getRandomNumberLessThanOrEqualToALimit(lengthOfPassword);
		for (i = 0; i < numberOfSymbols; i=i+1) {
			StrongPasswordArray[(getRandomNumberLessThanOrEqualToALimit(lengthOfPassword)) - 1] = getRandomCharacterFromAnArray(theSymbols(avoidPunctuationUsedInProgramming));
		}
	}
	return StrongPasswordArray;
}
