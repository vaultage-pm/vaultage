
export interface ICommand {

    name: string;

    params?: string[];

    description: string;

    handle: (params: string[]) => void | Promise<any>;
}
