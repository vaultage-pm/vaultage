import { Vault } from 'vaultage-client';

import { AsyncCommand } from './commands/Auth';
import { HelpCommand } from './commands/Help';
import { PrintVaultCommand } from './commands/PrintVault';
import { ProcessCommand } from './commands/Process';
import { PullCommand } from './commands/Pull';
import { PushCommand } from './commands/Push';
import { Shell } from './Shell';
import { Terminal } from './terminal/Terminal';

const terminal = new Terminal({
    root: document.body
});

const shell = new Shell(terminal);
const vault = new Vault();

shell.addCommand(new HelpCommand(shell));
shell.addCommand(new PushCommand());
shell.addCommand(new PullCommand());
shell.addCommand(new AsyncCommand());
shell.addCommand(new ProcessCommand(shell));
shell.addCommand(new PrintVaultCommand(vault, shell));

shell.printHelp();
