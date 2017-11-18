import 'reflect-metadata';

import * as fs from 'fs';
import { Container } from 'typedi';

import { AuthenticationError } from '../src/storage/AuthenticationError';
import { IDatabaseContents, JSONDatabase, JSONDatabaseWithAuth } from '../src/storage/JSONDatabase';
import { NotFastForwardError } from '../src/storage/NotFastForwardError';

jest.mock('fs');

const fakeDBOnDisk: IDatabaseContents = {
    data: 'foobar',
    hash: 'lehash',
    password: 'secret',
    username: 'Mr T',
    version: 1
};

const newDBOnDisk: IDatabaseContents = {
    data: 'new data',
    hash: 'new hash',
    password: 'secret',
    username: 'Mr T',
    version: 1
};

describe('JSONDatabaseWithAuth', () => {

    beforeEach(() => {
        Container.set('cipherLocation', '/the/location');
    });

    describe('.auth', () => {

        it('rejects for invalid credentials', async () => {
            const db = Container.get(JSONDatabaseWithAuth);
            (fs.readFileSync as jest.Mock).mockImplementationOnce(() => JSON.stringify(fakeDBOnDisk));

            const auth = db.auth({
                username: 'john',
                password: 'cena'
            });

            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith('/the/location', { encoding: 'utf-8' });
            await expect(auth).rejects.toBeInstanceOf(AuthenticationError);
        });

        it('resolves with a JSONDatabase for valid credentials', async () => {
            const db = Container.get(JSONDatabaseWithAuth);
            (fs.readFileSync as jest.Mock).mockImplementationOnce(() => JSON.stringify(fakeDBOnDisk));

            const result = await db.auth({
                username: 'Mr T',
                password: 'secret'
            });

            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith('/the/location', { encoding: 'utf-8' });
            expect(result).toEqual(new JSONDatabase('/the/location', 'Mr T', 'secret'));
        });

        it('resolves with an empty JSONDatabase if there is no file', async () => {
            const db = Container.get(JSONDatabaseWithAuth);
            (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
                throw { code: 'ENOENT' };
            });

            const result = await db.auth({
                username: 'Mr T',
                password: 'secret'
            });

            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith('/the/location', { encoding: 'utf-8' });
            expect(result).toEqual(new JSONDatabase('/the/location', 'Mr T', 'secret'));
        });
    });
});

describe('JSONDatabase', () => {

    describe('.save', () => {

        it('overwrites the previous DB if fast forward', async () => {
            const db = new JSONDatabase('/custom/location', 'Mr T', 'secret');
            (fs.existsSync as jest.Mock).mockImplementationOnce(() => true);
            (fs.readFileSync as jest.Mock).mockImplementationOnce(() => JSON.stringify(fakeDBOnDisk));
            (fs.writeFileSync as jest.Mock).mockImplementationOnce((location, strData, opts) => {
                expect(location).toEqual('/custom/location');
                expect(opts).toEqual({ encoding: 'utf-8' });
                expect(JSON.parse(strData)).toEqual(newDBOnDisk);
            });

            const data = await db.save({
                force: false,
                new_data: newDBOnDisk.data,
                new_hash: newDBOnDisk.hash,
                old_hash: fakeDBOnDisk.hash
            });

            expect(fs.existsSync as jest.Mock).toHaveBeenCalledTimes(1);
            expect(fs.existsSync as jest.Mock).toHaveBeenCalledWith('/custom/location');
            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith('/custom/location', { encoding: 'utf-8' });
            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
            expect(data).toEqual(newDBOnDisk.data);
        });

        it('throws an error if not fast forward', async () => {
            const db = new JSONDatabase('/custom/location', 'Mr T', 'secret');
            (fs.existsSync as jest.Mock).mockImplementationOnce(() => true);
            (fs.readFileSync as jest.Mock).mockImplementationOnce(() => JSON.stringify(fakeDBOnDisk));

            const result = db.save({
                force: false,
                new_data: newDBOnDisk.data,
                new_hash: newDBOnDisk.hash,
                old_hash: 'garbage'
            });

            expect(fs.existsSync as jest.Mock).toHaveBeenCalledTimes(1);
            expect(fs.existsSync as jest.Mock).toHaveBeenCalledWith('/custom/location');
            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith('/custom/location', { encoding: 'utf-8' });
            expect(fs.writeFileSync).not.toHaveBeenCalled();

            await expect(result).rejects.toBeInstanceOf(NotFastForwardError);
        });

        it('bypasses the fast forward check if the force is true', async () => {
            const db = new JSONDatabase('/custom/location', 'Mr T', 'secret');
            (fs.writeFileSync as jest.Mock).mockImplementationOnce((location, strData, opts) => {
                expect(location).toEqual('/custom/location');
                expect(opts).toEqual({ encoding: 'utf-8' });
                expect(JSON.parse(strData)).toEqual(newDBOnDisk);
            });

            const data = await db.save({
                force: true,
                new_data: newDBOnDisk.data,
                new_hash: newDBOnDisk.hash,
                old_hash: 'garbage'
            });

            expect(fs.existsSync as jest.Mock).not.toHaveBeenCalled();
            expect(fs.readFileSync).not.toHaveBeenCalled();
            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
            expect(data).toEqual(newDBOnDisk.data);
        });

        it('writes the file without reading if it does not exist', async () => {
            const db = new JSONDatabase('/custom/location', 'Mr T', 'secret');
            (fs.existsSync as jest.Mock).mockImplementationOnce(() => false);
            (fs.writeFileSync as jest.Mock).mockImplementationOnce((location, strData, opts) => {
                expect(location).toEqual('/custom/location');
                expect(opts).toEqual({ encoding: 'utf-8' });
                expect(JSON.parse(strData)).toEqual(newDBOnDisk);
            });

            const data = await db.save({
                force: false,
                new_data: newDBOnDisk.data,
                new_hash: newDBOnDisk.hash,
                old_hash: 'garbage'
            });

            expect(fs.existsSync as jest.Mock).toHaveBeenCalledTimes(1);
            expect(fs.existsSync as jest.Mock).toHaveBeenCalledWith('/custom/location');
            expect(fs.readFileSync).not.toHaveBeenCalled();
            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
            expect(data).toEqual(newDBOnDisk.data);
        });

        it('updates the password if a new password is provided', async () => {
            const db = new JSONDatabase('/custom/location', 'Mr T', 'secret');
            (fs.existsSync as jest.Mock).mockImplementationOnce(() => true);
            (fs.readFileSync as jest.Mock).mockImplementationOnce(() => JSON.stringify(fakeDBOnDisk));
            (fs.writeFileSync as jest.Mock).mockImplementationOnce((location, strData, opts) => {
                expect(location).toEqual('/custom/location');
                expect(opts).toEqual({ encoding: 'utf-8' });
                expect(JSON.parse(strData)).toEqual({ ...newDBOnDisk, password: 'terces' });
            });

            const data = await db.save({
                force: false,
                new_data: newDBOnDisk.data,
                new_hash: newDBOnDisk.hash,
                old_hash: fakeDBOnDisk.hash,
                new_password: 'terces'
            });

            expect(fs.existsSync as jest.Mock).toHaveBeenCalledTimes(1);
            expect(fs.existsSync as jest.Mock).toHaveBeenCalledWith('/custom/location');
            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith('/custom/location', { encoding: 'utf-8' });
            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
            expect(data).toEqual(newDBOnDisk.data);
        });
    });

    describe('.load', () => {
        it('reads the file and returns its content', async () => {
            const db = new JSONDatabase('/custom/location', 'Mr T', 'secret');
            (fs.readFileSync as jest.Mock).mockImplementationOnce(() => JSON.stringify(fakeDBOnDisk));

            const data = await db.load();

            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith('/custom/location', { encoding: 'utf-8' });
            expect(data).toEqual(fakeDBOnDisk.data);
        });

        it('returns an empty string if the file does not exist', async () => {
            const db = new JSONDatabase('/custom/location', 'Mr T', 'secret');
            (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
                throw { code: 'ENOENT' };
            });

            const data = await db.load();

            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith('/custom/location', { encoding: 'utf-8' });
            expect(data).toEqual('');
        });

        it('forwards any other error', async () => {
            const db = new JSONDatabase('/custom/location', 'Mr T', 'secret');
            (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
                throw { code: 'EDIR' };
            });

            const result = db.load();

            expect(fs.readFileSync).toHaveBeenCalledTimes(1);
            expect(fs.readFileSync).toHaveBeenCalledWith('/custom/location', { encoding: 'utf-8' });
            await expect(result).rejects.toEqual({ code: 'EDIR' });
        });
    });
});
