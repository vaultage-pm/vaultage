import * as puppeteer from 'puppeteer';

export interface IEntry {
    id: string;
    login: string;
    password: string;
    title: string;
    url: string;
}

/**
 * Vaultage Page Object Model.
 *
 * Abstraction over the page for testing purposes.
 */
export class VaultagePOM {

    constructor(private page: puppeteer.Page) {
    }

    public async login(username: string, password: string): Promise<void> {
        await this.page.keyboard.type('auth\n');
        await this.page.keyboard.type(username + '\n');
        await this.page.keyboard.type(password + '\n');
        await this.waitFinishProcessing();
    }

    public async type(input: string): Promise<void> {
        await this.page.keyboard.type(input + '\n');
        await this.waitFinishProcessing();
    }

    public async waitFinishProcessing(): Promise<void> {
        let result;
        do {
            await new Promise((resolve) => setTimeout(resolve, 100));
            result = await this.page.evaluate(() => {
                const el = document.querySelector('.prompt');
                if (el == null) {
                    return true;
                }
                return !/^[\\\/\|-]/.test(el.innerHTML);
            });
        } while (result !== true);
    }

    public getInputContents(): Promise<string> {
        return this.page.evaluate(() => {
            const el = document.querySelector('#main_input');
            if (el == null) {
                return '';
            }
            return (el as HTMLInputElement).value;
        });
    }

    public getLogContents(): Promise<string> {
        return this.page.evaluate(() => {
            const el = document.querySelector('.log');
            if (el == null) {
                return '';
            }
            return el.innerHTML;
        });
    }

    public isLoggedIn(): Promise<boolean> {
        return this.getLogContents().then((log) => /Pull OK/.test(log));
    }

    public readEntryTable(): Promise<IEntry[]> {
        return this.page.evaluate(() => {
            const items = document.querySelectorAll('.entry');
            if (items == null) {
                return '';
            }
            const ret: IEntry[] = [];
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0 ; i < items.length ; i++) {
                const item = items[i];
                ret.push({
                    id: (item.querySelector('.id') as HTMLElement).innerText,
                    login: (item.querySelector('.login') as HTMLElement).innerText,
                    password: (item.querySelector('.password') as HTMLElement).innerText,
                    title: (item.querySelector('.title') as HTMLElement).innerText,
                    url: (item.querySelector('.url') as HTMLElement).innerText
                });
            }
            return ret;
        });
    }
}
