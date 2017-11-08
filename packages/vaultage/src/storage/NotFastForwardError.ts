
export class NotFastForwardError extends Error {

    public readonly code = 'EFAST';

    public readonly error = true;
    
    public readonly reason = this.message;

    constructor() {
        super('Not fast forward');
    }
}