import { ChildProcess, spawn } from 'child_process';
import * as puppeteer from 'puppeteer';

import { VaultagePOM } from '../utils/VaultagePOM';

let browser: puppeteer.Browser;
let page: puppeteer.Page;
let model: VaultagePOM;
let server: ChildProcess;

const PORT = 3001;
const APP_URL = `http://localhost:${PORT}`;

// Somewhat unique id to make sure we run tests from a new storage each time.
const randTestId = (Math.random() * 0x1000000).toString(16).substring(0, 6);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

beforeAll(async () => {
    browser = await puppeteer.launch({
        args: [ '--no-sandbox' ]
    });

    // Spawn the server on our port and with a random, hopefully empty, data folder
    server = spawn('node', ['dist/src/main.js', '-p', `${PORT}`, '-d', `.data/${randTestId}`]);

    // Wait until the server is up
    await new Promise((resolve) => {
        let output = '';
        server.stderr.on('data', (chunk: Buffer) => {
            console.error(chunk.toString('utf-8'));
        });
        server.stdout.on('data', (chunk: Buffer) => {
            output += chunk.toString('utf-8');
            if (/Server is listening/.test(output)) {
                resolve();
            }
        });
    });
});

afterAll(async () => {
    await browser.close();
    server.kill();
});

describe('Commands of the web UI', () => {

    beforeEach(async () => {
        page = await browser.newPage();
        model = new VaultagePOM(page);
        await page.goto(APP_URL);
    });

    test('auth', async () => {
        await model.login('john', '1234');
        expect(await model.getLogContents()).toMatch(/Pull OK/);
    });

    test('clear', async () => {
        await model.login('john', '1234');
        await model.type('clear');
        expect(await model.getLogContents()).not.toMatch(/Pull OK/);
    });

    test('add', async () => {
        await model.login('john', '1234');
        await model.type('add');
        await model.type('added_entry');
        await model.type('some username');
        await model.type('some p@ssword');
        await model.type('http://some-url');
        expect(await model.getLogContents()).toMatch(/Push OK/);

        await model.type('clear');
        await model.type('ls');

        const table = await model.readEntryTable();
        const entry = table.find((t) => t.title === 'added_entry');
        if (entry == null) {
            throw new Error('Entry not found');
        }
        expect(entry.login).toEqual('some username');
        expect(entry.password).toEqual('some p@ssword');
        expect(entry.url).toEqual('http://some-url');
    });

    test('gen', async () => {
        await model.login('john', '1234');
        await model.type('gen');
        await model.type('generated_entry');
        await model.type('some username');
        await model.type('http://some-url');
        expect(await model.getLogContents()).toMatch(/Push OK/);

        await model.type('clear');
        await model.type('ls');

        const table = await model.readEntryTable();
        const entry = table.find((t) => t.title === 'generated_entry');
        if (entry == null) {
            throw new Error('Entry not found');
        }
        expect(entry.login).toEqual('some username');
        expect(entry.password).not.toEqual('');
        expect(entry.url).toEqual('http://some-url');
    });

    test('edit', async () => {
        await model.login('john', '1234');
        await model.type('ls');

        const table = await model.readEntryTable();
        if (table.length === 0) {
            throw new Error('There are no entries to remove');
        }
        const id = table[0].id;
        const prevLength = table.length;

        await model.type(`edit ${id}`);

        // Confirm everything
        await model.type('');
        await model.type('');
        await model.type('');
        await model.type('');
        await model.type('y');

        await model.type('clear');
        await model.type('ls');
        // Entry should not have changed
        expect((await model.readEntryTable())[0]).toEqual(table[0]);

        await model.type(`edit ${id}`);
        // Change everything
        await model.clearInput();
        await model.type('editedTitle');
        await model.clearInput();
        await model.type('editedUser');
        await model.clearInput();
        await model.type('editedPassword');
        await model.clearInput();
        await model.type('editedURL');
        await model.type('y');

        await model.type('clear');
        await model.type('ls');

        const table2 = await model.readEntryTable();
        expect(table2[0].login).toEqual('editedUser');
        expect(table2[0].password).toEqual('editedPassword');
        expect(table2[0].title).toEqual('editedTitle');
        expect(table2[0].url).toEqual('editedURL');
    });

    test('rm', async () => {
        await model.login('john', '1234');
        await model.type('ls');

        const table = await model.readEntryTable();
        if (table.length === 0) {
            throw new Error('There are no entries to remove');
        }
        const id = table[0].id;

        await model.type(`rm ${id}`);
        // Cancel
        await model.type('');
        await model.type('clear');
        await model.type('ls');

        // Nothing is removed
        expect(await model.readEntryTable()).toHaveLength(table.length);

        await model.type(`rm ${id}`);
        await model.type('y');
        await model.type('clear');
        await model.type('ls');

        const table2 = await model.readEntryTable();
        if (table2.length !== table.length - 1) {
            throw new Error(`Error during deletion: expected ${table.length - 1} entries, but got ${table2.length}.`);
        }
        expect(table2.map((e) => e.id)).not.toContain(id);
    });

    test('logout', async () => {
        await model.login('john', '1234');

        await model.type('ls');
        expect(await model.hasError()).toBe(false);

        await model.type('logout');
        await model.type('clear');

        await model.type('ls');
        expect(await model.hasError()).toBe(true);
    });

    test('pull', async () => {
        await model.login('john', '1234');
        await model.type('pull');
        expect(await model.hasError()).toBe(false);
    });

    test('push', async () => {
        await model.login('john', '1234');
        await model.type('push');
        expect(await model.hasError()).toBe(false);
    });

    test('pwd', async () => {
        await model.login('john', '1234');

        await model.type('pwd');
        await model.type('thispasswordisactuallyquitesimple');
        await model.type('thispasswordisactuallyquitesimple');
        expect(await model.hasError()).toBe(false);

        await model.type('clear');
        await model.login('john', 'thispasswordisactuallyquitesimple');
        expect(await model.hasError()).toBe(false);

        await model.type('pwd');
        await model.type('1234');
        await model.type('1234');
        await model.type('y'); // Confirm weak password
        await model.login('john', '1234');
        expect(await model.hasError()).toBe(false);
    });
});
