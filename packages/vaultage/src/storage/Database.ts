
export interface ICredentials {
    username: string;
    password: string;
}

/**
 * A class that returns a DataRepository on successful auth
 */
export abstract class DatabaseWithAuth {

    /**
     * Tries to authenticate a user and returns their Database on success.
     */
    public abstract auth(creds: ICredentials): Promise<IDatabase>;
}

/**
 * A Database that acts as a simple hash-chained database.
 * This DB stores a single string, which you can get using "load".
 * To update the DB, use "save". Please read the doc for
 * "DataSaveParameters".
 * Most likely, a instance of this is created on successful auth in
 * DatabaseWithAuth.
 */
export interface IDatabase {

    save(update: IDatabaseSaveParameters): Promise<string>;

    load(): Promise<string>;
}

/**
 * Represent the data needed to update the database.
 * New_data is the data to be stored, new_hash its hash;
 * Old_hash must be equal to the hash of the current content of the
 * DB (not including this update); EXCEPT if the db is empty.
 * If Force is True, it ignores hash comparison, and always updates.
 */
export interface IDatabaseSaveParameters {

    new_data: string;

    new_hash: string;

    old_hash?: string;

    force?: boolean;
}
