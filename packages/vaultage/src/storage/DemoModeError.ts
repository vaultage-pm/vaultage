/**
 * This errors happens when a client tries to update,
 * but the server is in demo mode. The server reject all
 * updates.
 */
export class DemoModeError extends Error {

    public readonly code = 'EDEMO';

    public readonly error = true;

    public readonly reason = this.message;

    constructor() {
        super('Server in demo mode, rejecting update.');
        Object.setPrototypeOf(this, DemoModeError.prototype);
    }
}
