var AES = require('aes');

function atob(str) {
  return new Buffer(str, 'base64').toString('binary');
}

// Format all params in hexa
var input = {
  ct: atob('NpYJNVwZmyIO8aVpAV6Md04MgppeKa4K16MlupLBR4lM2rrLYM4yZ0l8njnzW5Urv/CkkDcEECvRVCWoN6dCMWle33gEE6VLly8Cm21RgPdyDpEO3QMsDTmqdmny3YCm8kl61WieAJSBCcUXC6/WFqm6+XPUb9P4ylYPMPAgi9FDc0b5LceqwdudFDZspHrCvtfALodjz5ylVYLTlXWLcb6hOJrslCSvIUAaE8nanUg=').toString(16),
  iv: '74b120326ff858a862d062c7443b29c0',
  s: '9373095f6c028e27'
};

// Takes an hex string and returns bytes
function hexToWords(str) {
  if (str.length % 8 != 0) {
    throw new Error('This only works with values multiple of 32 bits');
  }
  var len = str.length / 8;
  var words = new Uint32Array(len);

  for (var i = 0 ; i < len ; i++) {
    var s = str.substr(i * 8, 8);
    words[i] = parseInt(s, 16);
  }

  return words;
}

function wordsToString(words) {
  var str = '';
  for (var i = 0 ; i < words.length ; i++) {
    var word = words[i];
    str += String.fromCharCode(
      (word >> 24) & 0xff,
      (word >> 16) & 0xff,
      (word >> 8)  & 0xff,
       word        & 0xff
    );
  }

  return str;
}

function stringToWords(str) {
  
  var utf8 = unescape(encodeURIComponent(str));

  if (utf8.length % 4 != 0) {
    throw new Error('Invalid string length');
  }

  var len = utf8.length / 4;
  var words = new Uint32Array(len);

  for (var i = 0; i < utf8.length / 4; i++) {
      words[i] = 
        (utf8.charCodeAt(i * 4) & 0xff) << 24 |
        (utf8.charCodeAt(i * 4 + 1) & 0xff) << 16 |
        (utf8.charCodeAt(i * 4 + 2) & 0xff) << 8  |
        (utf8.charCodeAt(i * 4 + 3) & 0xff);
  }

  return words;
}

function encryptAll(key, pt, iv) {
  if ((pt.length % 4) !== 0) {
    throw new Error('Invalid cypher length: ' + ct.length);
  }

  var ct = new Uint32Array(pt.length);
  var aes = new AES(key);

  var salt = iv;

  for (var i = 0 ; i < pt.length / 4 ; i++) {
    var slice = pt.slice(i * 4, (i + 1) * 4);

    for (var j = 0; j < 4; j++) {
      slice[j] ^= salt[j];
    }

    var encrypted = aes.encrypt(slice);

    ct[(i * 4)] = encrypted[0];
    ct[(i * 4) + 1] = encrypted[1];
    ct[(i * 4) + 2] = encrypted[2];
    ct[(i * 4) + 3] = encrypted[3];

    salt = ct.slice(i * 4, (i + 1) * 4);
  }

  return ct;
}

function decryptAll(key, ct, iv) {
  if ((ct.length % 4) !== 0) {
    throw new Error('Invalid cypher length: ' + ct.length);
  }

  var pt = new Uint32Array(ct.length);
  var aes = new AES(key);
  var salt = iv;

  for (var i = 0 ; i < ct.length / 4 ; i++) {

    var decrypted = aes.decrypt(ct.slice(i * 4, (i + 1) * 4));

    for (var j = 0; j < 4; j++) {
      decrypted[j] ^= salt[j];
    }

    pt[(i * 4)] = decrypted[0];
    pt[(i * 4) + 1] = decrypted[1];
    pt[(i * 4) + 2] = decrypted[2];
    pt[(i * 4) + 3] = decrypted[3];

    salt = decrypted;
  }

  return pt;
}

var key = [-759183358, 1587843930, -2140159394, -97350189, 1226814440, -1692643536, -1779302743, -688977432 ];
var iv = hexToWords(input.iv);
var pt = " hello world ! .";

var ptBytes = stringToWords(pt);

var ctBytes = encryptAll(key, ptBytes, iv);

console.log(ctBytes);

var decrypted = wordsToString(decryptAll(key, ctBytes, iv));

console.log(decrypted);

