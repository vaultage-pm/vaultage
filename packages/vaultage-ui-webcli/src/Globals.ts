import * as copy from 'copy-to-clipboard';
import { Context } from './Context';

declare global {
    // tslint:disable-next-line:interface-name
    interface Window {
        copyPasswordToClipboard: (evt: Event) => void;
        expandFoldedResult: (evt: Event) => void;
    }
}

/**
 * Installs functions on the global scope that printed content can tap into to provide
 * enhanced user interaction beyond what a naive terminal could do.
 */
export function installGlobalHooks(ctx: Context) {

    window.copyPasswordToClipboard = (evt: Event) => {
        const $e = (evt.currentTarget as HTMLElement);
        const pwd = $e.innerText;

        // copy the password to the clipboard
        copy(pwd);

        // Highlight the visual hint to show that the password was copied
        let $copied: HTMLElement | null = $e.nextElementSibling as HTMLElement;
        while ($copied != null) {
            if ($copied.classList.contains('copied')) {
                toggleCopiedElement($copied);
                break;
            }
            $copied = $copied.nextElementSibling as HTMLElement;
        }

        // Increase the usage count
        const entryId = $e.getAttribute('data-id');
        if (entryId !== null) {
            ctx.vault.entryUsed(entryId);
            ctx.vault.save().then(() => {
                console.log('Push OK, revision ' + ctx.vault.getDBRevision() + '.');
            }).catch((reason: any) => {
                console.log('Error', reason);
            });
        }


        return;
    };

    function toggleCopiedElement($copied: HTMLElement) {
        $copied.classList.add('visible');
        setTimeout(() => $copied.classList.remove('visible'), 1000);
    }


    window.expandFoldedResult = (evt: Event) => {
        const $e = (evt.currentTarget as HTMLElement);
        const $hiddenTable: HTMLElement | null = $e.nextElementSibling as HTMLElement;

        if ($hiddenTable != null) {
            $hiddenTable.style.display = 'block';
        }
        return;
    };

}
