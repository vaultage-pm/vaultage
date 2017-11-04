import { VaultDBEntry } from 'vaultage-client';

export class VaultEntryFormatter {
    
        public static format(e : VaultDBEntry): string {
            let stringBuilder = '<span class="entry">'
    
            stringBuilder += `<span class="id col1">(${e.id})</span>`
            stringBuilder += `<span class="title col2">${e.title}</span>&rarr;`
            stringBuilder += `<span class="login col3">${e.login}</span>:`
            stringBuilder += `<span class="password blurred col4">${e.password}</span>@`
            stringBuilder += `<span class="url col5">${e.url}</span>`

            stringBuilder += `<span class="use col6">(used ${e.usage_count} times)</span>`

            if (e.reuse_count>0){
                stringBuilder += `<span class="reuse col7">(warning: re-used ${e.reuse_count} times)</span>`
            }
            stringBuilder += '</span>'
    
            return stringBuilder
        }
    }