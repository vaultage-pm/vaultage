import * as vaultage from 'vaultage-client';
import { AddCommand } from './commands/Add';
import { AuthCommand } from './commands/Auth';
import { ClearCommand } from './commands/Clear';
import { ConfigCommand } from './commands/Config';
import { CopyCommand } from './commands/Copy';
import { DumpCommand } from './commands/Dump';
import { EditCommand } from './commands/Edit';
import { GenCommand } from './commands/Gen';
import { GetCommand } from './commands/Get';
import { HelpCommand } from './commands/Help';
import { HideCommand } from './commands/Hide';
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
import { html } from './security/xss';
import { TimeoutService } from './TimeoutService';
import { Shell } from './webshell/Shell';
import { Terminal } from './webshell/Terminal';


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

    installGlobalHooks(ctx);

    shell.setBannerHTML(html`Vaultage v${vaultage.version()}
    <br>*********************
    <br>Feeling lost? Take a look at the <a href="https://github.com/vaultage-pm/vaultage/wiki/Using-the-web-CLI" target="_blank">usage guide</a> or press [Tab] to see available commands.
    <br>*********************`);


    shell.registerCommand(new AddCommand(shell, config, ctx));
    shell.registerCommand(new AuthCommand(shell, ctx, config, timeout));
    shell.registerCommand(new ClearCommand(shell));
    shell.registerCommand(new ConfigCommand(shell, config, timeout));
    shell.registerCommand(new CopyCommand(shell, config, ctx));
    shell.registerCommand(new DumpCommand(shell, ctx));
    shell.registerCommand(new EditCommand(shell, config, ctx));
    shell.registerCommand(new GenCommand(shell, ctx));
    shell.registerCommand(new GetCommand(shell, config, ctx));
    shell.registerCommand(new HelpCommand(shell));
    shell.registerCommand(new ImportCSVCommand(shell, ctx));
    shell.registerCommand(new LogoutCommand(shell, ctx));
    shell.registerCommand(new LsCommand(shell, config, ctx));
    shell.registerCommand(new PullCommand(shell, ctx));
    shell.registerCommand(new PushCommand(shell, ctx));
    shell.registerCommand(new PwdCommand(shell, ctx));
    shell.registerCommand(new RawImportCommand(shell, ctx));
    shell.registerCommand(new ReusedCommand(shell, config, ctx));
    shell.registerCommand(new RmCommand(shell, config, ctx));
    shell.registerCommand(new HideCommand(shell, config, ctx));
    shell.registerCommand(new RotateCommand(shell, config, ctx));
    shell.registerCommand(new WeakCommand(shell, config, ctx));

    shell.printBanner();

    if (config.autoLogin) {
        shell.runCommand(new AuthCommand(shell, ctx, config, timeout), []);
    }
}
