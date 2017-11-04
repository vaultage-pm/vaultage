import { GetCommand } from './commands/Get';
import { LogoutCommand } from './commands/Logout';
import { ClearCommand } from './commands/Clear';
import * as config from '../config';
import { Vault } from 'vaultage-client';
import { Shell } from './webshell/Shell';
import { Terminal } from './webshell/Terminal';

import { AuthCommand } from './commands/Auth';
import { HelpCommand } from './commands/Help';
import { LsCommand } from './commands/Ls';
import { AddCommand } from './commands/Add';
import { GenCommand } from './commands/Gen';
import { EditCommand } from './commands/Edit';
import { RmCommand } from './commands/Rm';
import { PullCommand } from './commands/Pull';
import { PushCommand } from './commands/Push';

const terminal = new Terminal({
    root: document.body
});

const shell = new Shell(terminal);
const vault = new Vault(config.SALTS);

shell.registerCommand(new HelpCommand(shell));
shell.registerCommand(new AuthCommand(vault, shell, config.REMOTE_URL));
shell.registerCommand(new LsCommand(vault, shell));
shell.registerCommand(new GetCommand(vault,shell));
shell.registerCommand(new AddCommand(vault, shell));
shell.registerCommand(new GenCommand(vault, shell));
shell.registerCommand(new EditCommand(vault, shell));
shell.registerCommand(new RmCommand(vault, shell));
shell.registerCommand(new PullCommand(vault, shell));
shell.registerCommand(new PushCommand(vault, shell));
shell.registerCommand(new ClearCommand(shell));
shell.registerCommand(new LogoutCommand(vault,shell));

shell.echoHTML("   Vaultage v4.0")
shell.echoHTML("*********************")
shell.printShortHelp();
shell.echoHTML("*********************")
