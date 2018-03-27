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
    browser = await puppeteer.launch();

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

describe('The web UI', () => {

    beforeEach(async () => {
        page = await browser.newPage();
        model = new VaultagePOM(page);
        await page.goto(APP_URL);
    });

    test('Can log in', async () => {
        await model.login('john', '1234');
        expect(await model.getLogContents()).toMatch(/Pull OK/);
    });

    test('Can clear the log', async () => {
        await model.login('john', '1234');
        await model.type('clear');
        expect(await model.getLogContents()).not.toMatch(/Pull OK/);
    });

    test('Can add an entry', async () => {
        await model.login('john', '1234');
        await model.type('add');
        await model.type('some title');
        await model.type('some username');
        await model.type('some p@ssword');
        await model.type('http://some-url');
        expect(await model.getLogContents()).toMatch(/Push OK/);

        await model.type('clear');
        await model.type('get some title');
        expect(await model.getLogContents()).toMatch(/Searching for.+some.+title.+, 1 matching entries./);
    });

    test('Can remove an entry', async () => {
        await model.login('john', '1234');
        await model.type('ls');

        const table = await model.readEntryTable();
        if (table.length === 0) {
            throw new Error('There are no entries to remove');
        }
        const id = table[0].id;
        const prevLength = table.length;

        await model.type('clear');
        await model.type(`rm ${id}`);

        const table2 = await model.readEntryTable();
        if (table2.length !== table.length - 1) {
            throw new Error(`Error during deletion: expected ${table.length - 1} entries, but got ${table2.length}.`);
        }
        expect(table2.map((e) => e.id)).not.toContain(id);
    });

    // TODO: m0ar test
});
