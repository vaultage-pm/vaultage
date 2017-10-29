Vaultage
========

The self hosted password manager.

## Usage

`git clone path_to_vaultage_repo`
`cd vaultage`
`npm install`
`npm run build`
`npm start`

TODO: Long term plan is to deploy to npm so workflow becomes:
`npm install -g vaultage`
`vaultage start`

## Development

Make sure all other packages are built before attempting to start vaultage from this package.

`npm start` will start the api server and serve the web cli static files. The later is served directly from
the `vaultage-web-cli` directory therefore you shall run `npm run build` in that directory and refresh the
page to see any change made to the web CLI.

Development of individual packages should be done using the utilities from each package (see the README of
the package you need). Developing everything through this main `vaultage` package is not sustainable as it
involves a long and tedious code-build-refresh cycle.
