import { cd, exec } from 'shelljs';
import * as inquirer from 'inquirer';
import * as semver from 'semver';

const prompt = inquirer.createPromptModule();

async function release() {
    cd(`${__dirname}/docker`);

    const { channel } = await prompt([{
        type: 'list',
        name: 'channel',
        message: 'To which channel would you like to release?',
        choices: ['dev', 'next', 'latest'],
        filter: function(val) {
            return val.toLowerCase();
        }
    }]);

    console.log(channel);

    const result = exec(`npm show vaultage@${channel} version`);
    const rawVersion = result.stdout.split('\n')[0];
    const version = semver.valid(rawVersion);
    if (version === null) {
        throw new Error(`Invalid version: ${version}`)
    }

    console.log(`Last version on channel ${channel} is ${version}`);

    exec(`docker build --rm --no-cache --build-arg VAULTAGE_CHANNEL=${channel} --tag hmil/vaultage:${version} .`);
    exec(`docker tag hmil/vaultage:${version} hmil/vaultage:${channel}`);

    exec(`docker push hmil/vaultage:${channel}`);
    exec(`docker push hmil/vaultage:${version}`);
}

release();
