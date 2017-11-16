/**
 * This errors happens when a client tries to update,
 * but it provides a wrong old_hash; i.e., its update
 * is not base on the latest commited database. This can
 * happen if you have two clients that concurrently update.
 * To solve this problem, the second client must "pull"
 * (which will erase its local changes), then retry.
 */
export class NotFastForwardError extends Error {

    public readonly code = 'EFAST';

    public readonly error = true;

    public readonly reason = this.message;

    constructor() {
        super('Not fast forward');
        Object.setPrototypeOf(this, NotFastForwardError.prototype);
    }
}
