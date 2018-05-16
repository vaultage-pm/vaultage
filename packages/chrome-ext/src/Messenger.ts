
export interface IMessage<Req, Res> {
    name: string;
    _virtual_req: Req;
    _virtual_res: Res;
}

export function defineMessage<Req, Res>(name: string): IMessage<Req, Res> {
    return { name } as IMessage<Req, Res>;
}

export type MessageHandler<Req, Res> = (req: Req, sender: chrome.runtime.MessageSender) => Promise<Res>;

export class Server {

    private _listening = false;

    private _listeners: Map<string, MessageHandler<any, any>> = new Map();

    public on<Req, Res>(message: IMessage<Req, Res>, handler: MessageHandler<Req, Res>): this {
        this._listeners.set(message.name, handler);
        return this;
    }

    public listen() {
        if (this._listening === true) {
            throw new Error('Server is already listening');
        }
        this._listening = true;

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            const l = this._listeners.get(request.name);
            if (l != null) {
                l(request.data, sender).then((res) => {
                    sendResponse({
                        success: res
                    });
                }, (e) => {
                    console.error(e);
                    sendResponse({
                        err: e.toString()
                    });
                });
                return true;
            }
            return false;
        });
    }
}

export class Client {
    public send<Req, Res>(message: IMessage<Req, Res>, req: Req): Promise<Res> {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ name: message.name, data: req }, (res) => {
                this.handleResponse<Res>(res).then(resolve, reject);
            });
        });
    }

    public sendToTab<Req, Res>(tabId: number, message: IMessage<Req, Res>, req: Req): Promise<Res> {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { name: message.name, data: req }, (res) => {
                this.handleResponse<Res>(res).then(resolve, reject);
            });
        });
    }

    private async handleResponse<Res>(res: any): Promise<Res> {
        if (res == null) {
            throw new Error('No response');
        }
        if (res.err) {
            throw res.err;
        } else {
            return res.success;
        }
    }
}
