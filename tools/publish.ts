import * as fs from 'fs';
import * as path from 'path';
import * as semver from 'semver';
import { cd, exec } from 'shelljs';

interface IPackageDefinition {
    name: string;
    dist: string;
    dependencies: string[];
}

type ReleaseChannel = 'dev' | 'next' | 'latest';
type ReleaseType = 'prerelease' | 'patch' | 'minor' | 'major';

const packages: IPackageDefinition[] = [
    {
        name: 'vaultage',
        dist: 'vaultage',
        dependencies: [
            'vaultage-pwa',
            'vaultage-ui-webcli',
            'vaultage-protocol'
        ]
    },
    {
        name: 'vaultage-ui-webcli',
        dist: 'vaultage-ui-webcli',
        dependencies: [
            'vaultage-client',
            'vaultage-protocol'
        ]
    },
    {
        name: 'vaultage-pwa',
        dist: 'vaultage-pwa/dist/vaultage-pwa',
        dependencies: [
            'vaultage-client',
            'vaultage-protocol'
        ]
    },
    {
        name: 'vaultage-client',
        dist: 'vaultage-client',
        dependencies: [
            'vaultage-protocol'
        ]
    },
    {
        name: 'vaultage-protocol',
        dist: 'vaultage-protocol',
        dependencies: [ ]
    }
];

(async function main() {

    const config = await configure();
    const channel: string = config.channel;

    const version = getVersion(config.releaseType, config.channel);

    if (exec('git status --porcelain').stdout.trim() !== '') {
        console.log('Your git repository is dirty. You should commit all local changes before moving on.');
        process.exit(1);
        return;
    }

    preparePackagesVersions(version);

    exec('make clean');
    exec('make build');
    exec('make test');

    updatePackagesDependencies(version);

    // Tag 'latest' and 'next' channels in git
    if (channel === 'latest' || channel === 'next') {
        createGitTag(config.message, version);
    }

    doNpmRelease(config.channel);

    restorePackages();
})();

async function configure() {

    const channel = 'latest';
    const preRelease = false;
    const message = '';
    const releaseType: ReleaseType = 'patch'; // minor major

    return { channel: channel as ReleaseChannel, preRelease, releaseType, message };
}

function getVersion(releaseType: ReleaseType, channel: ReleaseChannel): string {
    console.log('Determining previous version');
    const result = exec(`npm show vaultage@${channel} version`);
    const rawVersion = result.stdout.split('\n')[0];

    const previousVersion = (rawVersion !== '') ? semver.valid(rawVersion) : '0.0.0';

    if (previousVersion == null) {
        throw new Error(`Invalid previous version (${result.stdout}). aborting`);
    }
    const nextVersion = semver.inc(previousVersion, releaseType);
    if (nextVersion === null) {
        throw new Error(`Invalid version: ${previousVersion}`);
    }
    if (releaseType !== 'prerelease' && channel !== 'latest') {
        // In this particular situation, we want to actually bump the real version number. Semver will simply remove
        // the prerelease tag and not touch the version number in the first call to semver.inc above.
        const realNextVersion = semver.inc(nextVersion, releaseType);
        if (realNextVersion === null) {
            throw new Error(`Invalid version: ${previousVersion}`);
        }
        // Automatically append a prerelease trailer on secondary channels
        return realNextVersion + `-${channel}.0`;
    }

    return nextVersion;
}

function preparePackagesVersions(version: string) {
    for (const pkg of packages) {
        const pkgJSONPath = path.join(__dirname, '../packages', pkg.dist, 'package.json');
        const pkgJSON = require(pkgJSONPath);
        pkgJSON.version = version;
        fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, null, 4), { encoding: 'utf-8' });
    }
}

function updatePackagesDependencies(version: string) {
    for (const pkg of packages) {
        const pkgJSONPath = path.join(__dirname, '../packages', pkg.dist, 'package.json');
        const pkgJSON = require(pkgJSONPath);
        for (const dep of pkg.dependencies) {
            pkgJSON.dependencies[dep] = version;
        }
        fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, null, 4), { encoding: 'utf-8' });
    }
}

function restorePackages() {
    for (const pkg of packages) {
        const pkgJSONPath = path.join(__dirname, '../packages', pkg.dist, 'package.json');
        const pkgJSON = require(pkgJSONPath);
        pkgJSON.version = '0.0.0';
        // This might actually not be necessary if the package is cached we already get the original.
        for (const dep of pkg.dependencies) {
            delete pkgJSON.dependencies[dep];
        }
        fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, null, 4), { encoding: 'utf-8' });
    }
}

function createGitTag(message: string, version: string) {
    exec(`git tag -s -m "${message}" v${version}`);
    exec('git push --tags');
}

function doNpmRelease(channel: ReleaseChannel) {
    for (const pkg of packages) {
        cd(path.join(__dirname, '../packages', pkg.dist));
        exec(`npm publish --tag=${channel}`);
    }
}

