console.log('Loading the transpiled library... Run `make tsc` before running this example');

var vaultage = require('./dist/js/vaultage.js');

console.log('\nDemoing the encryption / decryption locally...');
console.log('Note that this is demoing the inside of the vaultage SDK but all of this complexity' +
  ' is going to be hidden behind the "Vault" class.\n');

var key = vaultage.Crypto.deriveLocalKey('demo', 'demo1');
console.log('My local key is: ' + key + '\n');

var db = new vaultage.VaultDB([{ hello: 'world' }]);
var plain = vaultage.VaultDB.serialize(db);
var fp = vaultage.Crypto.getFingerprint(plain);

console.log('Here is what the db looks like initially: ');
console.log(db);
console.log('Fingerprint: ' + fp);

console.log('\n\nNow I\'m gonna encrypt the db');
var enc = vaultage.Crypto.encrypt(key, plain);

console.log('Here is the cipher:\n');
console.log(enc);

console.log('\n\nAnd now let\'s get back the original:');

var dec = vaultage.Crypto.decrypt(key, enc);
var decFP = vaultage.Crypto.getFingerprint(dec);
var decDB = vaultage.VaultDB.deserialize(dec);

console.log(decDB);
console.log('Fingerprint: ' + decFP);

