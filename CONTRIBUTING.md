# Contributing to Vaultage

First, if you're here and willing to contribute, we're very happy!

Everything is coded in `Typescript`, and we use `Makefile`s to build, clean, and distribute the code. We try to keep the code as simple as possible; we opted for splitting the project in three modules: `vaultage`, `vaultage-client` and `vaultage-ui-webcli`. Their description is below.

Please contact us / open a PR with your great ideas!

## Understanding the packages

- `vaultage` is the backend that simply checks for authentication, and stores and delivers the ciphertext to the clients. It is rather *dumb*, if you removes the authentication part, it simply stores the ciphertext (and some configuration). It also serves the webcli at the root path "/".
- `vaultage-client` is a collection of Typescript classes that run on the *client* and are used by the `vaultage-ui`'s. This is where the real magic happen: this class pulls the ciphertext from the `vaultage-server`, decrypts and parses it, allows the `vaultage-ui`'s to interact with the decrypted database, and then re-encrypts and sends the result to the server.
- `vaultage-ui-webcli` is a full-featured user interface that allows you do everything

## How to interact with the folders


- `.`
    - `make serve` to serve everything on `http://localhost:3000`.
    - `make test`  to test the build
    - `make clean` to remove the compiled files
    - `make cleanall` to perform an in-depth cleaning
    - `integration-test`to run a test-case against a server already running at `http://localhost:3000` (prefer `./integration-test.sh`)
    - `publish` interactive assistant for publishing on NPM.js
- `packages`
    - `vaultage`
        - `make serve` to serve the UI on `http://localhost:3000`. It watches for file changes. CAUTION: the UI needs to be built for this ! prefer calling `make serve` on the top folder.
        - `make test`  to test the build
        - `make clean` to remove the compiled files in `public/dist`
        - `make cleanall` to remove the node_modules
    - `vaultage-client` : 
        - `make dist/vaultage.js` to compile everything into a single `.js` file that can be imported by clients
        - `make test` to test the build
        - `make clean` to remove the compiled files in `public/dist`
        - `make cleanall` to remove the node_modules
        - `make demo` to compile and run a demo showing how to interact with Vaultage's main class, the `Vault`
        - `make integration-test` to run a test-case against a server already running at `http://localhost:3000`
    - `vaultage-ui-webcli`
        - `make build` to
            - copy the compiled `.js` file from `vaultage-client` (you need to run `make dist/vaultage.js` in `vaultage-client`)
            - build the UI into `public/`
        - `make serve` to build and serve the UI at `http://localhost:9000`. It watches for file changes in the UI. CAUTION: it does not start the backend !
        - `make clean` to remove the compiled files in `public/dist`
        - `make cleanall` to remove the node_modules