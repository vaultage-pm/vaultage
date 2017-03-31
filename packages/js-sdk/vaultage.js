'use strict';

// Cross platform XHRs (node + browserify)
var xhr = require('xhr');
// For password hashing
var SHA256 = require('crypto-js/sha256.js');
// For vault encryption
var AES = require('crypto-js/aes.js');
var Utf8 = require('crypto-js/enc-utf8.js');


/**
 * @constructor
 * @class Vaultage
 * @exports Vaultage
 * @version 0.1-dev
 */
function Vaultage() {
    var _this = this;
    var _localPwdHash;
    var _remotePwdHash;
    var _serverURL;
    var _username;


    /**
     * Attempts to pull the cipher and decode it. Saves credentials on success
     * @return {void}
     * @param {string} serverURL URL to the vaultage server.
     * @param {string} username The username used to locate the cipher on the server
     * @param {string} localPassword The local password used to decode the cipher
     * @param {string} remotePassword The remote password used to locate the cipher on the server
     * @param {function} cb Callback invoked with (err, vaultage_instance) on completion. If an error occured, err is non-null 
     */
    this.auth = function(serverURL, username, localPassword, remotePassword, cb) {
        var remotePwdHash = SHA256(remotePassword);
        var localPwdHash = SHA256(localPassword);

        var url = serverURL + username + '/' + remotePwdHash + '/do'; //do is just for obfuscation

        xhr({
            url: url
        }, function(err, resp) {

            var body = JSON.parse(resp.body);

            if (err) {
                cb(err);
                return;
            }
            if (body.error != null && body.error === true) {
                cb('Wrong username / remote password (or DB link inactive).');
                return;
            }

            var cipher = (body.data || '').replace(/[^a-z0-9+/]/ig, '');

            if (!cipher || !body.data) {
                cb('Pull success, 0 entries. Future entries will be encrypted with the provided local password.');
                setCredentials(serverURL, username, remotePwdHash, localPwdHash);
            } else {
                var plain = AES.decrypt(cipher, localPwdHash, {
                    format: JsonFormatter
                }).toString(Utf8);
                notes = JSON.parse(plain);
                cb('Pull success, retrieved ' + notes.length + ' entries.');

                setCredentials(serverURL, username, remotePwdHash, localPwdHash);
            }

            //compute reuse table
            _.each(notes, function(note){
                addToReuseTable(note.content);
            });
        });
    };

    /**
     * @return {number} the number of entries in the db.
     * @throws If this vault is not authenticated.
     */
    this.getNbEntries = function() {
        ensureAuth();
    };

    /**
     * Checks whether this instance has had a successful authentication since the last deauthentication.
     * 
     * @return {boolean} true if there was a successful authentication
     */
    this.isAuth = function() {
        // Weak equality with null also checks undefined
        return (_serverURL != null && _username != null && _localPwdHash != null && _remotePwdHash != null);
    };

    /**
     * 
     */
    this.pull = function() {

    };


    // Private methods

    function setCredentials(url, username, localPwdHash, remotePwdHash) {
        _serverURL = url;
        _username = username;
        _localPwdHash = localPwdHash;
        _remotePwdHash = remotePwdHash;
    }

    function ensureAuth() {
        if (!_this.isAuth()) {
            throw new Error('This vault is not authenticated!');
        }
    }
}

module.exports = Vaultage;