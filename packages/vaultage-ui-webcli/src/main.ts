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

const shell = new Shell(terminal);
const config = new Config(shell);

shell.registerCommand(new HelpCommand(shell));
shell.registerCommand(new AuthCommand(shell, config));
shell.registerCommand(new LsCommand(shell));
shell.registerCommand(new GetCommand(shell));
shell.registerCommand(new AddCommand(shell));
shell.registerCommand(new GenCommand(shell));
shell.registerCommand(new EditCommand(shell));
shell.registerCommand(new RotateCommand(shell));
shell.registerCommand(new RmCommand(shell));
shell.registerCommand(new PullCommand(shell));
shell.registerCommand(new PushCommand(shell));
shell.registerCommand(new ClearCommand(shell));
shell.registerCommand(new PwdCommand(shell));
shell.registerCommand(new LogoutCommand(shell));
shell.registerCommand(new ReusedCommand(shell));
shell.registerCommand(new WeakCommand(shell));
shell.registerCommand(new DumpCommand(shell));
shell.registerCommand(new RawImportCommand(shell));

shell.echoHTML('   Vaultage v4.0');
shell.echoHTML('*********************');
shell.printShortHelp();
shell.echoHTML('*********************');

config.pull();
