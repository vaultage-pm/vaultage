import { cp, mkdir } from 'shelljs';

// TODO: If not exists, run a build on vaultage-client to generate artifact
mkdir('-p', 'public/dist');
cp(require.resolve('vaultage-client/dist/vaultage.js'), 'public/dist/');