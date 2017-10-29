import { Credentials } from '../src/Vault';
import { Vault } from '../src/Vault';
import { RequestCallback } from 'request';
import { Crypto } from '../src/Crypto';
import { VaultDB, VaultDBEntry } from '../src/VaultDB';
import { VaultageError, ERROR_CODE } from '../src/VaultageError';

describe('Vault', () => {
    let vault: Vault;
    let request: jasmine.Spy;
    let VaultDBSpy: typeof VaultDB;
    let vaultDBSpy: VaultDB;
    let credentials: Credentials;
    let entry: VaultDBEntry;
    let cryptoSpy: Crypto;

    beforeEach(() => {
        vault = new Vault();
        request = jasmine.createSpy('request');
        VaultDBSpy = jasmine.createSpyObj('VaultDB constructor', Object.keys(VaultDB));
        vaultDBSpy = jasmine.createSpyObj('VaultDB', Object.keys(VaultDB.prototype));
        cryptoSpy = jasmine.createSpyObj('crypto', Object.keys(Crypto.prototype));
        spyOn(vault, '_request').and.returnValue(request);
        spyOn(vault, '_VaultDB').and.returnValue(VaultDBSpy);
        credentials = {
            localKey: 'tehLocalKey',
            remoteKey: 'tehRemoteKey',
            serverURL: 'http://foo',
            username: 'jaques'
        };
        entry = {
            login: 'john',
            password: 'snow',
            title: 'watch',
            url: 'http://the.wat.cz',
            id: '12',
            created: '01/02/2017',
            updated: '01/03/2017'
        };
    });

    describe('.auth', () => {
        describe('with no crypto configured yet', () => {
            it('pulls the config and retries', () => {
                const cbSpy = jasmine.createSpy('callback');

                request.and.callFake((_: any, cb: RequestCallback) => {

                    const authSpy = spyOn(vault, 'auth');

                    const body = JSON.stringify({
                        salts: {
                            USERNAME_SALT: '1234'
                        }
                    });
                    cb(null, { body } as any, body);
    
                    // Expect Vault to retry authentication
                    expect(authSpy).toHaveBeenCalled();
                });

                vault.auth('http://foo', 'jaques', 'jaaaques!', cbSpy);
                
                expect(cbSpy).not.toHaveBeenCalled();
                expect(request).toHaveBeenCalledWith({
                    url: 'http://foo/jaques/null/config'
                }, jasmine.any(Function));
            });
        });
        describe('with crypto already configured', () => {
            
            beforeEach(() => {
                vault._setCrypto(cryptoSpy);
                (cryptoSpy.deriveLocalKey as jasmine.Spy).and.returnValue('tehLocalKey');
                (cryptoSpy.deriveRemoteKey as jasmine.Spy).and.returnValue('tehRemoteKey');
                (cryptoSpy.decrypt as jasmine.Spy).and.returnValue('opaque decrypted');
                (VaultDBSpy.deserialize as jasmine.Spy).and.returnValue(vaultDBSpy);
            });
            it('pulls the cipher', () => {
                const cbSpy = jasmine.createSpy('callback').and.callFake((err) => {
                    if (err) {
                        fail('Unexpected error: ' + err);
                    }
                });

                request.and.callFake((_: any, cb: RequestCallback) => {
                    const body = JSON.stringify({
                        data: 'opaque DB data'
                    });
                    cb(null, { body } as any, body);
                })

                expect(vault.isAuth()).toEqual(false);

                vault.auth('http://foo', 'jaques', 'jaaaques!', cbSpy);

                expect(cryptoSpy.deriveLocalKey).toHaveBeenCalled();
                expect(cryptoSpy.deriveRemoteKey).toHaveBeenCalled();
                expect(cryptoSpy.decrypt).toHaveBeenCalledWith('tehLocalKey', 'opaqueDBdata');
                expect(request).toHaveBeenCalledWith({
                    url: 'http://foo/jaques/tehRemoteKey/pull'
                }, jasmine.any(Function));
                expect(cbSpy).toHaveBeenCalled();

                expect(vault.isAuth()).toEqual(true);
            });
        });
    });

    describe('.unauth()', () => {
        it('clears everything', () => {
            vault._setCreds(credentials);
            vault._setDB(vaultDBSpy);
            vault.unauth();
            expect(vault._getCreds).toThrow();
            expect(vault._getDB).toThrow();
        });
    });

    describe('test accessors', () => {
        describe('getDB', () => {
            it('Throws an error if there is no DB', () => {
                try {
                    vault._getDB();
                    fail('Expected an error');
                } catch(e) {
                    expect(e.code).toEqual(ERROR_CODE.NOT_AUTHENTICATED);
                }
            });

            it('Returns the DB if there is one', () => {
                vault._setDB(vaultDBSpy);
                expect(vault._getDB()).toBe(vaultDBSpy);
            });
        });
        describe('getCreds', () => {
            it('Throws an error if there is no cred', () => {
                try {
                    vault._getCreds();
                    fail('Expected an error');
                } catch(e) {
                    expect(e.code).toEqual(ERROR_CODE.NOT_AUTHENTICATED);
                }
            });

            it('Returns the DB if there is one', () => {
                vault._setCreds(credentials);
                expect(vault._getCreds()).toBe(credentials);
            });
        });
        describe('getCrypto', () => {
            it('Throws an error if there is no cred', () => {
                try {
                    vault._getCrypto();
                    fail('Expected an error');
                } catch(e) {
                    expect(e.code).toEqual(ERROR_CODE.NOT_AUTHENTICATED);
                }
            });

            it('Returns the DB if there is one', () => {
                vault._setCrypto(cryptoSpy);
                expect(vault._getCrypto()).toBe(cryptoSpy);
            });
        });
    });

    describe('db proxy methods', () => {
        beforeEach(() => {
            vault._setDB(vaultDBSpy);
        });
        describe('getNbEntries', () => {
            it('Proxies to underlying DB', () => {
                (vaultDBSpy.size as jasmine.Spy).and.returnValue(42);
                expect(vault.getNbEntries()).toEqual(42);
                expect(vaultDBSpy.size).toHaveBeenCalled();
            });
        });
        describe('addEntry', () => {
            it('Proxies to underlying DB', () => {
                const entry = {};
                vault.addEntry(entry);
                expect(vaultDBSpy.add).toHaveBeenCalledWith(entry);
            });
        });
        describe('removeEntry', () => {
            it('Proxies to underlying DB', () => {
                const id = '12';
                vault.removeEntry(id);
                expect(vaultDBSpy.remove).toHaveBeenCalledWith(id);
            });
        });
        describe('findEntries', () => {
            it('Proxies to underlying DB', () => {
                const query = 'hello';
                const ret = [entry];
                (vaultDBSpy.find as jasmine.Spy).and.returnValue(ret);
                expect(vault.findEntries(query)).toEqual(ret);
                expect(vaultDBSpy.find).toHaveBeenCalledWith(query);
            });
        });
        describe('getAllEntries', () => {
            it('Proxies to underlying DB', () => {
                const ret = [entry];
                (vaultDBSpy.find as jasmine.Spy).and.returnValue(ret);
                expect(vault.getAllEntries()).toEqual(ret);
                expect(vaultDBSpy.find).toHaveBeenCalledWith('');
            });
        });
        describe('updateEntry', () => {
            it('Proxies to underlying DB', () => {
                (vaultDBSpy.get as jasmine.Spy).and.returnValue(entry);
                expect(vault.updateEntry('12', entry)).toEqual(entry);
                expect(vaultDBSpy.get).toHaveBeenCalledWith('12');
                expect(vaultDBSpy.update).toHaveBeenCalledWith('12', entry);
            });
        });
        describe('getEntry', () => {
            it('Proxies to underlying DB', () => {
                (vaultDBSpy.get as jasmine.Spy).and.returnValue(entry);
                expect(vault.getEntry('12')).toEqual(entry);
                expect(vaultDBSpy.get).toHaveBeenCalledWith('12');
            });
        });
    });
});