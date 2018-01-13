import { ICommand } from '../webshell/ICommand';
import { Shell } from '../webshell/Shell';
import * as vaultage from 'vaultage-client';

export class VersionCommand implements ICommand {
    public readonly name = 'version';

    private defaultURL: string;

    public readonly description = 'Prints the version number of the vaultage packages.';

    constructor(
        private version: string,
        private shell: Shell) {
            this.defaultURL = location.protocol + '//' + location.hostname +
             (location.port ? ':' + location.port : '') + location.pathname;
    }

    public async handle() {

        try {
            $.get(this.defaultURL + 'version').then((serverVersion) => {
                    this.shell.echoHTML('vaultage-server: ' + serverVersion);
                }
            );
        } catch (e) {
            this.shell.echoError(e);
        }

        this.shell.echoHTML('vaultage-client: ' + vaultage.version());
        this.shell.echoHTML('vaultage-web-ui: ' + this.version);

    }
}
