import { VaultDBEntry } from 'vaultage-client';

export class VaultEntryFormatter {
    
        public static format(e : VaultDBEntry): string {
            let stringBuilder = '<span class="entry">'
    
            stringBuilder += `<span class="id">(${e.id})</span>`
            stringBuilder += `<span class="title">${e.title}</span>&rarr;`
            stringBuilder += `<span class="login">${e.login}</span>:`
            stringBuilder += `<span class="password blurred">${e.password}</span>@`
            stringBuilder += `<span class="url">${e.url}</span>`
            stringBuilder += `<span class="use">(used ${e.usage_count})</span>`
            stringBuilder += `<span class="reuse">(re-used ${e.reuse_count})</span>`
            stringBuilder += '</span>'
    
            return stringBuilder
        }
    }