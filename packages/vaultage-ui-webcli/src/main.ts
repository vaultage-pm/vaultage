import { AddCommand } from './commands/Add';
import { AuthCommand } from './commands/Auth';
import { ClearCommand } from './commands/Clear';
import { ConfigCommand } from './commands/Config';
import { DumpCommand } from './commands/Dump';
import { EditCommand } from './commands/Edit';
import { GenCommand } from './commands/Gen';
import { GetCommand } from './commands/Get';
import { HelpCommand } from './commands/Help';
import { ImportCSVCommand } from './commands/ImportCSV';
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
import { Config } from './Config';
import { Context } from './Context';
import { installGlobalHooks } from './Globals';
import { Shell } from './webshell/Shell';
import { Terminal } from './webshell/Terminal';

import * as vaultage from 'vaultage-client';
import { TimeoutService } from './TimeoutService';

export const config = new Config();
export const ctx = new Context();

export function start(el: HTMLElement) {
    const terminal = new Terminal({
        root: el
    });

    const shell = new Shell(terminal);

    const timeout = new TimeoutService(shell, ctx, config);

    timeout.resetTimeout();
    window.addEventListener('keydown', () => timeout.resetTimeout());
    window.addEventListener('mousemove', () => timeout.resetTimeout());

    installGlobalHooks();

    shell.setBannerHTML(`Vaultage v${vaultage.version()}
    <br>*********************
    <br>Feeling lost? Take a look at the <a href="https://github.com/vaultage-pm/vaultage/wiki/Using-the-web-CLI" target="_blank">usage guide</a> or press [Tab] to see available commands.
    <br>*********************`);


    shell.registerCommand(new AddCommand(shell, ctx));
    shell.registerCommand(new AuthCommand(shell, ctx, config, timeout));
    shell.registerCommand(new ClearCommand(shell));
    shell.registerCommand(new ConfigCommand(shell, config, timeout));
    shell.registerCommand(new DumpCommand(shell, ctx));
    shell.registerCommand(new EditCommand(shell, ctx));
    shell.registerCommand(new GenCommand(shell, ctx));
    shell.registerCommand(new GetCommand(shell, ctx));
    shell.registerCommand(new HelpCommand(shell));
    shell.registerCommand(new ImportCSVCommand(shell, ctx));
    shell.registerCommand(new LogoutCommand(shell, ctx));
    shell.registerCommand(new LsCommand(shell, ctx));
    shell.registerCommand(new PullCommand(shell, ctx));
    shell.registerCommand(new PushCommand(shell, ctx));
    shell.registerCommand(new PwdCommand(shell, ctx));
    shell.registerCommand(new RawImportCommand(shell, ctx));
    shell.registerCommand(new ReusedCommand(shell, ctx));
    shell.registerCommand(new RmCommand(shell, ctx));
    shell.registerCommand(new RotateCommand(shell, ctx));
    shell.registerCommand(new WeakCommand(shell, ctx));

    shell.printBanner();
}
