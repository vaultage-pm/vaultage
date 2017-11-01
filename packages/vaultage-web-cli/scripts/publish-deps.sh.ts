import { cp } from 'shelljs';

// TODO: If not exists, run a build on vaultage-client to generate artifact
cp(require.resolve('vaultage-client/dist/vaultage.js'), 'public/dist');
