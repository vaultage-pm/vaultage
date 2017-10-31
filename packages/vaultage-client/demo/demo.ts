console.log('Loading the transpiled library... Run `make tsc` before running this example');

import { Crypto, VaultDB } from '../vaultage';

console.log('\nDemoing the encryption / decryption locally...');
console.log('Note that this is demoing the inside of the vaultage SDK but all of this complexity' +
  ' is going to be hidden behind the "Vault" class.\n');

const crypto = new Crypto({
    LOCAL_KEY_SALT: "abcdef",
    REMOTE_KEY_SALT: "01234576",
});

const masterKey = "ilovesushi"

const key = crypto.deriveLocalKey(masterKey);
console.log('My local key is: ' + key + '\n');

const db = new VaultDB({ '0': {
    title: "Hello",
    id: "0",
    created: "now",
    updated: "", 
    login: "Bob",
    password: "zephyr",
    url: "http://example.com",
    usage_count: 0,
    reuse_count: 0
}});
const plain = VaultDB.serialize(db);
const fp = crypto.getFingerprint(plain, key);

console.log('Here is what the db looks like initially: ');
console.log(db);
console.log('Fingerprint: ' + fp);

console.log('\n\nNow I\'m gonna encrypt the db');
const enc = crypto.encrypt(key, plain);

console.log('Here is the cipher:\n');
console.log(enc);

console.log('\n\nAnd now let\'s get back the original:');

const dec = crypto.decrypt(key, enc);
const decFP = crypto.getFingerprint(dec, key);
const decDB = VaultDB.deserialize(dec);

console.log(decDB);
console.log('Fingerprint: ' + decFP);

let ret = 0;
if(fp == decFP){
    console.log("Test1 : Fingerprints match, OK")
} else {
    ret = 1;
    console.log("Test1 : Fingerprints match, FAIL")
}
if(plain == dec){
    console.log("Test2 : Databases match, OK")
} else {
    ret = 1;
    console.log("Test2 : Databases match, FAIL")
}

process.exit(ret);