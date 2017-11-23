import { Vault } from 'vaultage-client';

import { AddCommand } from './commands/Add';
import { AuthCommand } from './commands/Auth';
import { ClearCommand } from './commands/Clear';
import { DumpCommand } from './commands/Dump';
import { EditCommand } from './commands/Edit';
import { GenCommand } from './commands/Gen';
import { GetCommand } from './commands/Get';
import { HelpCommand } from './commands/Help';
import { LogoutCommand } from './commands/Logout';
import { LsCommand } from './commands/Ls';
import { PullCommand } from './commands/Pull';
import { PushCommand } from './commands/Push';
import { PwdCommand } from './commands/Pwd';
import { RawImportCommand } from './commands/RawImport';
import { ReusedCommand } from './commands/Reused';
import { RmCommand } from './commands/Rm';
import { RotateCommand } from './commands/Rotate';
import { WeakCommand } from './commands/Weak';
import { Shell } from './webshell/Shell';
import { Terminal } from './webshell/Terminal';
import { Config } from 'vaultage-ui-webcli/src/Config';

const terminal = new Terminal({
    root: document.body
});

const vault = new Vault();
const shell = new Shell(terminal, vault);
const config = new Config(shell);

shell.registerCommand(new HelpCommand(shell));
shell.registerCommand(new AuthCommand(vault, shell, config));
shell.registerCommand(new LsCommand(vault, shell));
shell.registerCommand(new GetCommand(vault, shell));
shell.registerCommand(new AddCommand(vault, shell));
shell.registerCommand(new GenCommand(vault, shell));
shell.registerCommand(new EditCommand(vault, shell));
shell.registerCommand(new RotateCommand(vault, shell));
shell.registerCommand(new RmCommand(vault, shell));
shell.registerCommand(new PullCommand(vault, shell));
shell.registerCommand(new PushCommand(vault, shell));
shell.registerCommand(new ClearCommand(shell));
shell.registerCommand(new PwdCommand(vault, shell));
shell.registerCommand(new LogoutCommand(vault, shell));
shell.registerCommand(new ReusedCommand(vault, shell));
shell.registerCommand(new WeakCommand(vault, shell));
shell.registerCommand(new DumpCommand(vault, shell));
shell.registerCommand(new RawImportCommand(vault, shell));

shell.echoHTML('   Vaultage v4.0');
shell.echoHTML('*********************');
shell.printShortHelp();
shell.echoHTML('*********************');

config.pull();
