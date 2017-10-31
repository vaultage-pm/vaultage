import { VaultDBEntry } from '../../../vaultage-client/vaultage';
import { Vault } from 'vaultage-client';
import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class LsCommand implements ICommand {
    public readonly name = 'ls';

    public readonly description = 'If authenticated, lists the vault content.';

    constructor(
        private vault: Vault,
        private shell: Shell) {
    }

    public async handle() {
        try {

            let allEntries = this.vault.getAllEntries();

            for (let entry of allEntries) {
                let html = VaultEntryFormatter.format(entry);
                this.shell.echoHTML(html);
            }

        } catch (e) {
            // We could get here for instance if the user sends the ^C control sequence to the terminal
            this.shell.echoHTML('<span class="error">' + e + '</span>');
        }
    }
}

class VaultEntryFormatter {

    public static format(e : VaultDBEntry): string {
        let stringBuilder = '<span class="entry">'

        stringBuilder += `<span class="id">(${e.id})</span>`
        stringBuilder += `<span class="title">${e.title}</span>&rarr;`
        stringBuilder += `<span class="login">${e.login}</span>:`
        stringBuilder += `<span class="password blurred">${e.password}</span>@`
        stringBuilder += `<span class="url">${e.url}</span>`
        stringBuilder += `<span class="use">(used ${e.usage_count})</span>`
        stringBuilder += `<span class="reuse">(re-used ${e.reuse_count})</span>`
        stringBuilder += '</span>'

        return stringBuilder
    }
}