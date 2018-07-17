import * as copy from 'copy-to-clipboard';

declare global {
    // tslint:disable-next-line:interface-name
    interface Window {
        copyPasswordToClipboard: (evt: Event) => void;
    }
}

/**
 * Installs functions on the global scope that printed content can tap into to provide
 * enhanced user interaction beyond what a naive terminal could do.
 */
export function installGlobalHooks() {

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
        return;
    };

    function toggleCopiedElement($copied: HTMLElement) {
        $copied.classList.add('visible');
        setTimeout(() => $copied.classList.remove('visible'), 1000);
    }

}
