import { VaultDB, VaultDBEntry } from '../src/VaultDB';

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

        let e2 = db.get("0");
        expect(e2.id).toEqual("0");
        expect(e.title).toEqual(e2.title);
        expect(e.login).toEqual(e2.login);
        expect(e.password).toEqual(e2.password);
        expect(e.url).toEqual(e2.url);

        db.update("0", {
            url: 'https://example2.com'
        })
        expect(db.getAll().length).toEqual(1);

        let e3 = db.get("0");
        expect(e3.id).toEqual("0");
        expect(e3.title).toEqual(e2.title);
        expect(e3.login).toEqual(e2.login);
        expect(e3.password).toEqual(e2.password);
        expect(e3.url).toEqual('https://example2.com');

        db.remove("0");
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

        let e2 = db2.get("0");
        expect(e2.id).toEqual("0");
        expect(e.title).toEqual(e2.title);
        expect(e.login).toEqual(e2.login);
        expect(e.password).toEqual(e2.password);
        expect(e.url).toEqual(e2.url);

        //deserialized vault does not lose the count when adding new data
        db2.add(e);
        let e3 = db2.get("1");
        expect(e3.id).toEqual("1");
        expect(e3.title).toEqual(e.title);
        expect(e3.login).toEqual(e.login);
        expect(e3.password).toEqual(e.password);
        expect(e3.url).toEqual(e.url);

        expect(db2.getAll().length).toEqual(2);
        //original db did non change
        expect(db.getAll().length).toEqual(1);
        expect(db2.nextFreeId()).toEqual("2");
        expect(db.nextFreeId()).toEqual("1");
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

        let e2 = {
            title: "Another",
            login: "EntryWithSamePwd",
            password: "zephyr",
            url: "http://example.com"
        };
        db.add(e2);

        let e3 = {
            title: "Another",
            login: "EntryWith",
            password: "uniquePasswd",
            url: "http://example.com"
        };
        db.add(e3);

        expect(db.get("0").reuse_count).toEqual(1);
        expect(db.get("1").reuse_count).toEqual(1);
        expect(db.get("2").reuse_count).toEqual(0);
        
        expect(db.getEntriesWhichReusePasswords().length).toEqual(2)


        let e4 = {
            title: "Another",
            login: "EntryWith",
            password: "zephyr",
            url: "http://example.com"
        };
        db.add(e4);

        expect(db.get("0").reuse_count).toEqual(2);
        expect(db.get("1").reuse_count).toEqual(2);
        expect(db.get("2").reuse_count).toEqual(0);
        expect(db.get("3").reuse_count).toEqual(2);
        
        expect(db.getEntriesWhichReusePasswords().length).toEqual(3)

        db.update("2", {
            password: 'zephyr'
        })

        expect(db.get("0").reuse_count).toEqual(3);
        expect(db.get("1").reuse_count).toEqual(3);
        expect(db.get("2").reuse_count).toEqual(3);
        expect(db.get("3").reuse_count).toEqual(3);

        expect(db.getEntriesWhichReusePasswords().length).toEqual(4)
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


        expect(db.get("0").usage_count).toEqual(0);
        expect(db.get("0").usage_count).toEqual(0);

        db.entryUsed("0")
        expect(db.get("0").usage_count).toEqual(1);

        db.entryUsed("0")
        expect(db.get("0").usage_count).toEqual(2);
    });



    it('create a vault, which can be parsed to JSON and unparsed', () => {
        let db = new VaultDB({});
        let e = {
            title: "Hello",
            login: "Bob",
            password: "zephyr",
            url: "http://example.com"
        };
        db.add(e);

        let json = JSON.stringify(db.getAll())
        let parsedEntries : VaultDBEntry[] = JSON.parse(json)

        let db2 = new VaultDB({})
        db2.unsafe_replaceAllEntries(parsedEntries)

        expect(db2.getAll().length).toEqual(1);
        expect(db2.get("0").login).toEqual(db.get("0").login);
        expect(db2.get("0").password).toEqual(db.get("0").password);
        expect(db2.get("0").url).toEqual(db.get("0").url);
        expect(db2.get("0").created).toEqual(db.get("0").created);
    });

    it('create a vault, cannot be unparsed from invalid JSON', () => {

        // json misses the property "hidden"
        let invalidJson = '[{"id":"0","title":"Hello","url":"http://example.com","login":"Bob","password":"zephyr","created":"Sun, 05 Nov 2017 17:01:57 GMT","updated":"Sun, 05 Nov 2017 17:01:57 GMT","usage_count":0,"reuse_count":0,"password_strength_indication":1}]'
        let parsedEntries : VaultDBEntry[] = JSON.parse(invalidJson)

        let db2 = new VaultDB({})
        try {
            db2.unsafe_replaceAllEntries(parsedEntries)
            fail("Should not allow invalid JSON")
        } catch(e) {
        }
    });

});