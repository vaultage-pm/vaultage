
export interface ICommand {

    /**
     * Name of this command: the word the user must type to invoke it.
     */
    name: string;

    /**
     * Description of this command. Appears in help.
     */
    description: string;

    /**
     * Main business function executed when the user invokes this command.
     *
     * @param params user-provided cli params
     */
    handle(params: string[]): void | Promise<any>;

    /**
     * Optional function to provide parameter autocompletion.
     *
     * @param n index of the parameter to complete (starts at 0)
     * @param prefix partial text for the parameter
     * @param line current line of input
     *
     * @returns all possible values as an array of string
     */
    handleAutoCompleteParam?(n: number, prefix: string, line: string): string[];
}
