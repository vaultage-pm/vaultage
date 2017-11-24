import * as path from 'path';
import * as fs from 'fs';

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

const version = '0.0.0-dev10';

// Prepare packages
for (const pkg of packages) {
    const pkgJSONPath = path.join(__dirname, '../packages', pkg.name, 'package.json');
    const pkgJSON = require(pkgJSONPath);
    for (const dep of pkg.dependencies) {
        pkgJSON.dependencies[dep] = version;
    }
    fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON), { encoding: 'utf-8' });
}

// TODO: Do publish

// Restore packages
for (const pkg of packages) {
    const pkgJSONPath = path.join(__dirname, '../packages', pkg.name, 'package.json');
    const pkgJSON = require(pkgJSONPath);
    // This might actually not be necessary if the package is cached we already get the original.
    for (const dep of pkg.dependencies) {
        delete pkgJSON.dependencies[dep];
    }
    fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, (k, v) => v, 4), { encoding: 'utf-8' });
}