import { config } from '../src/Vault';
import { ERROR_CODE, VaultageError } from '../src/VaultageError';
import { VaultDB, VaultDBEntryAttrs } from '../src/VaultDB';

describe('The Vault database', () => {
    let db: VaultDB;

    let entry: VaultDBEntryAttrs;

    beforeEach(() => {
        db = new VaultDB(config, {});
        entry = {
            title: 'The entry',
            login: 'Asterix',
            password: 'potion magique',
            url: 'http://boulemagique.org'
        };
    });

    describe('entries', () => {
        it('can be added', () => {
            const id = db.add(entry);
            const inserted = db.get(id);
            for (let attr in entry) {
                expect(inserted[attr]).toEqual(entry[attr]);
            }
        });

        it('can be removed', () => {
            const id = db.add(entry);
            db.remove(id);
            try {
                db.get(id);
            } catch(e) {
                expect((e as VaultageError).code).toEqual(ERROR_CODE.NO_SUCH_ENTRY);
            }
        });

        it('are deep copied on insertion', () => {
            const id = db.add(entry);
            entry.login = 'modified';
            entry.password = 'modified';
            entry.title = 'modified';
            entry.url = 'modified';
            const inserted = db.get(id);
            for (let attr in entry) {
                expect(inserted[attr]).not.toEqual(entry[attr]);
            }
        });

        it('are deep copied on retreival', () => {
            const id = db.add(entry);
            const inserted = db.get(id);
            inserted.login = 'modified';
            inserted.password = 'modified';
            inserted.title = 'modified';
            inserted.url = 'modified';
            const inserted2 = db.get(id);
            for (let attr in entry) {
                expect(inserted2[attr]).toEqual(entry[attr]);
            }
        });

        it('can be updated (canonical form)', () => {
            const id = db.add(entry);
            entry.login = 'Buzz';
            entry.password = 'Lightning';
            db.update(id, {
                login: 'Buzz',
                password: 'Lightning'
            });
            let inserted = db.get(id);
            for (let attr in entry) {
                expect(inserted[attr]).toEqual(entry[attr]);
            }
            entry.title = 'Toy Story';
            entry.url = 'http//infinity.to';
            db.update(id, {
                title: 'Toy Story',
                url: 'http//infinity.to'
            });
            inserted = db.get(id);
            for (let attr in entry) {
                expect(inserted[attr]).toEqual(entry[attr]);
            }
        });

        it('can be updated (shortcut form)', () => {
            const id = db.add(entry);
            const inserted = db.get(id);
            inserted.login = 'Buzz';
            inserted.password = 'Lightning';
            inserted.title = 'Toy Story';
            inserted.url = 'http//infinity.to';
            db.update(inserted);
            const result = db.get(id);
            for (let attr in inserted) {
                expect(result[attr]).toEqual(inserted[attr]);
            }
        });

        it('cannot update nonexistant entries (canonical form)', () => {
            try {
                db.update('nonexist', {});
                fail();
            } catch(e) {
                expect((e as VaultageError).code).toEqual(ERROR_CODE.NO_SUCH_ENTRY);
            }
        });

        it('cannot update nonexistant entries (shortcut form)', () => {
            try {
                db.update({
                    id: 'nonexist',
                    title: 'bar', login: 'foo', password: 'baz', url: 'wrong', created: 'doesnt', updated: 'matter'
                });
                fail();
            } catch(e) {
                expect((e as VaultageError).code).toEqual(ERROR_CODE.NO_SUCH_ENTRY);
            }
        });

        it('throws when removing nonexistant', () => {
            db.add(entry);
            try {
                db.remove('doesnt-exist');
            } catch(e) {
                expect((e as VaultageError).code).toEqual(ERROR_CODE.NO_SUCH_ENTRY);
            }
        });
    });

    describe('search', () => {
        it('can search by login', () => {
            db.add(entry);
            expect(db.find('Asterix').length).toEqual(1);
        });

        it('can search by id', () => {
            const id = db.add(entry);
            expect(db.find(id).length).toEqual(1);
        });

        it('can search by title', () => {
            db.add(entry);
            expect(db.find('The entry').length).toEqual(1);
        });

        it('can search by url', () => {
            db.add(entry);
            expect(db.find('boulemagique').length).toEqual(1);
        });

        it('returns empty if nothing matches', () => {
            db.add(entry);
            expect(db.find('laboulemagique').length).toEqual(0);
        });
    });

    describe('size', () => {
        it('is equal to the number of entries', () => {
            expect(db.size()).toEqual(0);
            db.add(entry);
            expect(db.size()).toEqual(1);
        });
    });

    describe('serialization', () => {
        it('Padds short entries', () => {
            db.add({
                title: 'foo',
                password: 'bar',
                url: 'http://short/',
                login: 'lorell'
            });

            expect(VaultDB.serialize(db).length).toEqual(config.BYTES_PER_ENTRY + config.MIN_DB_LENGTH);
        });

        it('creates an exact copy', () => {
            db.add(entry);
            expect(VaultDB.deserialize(config, VaultDB.serialize(db))).toEqual(db);
        });

        it('cannot deserialize a DB with a wrong version', () => {
            try {
                VaultDB.deserialize(config, `{"entries":[
                    {
                        "id":"5c352b3a-28f8-c99b-a1d2-020bcc99c7de",
                        "title":"The entry",
                        "url":"http://boulemagique.org",
                        "login":"Asterix",
                        "password":"potion magique",
                        "created":"Mon, 10 Jul 2017 22:03:21 GMT",
                        "updated":"Mon, 10 Jul 2017 22:03:21 GMT"
                    }],"v":"001","r":"000001"}`);
                fail('Expected an exception');
            } catch(e) {
                expect((e as VaultageError).code).toEqual(ERROR_CODE.DB_ERROR);
            }
        });

        it('cannot deserialize a DB with duplicates', () => {
            try {
                VaultDB.deserialize(config, `{"entries":[
                    {
                        "id":"5c352b3a-28f8-c99b-a1d2-020bcc99c7de",
                        "title":"The entry","url":"http://boulemagique.org",
                        "login":"Asterix",
                        "password":"potion magique",
                        "created":"Mon, 10 Jul 2017 22:03:21 GMT",
                        "updated":"Mon, 10 Jul 2017 22:03:21 GMT"
                    },{
                        "id":"5c352b3a-28f8-c99b-a1d2-020bcc99c7de",
                        "title":"The second entry","url":"http://boulemagique.org",
                        "login":"Asterix II",
                        "password":"potion magique",
                        "created":"Mon, 10 Jul 2017 22:03:21 GMT",
                        "updated":"Mon, 10 Jul 2017 22:03:21 GMT"
                    }],"v":"000","r":"000001"}`);
                fail('Expected an exception');
            } catch(e) {
                expect((e as VaultageError).code).toEqual(ERROR_CODE.DUPLICATE_ENTRY);
            }
        });
    });
});