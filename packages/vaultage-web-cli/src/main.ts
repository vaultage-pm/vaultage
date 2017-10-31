import { Vault } from 'vaultage-client';

import { AuthCommand } from './commands/Auth';
import { HelpCommand } from './commands/Help';
import { PrintVaultCommand } from './commands/PrintVault';
import { LsCommand } from './commands/Ls';
import { ProcessCommand } from './commands/Process';
import { Shell } from './webshell/Shell';
import { Terminal } from './webshell/Terminal';

import * as config from '../../config';

const terminal = new Terminal({
    root: document.body
});

const shell = new Shell(terminal);
const vault = new Vault(config.SALTS);

shell.registerCommand(new HelpCommand(shell));
shell.registerCommand(new AuthCommand(vault, shell, config.REMOTE_URL));
shell.registerCommand(new ProcessCommand(shell));
shell.registerCommand(new PrintVaultCommand(vault, shell));
shell.registerCommand(new LsCommand(vault, shell));

shell.printHelp();
