console.log('Loading the transpiled library... Run `make tsc` before running this example');

import { Crypto, config, VaultDB } from './vaultage';

console.log('\nDemoing the encryption / decryption locally...');
console.log('Note that this is demoing the inside of the vaultage SDK but all of this complexity' +
  ' is going to be hidden behind the "Vault" class.\n');

const crypto = new Crypto(config, {
    USERNAME_SALT: "abcdef"
});

const key = crypto.deriveLocalKey('demo', 'demo1');
console.log('My local key is: ' + key + '\n');

const db = new VaultDB(config, { '1': {
    title: "Hello",
    id: "1",
    created: "now",
    updated: "",
    login: "Bob",
    password: "zephyr",
    usageCount: 10,
    url: "http://example.com"
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
const decDB = VaultDB.deserialize(config, dec);

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

//test the entryUsed()
let e = db.get("1")
if(e.usageCount != 10){
    console.log("Test3: UsageCount should be 10, FAIL")
    ret = 1;
} else {
    console.log("Test3: UsageCount has the correct value (1), OK")
}
db.entryUsed("1")
let e2 = db.get("1")
if(e2.usageCount != 11){
    console.log("Test3: UsageCount should be 11, FAIL")
    ret = 1;
} else {
    console.log("Test3: UsageCount has the correct value (2), OK")
}
db.entryUsed("1")

process.exit(ret);