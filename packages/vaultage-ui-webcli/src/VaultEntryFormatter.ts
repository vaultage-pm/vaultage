import { PasswordStrength } from 'vaultage-client';
import { IVaultDBEntry } from 'vaultage-client';

export class VaultEntryFormatter {
    /**
     * Formats a collection of VaultDBEntries to HTML
     * @param entries
     */
    public static formatBatch(entries: IVaultDBEntry[]): string {
        let stringBuilder = '<table class="entryCollection">';

        for (const e of entries) {
            stringBuilder += this._formatSingleForBatch(e);
        }

        return stringBuilder + '</table>';
    }

    /**
     * Formats a VaultDBEntry to HTML
     * @param e the VaultDBEntry
     */
    public static formatSingle(e: IVaultDBEntry): string {
        let stringBuilder = '<span class="entry">';

        stringBuilder += `<span class="id">(${e.id})</span>`;
        stringBuilder += `<span class="title">${e.title}</span>&rarr;`;
        stringBuilder += `<span class="login">${e.login}</span>:`;
        stringBuilder += `<span class="password blurred" ondblclick="console.log(${e.id})">${e.password}</span>@`;
        stringBuilder += `<span class="url">${e.url}</span>`;

        stringBuilder += `<span class="use">(used ${e.usage_count} times)</span>`;

        if (e.password_strength_indication === PasswordStrength.WEAK) {
            stringBuilder += `<span class="weakPassword">(warning: very weak password)</span>`;
        } else if (e.password_strength_indication === PasswordStrength.MEDIUM) {
            stringBuilder += `<span class="mediumPassword">(warning: weak password)</span>`;
        }

        if (e.reuse_count > 0) {
            stringBuilder += `<span class="reuse">(warning: re-used ${e.reuse_count} times)</span>`;
        }
        stringBuilder += '</span>';

        return stringBuilder;
    }

    /**
     * Formats the VaultDBEntries, and highlight the terms matching the argument
     * @param entries the VaultDBEntries
     * @param highlights all terms to highlight
     */
    public static formatAndHighlightBatch(entries: IVaultDBEntry[], highlights: string[]): string {

        const _this = this;
        const coloredEntries = entries.map((e: IVaultDBEntry) => {
            e.title = _this.highlight(e.title, highlights);
            e.login = _this.highlight(e.login, highlights);
            e.password = _this.highlight(e.password, highlights);
            e.url = _this.highlight(e.url, highlights);
            return e;
        });

        return this.formatBatch(coloredEntries);
    }

    /**
     * Formats the VaultDBEntry, and highlight the terms matching the argument
     * @param e the VaultDBEntry
     * @param highlights all terms to highlight
     */
    public static formatAndHighlight(e: IVaultDBEntry, highlights: string[]): string {

        e.title = this.highlight(e.title, highlights);
        e.login = this.highlight(e.login, highlights);
        e.password = this.highlight(e.password, highlights);
        e.url = this.highlight(e.url, highlights);

        return this.formatSingle(e);
    }

    /**
     * Simply colors the needles with the same highlight colors they would be highlighted
     * when searching a text
     * @param needles
     */
    public static searchTermsToHighlightedString(needles: string[]): string {
        let stringBuilder = '';
        for (let i = 0; i < needles.length; i++) {
            stringBuilder += this.highlightPrefix(i) + needles[i] + this.highlightSuffix() + ' ';
        }
        return stringBuilder.trim();
    }

    /**
     * Highlights all occurences of the words given
     * @param haystack the text in which the function will highlight words
     * @param needles the words to highlight
     * @param highlightId
     */
    public static highlight(haystack: string, needles: string[]): string {
        return this._highlight([haystack], needles).join('');
    }

    private static _formatSingleForBatch(e: IVaultDBEntry): string {
        let stringBuilder = '<tr class="entry">';

        stringBuilder += `<td class="id">(${e.id})</td>`;
        stringBuilder += `<td class="title">${e.title}</td> <td>&rarr;</td>`;
        stringBuilder += `<td class="login">${e.login}</td> <td>:</td>`;
        stringBuilder += `<td class="password blurred" ondblclick="console.log(${e.id})">${e.password}</td> <td>@</td>`;
        stringBuilder += `<td class="url">${e.url}</span>`;

        stringBuilder += `<td class="use">(used ${e.usage_count} times)</td>`;

        if (e.password_strength_indication === PasswordStrength.WEAK) {
            stringBuilder += `<td class="weakPassword">(warning: very weak password)</td>`;
        } else if (e.password_strength_indication === PasswordStrength.MEDIUM) {
            stringBuilder += `<td class="mediumPassword">(warning: weak password)</td>`;
        } else {
            stringBuilder += '<td></td>';
        }

        if (e.reuse_count > 0) {
            stringBuilder += `<td class="reuse">(warning: re-used ${e.reuse_count} times)</td>`;
        } else {
            stringBuilder += '<td></td>';
        }
        stringBuilder += '</tr>';

        return stringBuilder;
    }

    /**
     * Every time a 'needle' is found in the haystack function, put this string before
     * @param id the index of the needle (e.g. we already search for some term, and this is the 2nd search term)
     */
    private static highlightPrefix(id: number): string {
        return '<span class="highlight highlight' + id + '">';
    }

    /**
     * Every time a 'needle' is found in the haystack function, put this string after
     * @param id
     */
    private static highlightSuffix(): string {
        return '</span>';
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
    private static _highlight(haystacks: string[], remainingNeedles: string[], highlightId: number = 0): string[] {

        // if we're out of search terms, the 'haystack' does not need to be processed further
        if (remainingNeedles.length === 0) {
            return haystacks;
        }

        const needle = remainingNeedles[0];
        const newRemainingNeedles = remainingNeedles.slice(1);

        // split each haystack given this search term, then process the resulting parts with the remaining search terms
        const newHaystacks = haystacks.map((haystack) => this._highlight(haystack.split(needle), newRemainingNeedles, highlightId+1));

        // now that we subprocessed other terms, the parts that remains are the one split by our needle. Glue them back together
        // with a highlighted needle (glue)
        const glue = this.highlightPrefix(highlightId) + needle + this.highlightSuffix();
        const res = newHaystacks.map((haystacksEntry) => haystacksEntry.join(glue));

        return res;
    }
}