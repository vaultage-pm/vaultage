import { IVaultDBEntry, PasswordStrength } from 'vaultage-client';

import { Config } from './Config';
import { escape, html, join, SanitizedString } from './security/xss';

const copyPasswordHook: keyof Window = 'copyPasswordToClipboard';

export class VaultEntryFormatter {

    constructor(
        private config: Config) {
    }

    /**
     * Formats a collection of VaultDBEntries to HTML
     * @param entries
     */
    public formatAndHighlightBatch(entries: IVaultDBEntry[], highlights?: string[]): SanitizedString {
        const stringBuilder = join(entries.map((e) => this._formatSingleForBatch(e, highlights)));

        if (stringBuilder.isEmpty()) {
            return stringBuilder;
        }

        return html`<table class="entryCollection">${stringBuilder}</table>`;
    }

    /**
     * Formats a VaultDBEntry to HTML
     * @param e the VaultDBEntry
     */
    public formatSingle(e: IVaultDBEntry): SanitizedString {

        const extraClass =  (e.password_strength_indication === PasswordStrength.WEAK) ? 'weakPassword' :
                            (e.password_strength_indication === PasswordStrength.MEDIUM) ? 'mediumPassword' :
                            '';

        return html`<span class="entry">
            <span class="id">(${e.id})</span>
            <span class="title">${e.title}</span>&rarr;
            <span class="login">${e.login}</span>:
            <span ondblclick="${copyPasswordHook}(event)" class="password blurred ${extraClass}" data-id="${e.id}">${e.password}</span>@
            <span class="url"><a target="_blank" href="${e.url}">${e.url}</a></span>
            ${this.config.usageCountVisibility ? html`<span class="use">(used ${e.usage_count} times)</span>` : ''}
            ${(e.reuse_count > 0) ? html`<span class="reuse">(warning: re-used ${e.reuse_count} times)</span>` : ''}
            <span class="copied">Copied to the clipboard!</span>
        </span>`;
    }

    /**
     * Simply colors the needles with the same highlight colors they would be highlighted
     * when searching a text
     * @param needles
     */
    public searchTermsToHighlightedString(needles: string[]): SanitizedString {
        const stringBuilder: SanitizedString[] = [];
        for (let i = 0; i < needles.length; i++) {
            stringBuilder.push(join([this.highlightPrefix(i), escape(needles[i]), this.highlightSuffix()]));
        }
        return join(stringBuilder, html` `);
    }

    /**
     * Highlights all occurences of the words given
     * @param haystack the text in which the function will highlight words
     * @param needles the words to highlight
     * @param highlightId
     */
    public highlight(haystack: SanitizedString, needles: string[]): SanitizedString {
        return join(this._highlight([haystack], needles));
    }

    private sanitizeAndHighlight(haystack: string, needles?: string[]): SanitizedString {
        if (needles != null) {
            return this.highlight(escape(haystack), needles);
        } else {
            return escape(haystack);
        }
    }

    private _formatSingleForBatch(e: IVaultDBEntry, highlights?: string[]): SanitizedString {

        const extraClass =  (e.password_strength_indication === PasswordStrength.WEAK) ? 'weakPassword' :
                (e.password_strength_indication === PasswordStrength.MEDIUM) ? 'mediumPassword' :
                '';

        return html`<tr class="entry">
                <td class="id">(${this.sanitizeAndHighlight(e.id, highlights)})</td>
                <td class="title">${this.sanitizeAndHighlight(e.title, highlights)}</td> <td>&rarr;</td>
                <td class="login">${this.sanitizeAndHighlight(e.login, highlights)}</td> <td>:</td>
                <td ondblclick="${copyPasswordHook}(event)" class="password blurred ${extraClass}" data-id="${e.id}">
                    ${this.sanitizeAndHighlight(e.password, highlights)}
                </td>
                <td>@</td>
                <td class="url"><a target="_blank" href="${e.url}">${this.sanitizeAndHighlight(e.url, highlights)}</a></span>
                ${this.config.usageCountVisibility ? html`<span class="use">(used ${e.usage_count} times)</span>` : ''}
                ${(e.reuse_count > 0) ? `<td class="reuse">(warning: re-used ${e.reuse_count} times)</td>` : html`<td class="empty"></td>`}
                <td class="copied">Copied to the clipboard!</td>
        </tr>`;
    }

    /**
     * Every time a 'needle' is found in the haystack function, put this string before
     * @param id the index of the needle (e.g. we already search for some term, and this is the 2nd search term)
     */
    private highlightPrefix(id: number): SanitizedString {
        return html`<span class="highlight highlight${id}">`;
    }

    /**
     * Every time a 'needle' is found in the haystack function, put this string after
     * @param id
     */
    private highlightSuffix(): SanitizedString {
        return html`</span>`;
    }

    /**
     * Helper function, called recursively. The intuition is that we split given one needle, then *on each split parts* we
     * continue with the potential remaining needles recursively, before joining the initial parts with the highlighted search
     * term. This is a more complex way than regex search and replace, but it works with overlapping searches, and searches that
     * could hit the highlighting (e.g. searching for 'git class' would highlight the '<span class...' generated by the first term)
     * @param haystacks an array of text in which we need to highlight stuff
     * @param remainingNeedles the remaining search terms
     * @param highlightId the current search term index (for choosing the highlight color)
     */
    private _highlight(haystacks: SanitizedString[], remainingNeedles: string[], highlightId: number = 0): SanitizedString[] {

        // if we're out of search terms, the 'haystack' does not need to be processed further
        if (remainingNeedles.length === 0) {
            return haystacks;
        }

        const needle = remainingNeedles[0];
        const newRemainingNeedles = remainingNeedles.slice(1);

        // split each haystack given this search term, then process the resulting parts with the remaining search terms
        const newHaystacks = haystacks.map((haystack) =>
                this._highlight(haystack.split(needle), newRemainingNeedles, highlightId + 1));

        // now that we subprocessed other terms, the parts that remains are the one split by our needle. Glue them back together
        // with a highlighted needle (glue)
        const glue = join([this.highlightPrefix(highlightId), escape(needle), this.highlightSuffix()]);
        const res = newHaystacks.map((haystacksEntry) => join(haystacksEntry, glue));

        return res;
    }
}
