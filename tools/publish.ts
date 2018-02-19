import * as path from 'path';
import * as fs from 'fs';
import { cd, exec } from 'shelljs';
import * as inquirer from 'inquirer';
import * as semver from 'semver';

const prompt = inquirer.createPromptModule();

interface IPackageDefinition {
    name: string;
    dependencies: string[];
}

type ReleaseChannel = 'dev' | 'next' | 'latest';
type ReleaseType = 'prerelease' | 'patch' | 'minor' | 'major';

const packages: IPackageDefinition[] = [
    {
        name: 'vaultage',
        dependencies: [
            'vaultage-ui-webcli',
            'vaultage-protocol'
        ]
    },
    {
        name: 'vaultage-ui-webcli',
        dependencies: [
            'vaultage-client',
            'vaultage-protocol'
        ]
    },
    {
        name: 'vaultage-client',
        dependencies: [
            'vaultage-protocol'
        ]
    },
    {
        name: 'vaultage-protocol',
        dependencies: [ ]
    }
];

(async function main() {

    const config = await configure();
    const channel: string = config.channel;

    const version = getVersion(config.releaseType, config.channel);

    const result = await prompt([{
        type: 'confirm',
        name: 'confirmRelease',
        message: `You are about to release v${version} on channel ${channel}. Proceed?`,
        default: false
    }]);
    if (!result.confirmRelease) {
        process.exit(1);
        return;
    }

    if (exec('git status --porcelain').stdout.trim() !== '') {
        const result = await prompt([{
            type: 'confirm',
            name: 'releaseDirty',
            message: `Your git repository is dirty. You should commit all local changes before moving on. Proceed anyway?`,
            default: false
        }]);
        if (!result.releaseDirty) {
            process.exit(1);
            return;
        }
    }

    preparePackages(version);

    // Tag 'latest' and 'next' channels in git
    if (channel === 'latest' || channel === 'next') {
        createGitTag(config.message, version);
    }

    doNpmRelease(config.channel);

    restorePackages();
})();

async function configure() {

    const { channel, preRelease, message } = await prompt([{
        type: 'list',
        name: 'channel',
        message: 'To which channel would you like to release?',
        choices: ['dev', 'next', 'latest'],
        filter: function(val) {
          return val.toLowerCase();
        }
    }, {
        type: 'input',
        name: 'message',
        message: 'Short release message'
    }, {
        type: 'confirm',
        name: 'preRelease',
        message: 'Is this a pre-release?',
        default: true
    }]);

    let releaseType: ReleaseType = 'prerelease';
    
    if (!preRelease) {
        releaseType = (await prompt([{
            type: 'list',
            name: 'releaseType',
            message: 'What kind of release are you performing?',
            choices: ['patch', 'minor', 'major'],
            filter: function(val) {
              return val.toLowerCase();
            }
        }])).releaseType;
    }

    return { channel: channel as ReleaseChannel, preRelease, releaseType, message };
}

function getVersion(releaseType: ReleaseType, channel: ReleaseChannel): string {
    console.log('Determining previous version');
    const result = exec(`npm show vaultage@${channel} version`);
    const rawVersion = result.stdout.split('\n')[0];

    const previousVersion = (rawVersion != '') ? semver.valid(rawVersion) : '0.0.0';

    if (previousVersion == null) {
        throw new Error(`Invalid previous version (${result.stdout}). aborting`);
    }
    const nextVersion = semver.inc(previousVersion, releaseType);
    if (nextVersion === null) {
        throw new Error(`Invalid version: ${previousVersion}`);
    }
    if (releaseType !== 'prerelease' && channel !== 'latest') {
        // Automatically append a prerelease trailer on secondary channels
        return nextVersion + `-${channel}.0`;
    }

    return nextVersion;
}

function preparePackages(version: string) {
    for (const pkg of packages) {
        const pkgJSONPath = path.join(__dirname, '../packages', pkg.name, 'package.json');
        const pkgJSON = require(pkgJSONPath);
        pkgJSON.version = version;
        for (const dep of pkg.dependencies) {
            pkgJSON.dependencies[dep] = version;
        }
        fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, null, 4), { encoding: 'utf-8' });
    }
}

function restorePackages() {
    for (const pkg of packages) {
        const pkgJSONPath = path.join(__dirname, '../packages', pkg.name, 'package.json');
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
        cd(path.join(__dirname, '../packages', pkg.name));
        exec(`npm publish --tag=${channel}`);
    }
}

