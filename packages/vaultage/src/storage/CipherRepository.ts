
export interface ICipherSaveOptions {

    new_hash: string;

    old_hash?: string;

    force?: boolean;
}

/**
 * Instance of an authenticated repository.
 */
export interface IUserRepository {

    save(cipher: string, options: ICipherSaveOptions): Promise<string>;

    load(): Promise<string>;
}

export interface IRepositoryCredentials {
    username: string;
    password: string;
};

export abstract class CipherRepository {

    /**
     * Tries to authenticate a user and returns their repository on success.
     */
    abstract auth(creds: IRepositoryCredentials): Promise<IUserRepository>;
}
