/**
 * Enables rich formatting of the terminal output while providing a way to prevent XSS
 */
export class Formatter {

    public static format(template: string, ...args: string[]) {
        const parts = ('_' + template + '_').replace(/\n/g, '<br/>').replace(/%/g, '_%_').split(/%/).map(s => s.substring(1, s.length - 1));
        if (parts.length - 1 != args.length) {
            throw new Error(`Invalid number of arguments passed. Expected ${parts.length - 1} but got ${args.length}`);
        }

        let i = 0;
        return parts.slice(0, parts.length - 1).map(p => p + args[i++]).join('') + parts[parts.length - 1];
    }
}