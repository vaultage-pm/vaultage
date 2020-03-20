import { anyString, instance, Mock, mock, verify, when } from 'omnimock';

import { PasswordsService } from '../passwords/passwords-service';
import { VaultDB } from './VaultDB';
import { VaultDBService } from './vaultdb-service';

describe('VaultDB.ts can', () => {

    let service: VaultDBService;
    let mockPasswordsService: Mock<PasswordsService>;

    beforeEach(() => {
        mockPasswordsService = mock(PasswordsService);
        when(mockPasswordsService.getPasswordStrength(anyString())).return(1).anyTimes();
        service = new VaultDBService(instance(mockPasswordsService));
    });

    afterEach(() => {
        verify(mockPasswordsService);
    });

    it('create an empty vault from an empty string', () => {
        const db = service.deserialize('');
        expect(db.getAll().length).toEqual(0);
    });

    it('serialize and deserialize a vault', () => {
        const db = new VaultDB(instance(mockPasswordsService), {});
        const e = {
            title: 'Hello',
            login: 'Bob',
            password: 'zephyr',
            url: 'http://example.com'
        };
        db.add(e);
        expect(db.getAll().length).toEqual(1);

        const serialized = service.serialize(db);
        const db2 = service.deserialize(serialized);

        expect(db2.getAll().length).toEqual(1);

        const e2 = db2.get('0');
        expect(e2.id).toEqual('0');
        expect(e.title).toEqual(e2.title);
        expect(e.login).toEqual(e2.login);
        expect(e.password).toEqual(e2.password);
        expect(e.url).toEqual(e2.url);

        // deserialized vault does not lose the count when adding new data
        db2.add(e);
        const e3 = db2.get('1');
        expect(e3.id).toEqual('1');
        expect(e3.title).toEqual(e.title);
        expect(e3.login).toEqual(e.login);
        expect(e3.password).toEqual(e.password);
        expect(e3.url).toEqual(e.url);

        expect(db2.getAll().length).toEqual(2);
        // original db did non change
        expect(db.getAll().length).toEqual(1);
        expect(db2.nextFreeId()).toEqual('2');
        expect(db.nextFreeId()).toEqual('1');
    });
});
