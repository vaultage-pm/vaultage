
/**
 * AES-CCM was introduced in node@10 https://github.com/nodejs/node/blob/master/doc/changelogs/CHANGELOG_V10.md#10.0.0
 * This function returns true iff any condition is met
 * - We are running nodejs >= 10.0.0
 * - This is not a nodejs runtime
 *
 * When using vaultage-client in a non-node environment, one must either require('vaultage-client/dist/vaultage-sjcl.js')
 * or provide appropriate shims for the 'crypto' module.
 */
export function supportsNativeCrypto() {
    if (typeof process === 'undefined') {
        return true;
    }

    const p = process as typeof process & { release?: { name: string}};

    const engine = (p.release != null) ? p.release.name : 'undefined';
    const major = parseInt(process.version.split('.')[0], 10);

    return engine !== 'node' || major >= 10;
}
