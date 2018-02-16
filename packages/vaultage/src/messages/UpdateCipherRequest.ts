import { IsBoolean, IsDefined, IsOptional, IsString } from 'class-validator';

// tslint:disable:variable-name

/**
 * Describes the body of a POST request to the cipher API (implemented in CipherController).
 */
export class UpdateCipherRequest {

    /**
     * If set, tells the server to use this key as the remote authentication key from now on.
     */
    @IsString()
    @IsOptional()
    public new_password?: string;

    /**
     * The new cipher data. Overwrites entirely the previous value.
     */
    @IsString()
    @IsDefined()
    public new_data: string;

    /**
     * The previous cipher fingerprint. If it doesn't match the one stored on the server,
     * the update is rejected.
     */
    @IsString()
    @IsOptional()
    public old_hash?: string;

    /**
     * The new cipher fingerprint. This value is determined client-side and the server
     * doesn't know how it is computed.
     */
    @IsString()
    @IsDefined()
    public new_hash: string;

    /**
     * If set to true, ignores the value of old_hash and updates regardless.
     */
    @IsBoolean()
    @IsOptional()
    public force?: boolean;
}
