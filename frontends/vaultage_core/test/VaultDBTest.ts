import { VaultDB } from '../src/VaultDB';

describe('VaultDB.ts can', () => {
    it('create an empty vault', () => {
        let db = new VaultDB({});
        expect(db.getAll().length).toEqual(0);
    });
    it('create a vault, in which one can add an entry, and get it, edit it, delete it', () => {
        let db = new VaultDB({});
        let e = {
            title: "Hello",
            login: "Bob",
            password: "zephyr",
            url: "http://example.com"
        };
        db.add(e);
        expect(db.getAll().length).toEqual(1);

        let e2 = db.get(0);
        expect(e2.id).toEqual(0);
        expect(e.title).toEqual(e2.title);
        expect(e.login).toEqual(e2.login);
        expect(e.password).toEqual(e2.password);
        expect(e.url).toEqual(e2.url);

        db.update(0, {
            url: 'https://example2.com'
        })
        expect(db.getAll().length).toEqual(1);

        let e3 = db.get(0);
        expect(e3.id).toEqual(0);
        expect(e3.title).toEqual(e2.title);
        expect(e3.login).toEqual(e2.login);
        expect(e3.password).toEqual(e2.password);
        expect(e3.url).toEqual('https://example2.com');

        db.remove(0);
        expect(db.getAll().length).toEqual(0);
    });

    it('serialize and deserialize a vault', () => {
        let db = new VaultDB({});
        let e = {
            title: "Hello",
            login: "Bob",
            password: "zephyr",
            url: "http://example.com"
        };
        db.add(e);
        expect(db.getAll().length).toEqual(1);

        let serialized = VaultDB.serialize(db);
        let db2 = VaultDB.deserialize(serialized);

        expect(db2.getAll().length).toEqual(1);

        let e2 = db2.get(0);
        expect(e2.id).toEqual(0);
        expect(e.title).toEqual(e2.title);
        expect(e.login).toEqual(e2.login);
        expect(e.password).toEqual(e2.password);
        expect(e.url).toEqual(e2.url);

        //deserialized vault does not lose the count when adding new data
        db2.add(e);
        let e3 = db2.get(1);
        expect(e3.id).toEqual(1);
        expect(e3.title).toEqual(e.title);
        expect(e3.login).toEqual(e.login);
        expect(e3.password).toEqual(e.password);
        expect(e3.url).toEqual(e.url);

        expect(db2.getAll().length).toEqual(2);
        //original db did non change
        expect(db.getAll().length).toEqual(1);
        expect(db2.nextFreeId()).toEqual(2);
        expect(db.nextFreeId()).toEqual(1);
    });
});