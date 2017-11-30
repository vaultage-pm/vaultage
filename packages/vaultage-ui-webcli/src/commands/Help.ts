import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';

export class HelpCommand implements ICommand {
    public readonly name = 'help';

    public readonly description = 'prints this help message';

    constructor(
            private shell: Shell) {
    }

    public handle() {

        this.shell.clearLog();

        this.shell.echoHTML(' ************************************************* ');
        this.shell.echoHTML(this.space(19) + '_ _                   ');
        this.shell.echoHTML(this.space(18) + '| | |                  ');
        this.shell.echoHTML(this.space(1) + '__' + this.space(3) + '____ _ _' + this.space(3) + '_| | |_ __ _' + this.space(2) + '__ _'+this.space(2) + '___ ');
        this.shell.echoHTML(this.space(1) + '\\ \\ / / _` | | | | | __/ _` |/ _` |/ _ \\');
        this.shell.echoHTML(this.space(2) + '\\ V / (_| | |_| | | || (_| | (_| |' + this.space(2) + '__/');
        this.shell.echoHTML(this.space(3) + '\\_/ \\__,_|\\__,_|_|\\__\\__,_|\\__, |\\___|');
        this.shell.echoHTML(this.space(31) + '__/ |     ');
        this.shell.echoHTML(this.space(30) + '|___/      ');
        this.shell.echoHTML(' ');
        this.shell.echoHTML(' Authors : Ludovic Barman, Hadrien Milano');
        this.shell.echoHTML(' Github : <a href=\'https://github.com/lbarman/vaultage/\'>github.com/lbarman/vaultage</a>');
        this.shell.echoHTML(' ');
        this.shell.echoHTML(' Vaultage is a password manager.');
        this.shell.echoHTML(' It is in-browser, and can be accessed from all your devices.');
        this.shell.echoHTML(' The password are encrypted/decrypted in your browser : no plaintext goes through the network.');
        this.shell.echoHTML(' It is self-hosted : install it securely on your own server (see on github).');
        this.shell.echoHTML(' It is open-source : please report any bugs on github');
        this.shell.echoHTML(' ');
        this.shell.echoHTML(' Security technologies used : the <a href=\'https://bitwiseshiftleft.github.io/\'>Stanford Javascript Crypto Library</a>, using SHA256 / PBKDF2 as hash functions, and AES (256bits).');
        this.shell.echoHTML(' Plaintext passwords never leave your computer\'s memory. ');
        this.shell.echoHTML(' ');
        this.shell.echoHTML(' Trouble getting started ? Typical workflow : ');
        this.shell.echoHTML(' 1. <i>auth</i>');
        this.shell.echoHTML(' 2. <i>new</i>, or <i>gen</i>');
        this.shell.echoHTML(' 3. <i>get TERM</i>, where TERM is one of your password\'s login, title, url, etc.');
        this.shell.echoHTML(' 4. maybe <i>edit</i>, or <i>rm</i>');
        this.shell.echoHTML(' 5. <i>clear</i> or <i>logout</i>');
        this.shell.echoHTML(' ');
        this.shell.echoHTML(' ************************************************* ');

        this.shell.printHelp();
        this.shell.echoHTML('');
        this.shell.echoHTML(' ************************************************* ');
    }

    private space(n: number): string {
        let s = '';
        for (let i = 0; i < n; i++) {
            s += '&nbsp;';
        }
        return s;
    }
}
