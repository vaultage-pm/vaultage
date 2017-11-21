import { cp, mkdir } from 'shelljs';

// TODO (#111): If not exists, run a build on vaultage-client to generate artifact
mkdir('-p', 'public/dist');
cp(require.resolve('vaultage-client/dist/vaultage.js'), 'public/dist/');