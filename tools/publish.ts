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

const packages: IPackageDefinition[] = [
    {
        name: 'vaultage',
        dependencies: [
            'vaultage-ui-webcli'
        ]
    },
    {
        name: 'vaultage-ui-webcli',
        dependencies: [
            'vaultage-client'
        ]
    },
    {
        name: 'vaultage-client',
        dependencies: [ ]
    }
];

async function configure() {

    const { channel, preRelease, message } = await prompt([{
        type: 'list',
        name: 'channel',
        message: 'To which channel would you like to release?',
        choices: ['dev', 'beta', 'latest'],
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

    let releaseType = 'prerelease';
    
    if (!preRelease) {
        releaseType = (await prompt([{
            type: 'list',
            name: 'releaseType',
            message: 'What kind of release are you performing?',
            choices: ['major', 'minor', 'patch'],
            filter: function(val) {
              return val.toLowerCase();
            }
        }])).releaseType;
    }

    return { channel, preRelease, releaseType, message };
}

function getVersion(tag, releaseType) {
    console.log('Determining previous version')
    const result = exec(`npm show vaultage@${tag} version`);
    const rawVersion = result.stdout.split('\n')[0];

    const previousVersion = (rawVersion != '') ? semver.valid(rawVersion) : '0.0.0';

    if (previousVersion == null) {
        console.log(`Invalid previous version (${result.stdout}). aborting`);
        process.exit(1);
        return;
    }
    const nextVersion = semver.inc(previousVersion, releaseType);

    console.log(`Next version will be ${nextVersion}`)

    return nextVersion;
}

async function main() {

    const config = await configure();
    const channel: string = config.channel;

    const version = getVersion(config.channel, config.releaseType);

    if (channel === 'latest') {
        const result = await prompt([{
            type: 'confirm',
            name: 'releaseOnLatest',
            message: `You are about to release v${version} on the main channel. Proceed?`,
            default: false
        }]);
        if (!result.releaseOnLatest) {
            process.exit(1);
            return;
        }
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

    // Prepare packages
    for (const pkg of packages) {
        const pkgJSONPath = path.join(__dirname, '../packages', pkg.name, 'package.json');
        const pkgJSON = require(pkgJSONPath);
        pkgJSON.version = version;
        for (const dep of pkg.dependencies) {
            pkgJSON.dependencies[dep] = version;
        }
        fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, null, 4), { encoding: 'utf-8' });
    }

    // Git release
    if (config.releaseType !== 'prerelease' && channel === 'latest') {
        exec(`git tag -s -m "${config.message}" v${version}`);
        exec('git push --tags');
    }

    // npm Release
    for (const pkg of packages) {
        cd(path.join(__dirname, '../packages', pkg.name));
        exec(`npm publish --tag=${channel}`);
    }

    // Restore packages
    for (const pkg of packages) {
        const pkgJSONPath = path.join(__dirname, '../packages', pkg.name, 'package.json');
        const pkgJSON = require(pkgJSONPath);
        // This might actually not be necessary if the package is cached we already get the original.
        for (const dep of pkg.dependencies) {
            delete pkgJSON.dependencies[dep];
        }
        fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, null, 4), { encoding: 'utf-8' });
    }
}

main();
