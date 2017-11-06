import { IsBoolean, IsDefined, IsOptional, IsString } from 'class-validator';

/**
 * Describes the body of a POST request to the cipher API.
 */
export class UpdateCipherRequest {

    /**
     * If set, tells the server to use this key as the remote authentication key from now on.
     */
    @IsString()
    @IsOptional()
    update_key?: string;

    /**
     * The new cipher data. Overwrites entirely the previous value.
     */
    @IsString()
    @IsDefined()
    new_data: string;

    /**
     * The previous cipher fingerprint. If it doesn't match the one stored on the server,
     * the update is rejected. 
     */
    @IsString()
    @IsDefined()
    old_hash: string;

    /**
     * The new cipher fingerprint. This value is determined client-side and the server doesn't know how
     * it is computed.
     */
    @IsString()
    @IsDefined()
    new_hash: string;

    /**
     * If set to true, ignores the value of old_hash and updates regardless.
     */
    @IsBoolean()
    @IsOptional()
    force?: boolean;
}
