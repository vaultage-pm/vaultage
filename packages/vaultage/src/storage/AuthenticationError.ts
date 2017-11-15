export class AuthenticationError extends Error {

    public readonly code = 'EAUTH';

    public readonly error = true;
    
    public readonly reason = this.message;

    constructor() {
        super('Invalid credentials');
    }
}