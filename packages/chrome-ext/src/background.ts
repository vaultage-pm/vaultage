import * as vaultage from 'vaultage-client';

import { INJECT_PASSWORD, LOGIN_MESSAGE, USE_PASSWORD_MESSAGE } from './messages';
import { Client, Server } from './Messenger';


let currentTabRequest: chrome.tabs.Tab | null = null;
let currentLoginTabId: number | null = null;

const client = new Client();

chrome.commands.getAll((c) => {
    console.log(c);
});

chrome.commands.onCommand.addListener((command) => {
    console.log(command);
    switch (command) {
        case 'fill':
            chrome.tabs.query(
                { active: true },
                (tab) => {
                    console.log(tab);
                    if (tab.length > 0) {
                        fillWithPassword(tab[0]);
                    }
                });
            break;
        default:
            console.log('Unkonwn command: ' + command);
    }
});

chrome.contextMenus.create({
    title: 'Fill with password...',
    contexts: [ 'editable' ],
    onclick: (_, tab) => fillWithPassword(tab)
});

function fillWithPassword(tab: chrome.tabs.Tab) {
    currentTabRequest = tab;
    chrome.tabs.create({
        index: tab.index + 1,
        url: '/controller.html'
    }, (loginTab) => {
        if (loginTab.id != null) {
            currentLoginTabId = loginTab.id;
        }
    });
}

const server = new Server();

server.on(LOGIN_MESSAGE, async (req) => {
    try {
        // tslint:disable-next-line:no-var-keyword
        var vault = await vaultage.login(req.host, req.username, req.password);
    } catch (e) {
        if ((e as vaultage.VaultageError).code === vaultage.ERROR_CODE.NOT_AUTHORIZED) {
            // We may have to do a basic_auth.
            await attemptAuthBasic(req.host);
            vault = await vaultage.login(req.host, req.username, req.password);
            if (currentLoginTabId != null) {
                chrome.tabs.update(currentLoginTabId, {
                    active: true
                });
            }
        } else {
            throw e;
        }
    }
    if (currentTabRequest != null) {
        const entries = getPasswordsForTab(vault, currentTabRequest);
        return {
            entries
        };
    }
    return { entries: [] };
});

server.on(USE_PASSWORD_MESSAGE, async (req) => {
    if (currentTabRequest == null || currentTabRequest.id == null) {
        throw new Error('Unable to go through');
    }
    const tabId = currentTabRequest.id;
    await client.sendToTab(tabId, INJECT_PASSWORD, { password: req.password });
    chrome.tabs.update(tabId, {
        active: true
    }, () => void 0);
});

server.listen();

function getPasswordsForTab(vault2: vaultage.Vault, tab: chrome.tabs.Tab): vaultage.IVaultDBEntry[] {
    const url = tab.url;
    if (url != null) {
        const results = url.match(/^\w+:\/\/([^\/]+)\//);
        if (results != null) {
            const cleaned = results[1];
            console.log(`Searching passwords for ${cleaned}`);
            return vault2.findEntries(cleaned);
        }
    }
    return [];
}

function attemptAuthContentScript() {
    console.log('success');
}

function attemptAuthBasic(url: string) {
    return new Promise((resolve) => {
        chrome.tabs.create({
            url: url
        }, (tab) => {
            if (tab.id == null) {
                throw new Error('Tab has no id!');
            }

            const tabId = tab.id;

            chrome.tabs.executeScript(tabId, {
                code: attemptAuthContentScript.toString().replace(/^function\(\)/, '')
            }, () => {
                chrome.tabs.remove(tabId, () => {
                    resolve();
                });
            });
        });
    });
}
