# Contributing to Vaultage

First, if you're here and willing to contribute, we're very happy!

Everything is coded in `TypeScript`, and we use `Makefile`s to build, clean, and distribute the code. We try to keep the code as simple as possible; we opted for splitting the project in three modules: `vaultage`, `vaultage-client` and `vaultage-ui-webcli`. Their description is below.

Please feel free to open an issue or PR!

## Understanding the packages

- `vaultage` is the backend that simply checks for authentication, and stores and delivers the ciphertext to the clients. It is rather *dumb*, if you removes the authentication part, it simply stores the ciphertext (and some configuration) as json files. It also serves the webcli at the root path "/".
- `vaultage-client` is a collection of Typescript classes that run on the *client* and are used to create client applications for vaultage. This is where the real magic happen: this package is responsible for talking to the vaultage server, encrypting and decrypting the database and it exposes an API to add, remove, change and search passwords locally.
- `vaultage-ui-webcli` is a full-featured command-line user interface that runs in the browser.
- `vaultage-protocol` is a set of typescript interfaces that are shared between `vaultage` and `vaultage-client`. These help ensure correctness in the implementation of the protocol between the client and the server.

## Developing

The Makefiles define the dependencies between the packages and ensure that everything is built in the correct order. For this reason, we recommend to newbies that they only run commands from the top-level directory.

### Run a local server

`make server` from the top-level directory builds and runs the vaultage server.

### Run tests

`make tests` from the top-level directory runs all tests from all packages

Some packages may define a `watch` npm task. This is helpful to speed-up the code-test-debug cycle. `cd` into the directory of the package you are working on and try `npm run serve`. This spins-up a development server on a different port than the local vaultage server. The advantage of using the UI from the webpack development server is that it automatically compiles the app and pushes it to the browser as soon as changes to the code are made.

**Important note**: since the webpack development server serves the UI on a different port than that on which the vaultage server runs, you need to specify the URL to the vaultage server when you log into vaultage. You may have to do something like this inside the webcli:

```
auth http://localhost:3000
username: test
password: ....
```

### Developing the web-cli

The webcli package is equiped with a sick webpack setup which lets you develop at light-speed. Run `npm run watch` in the webui package directory.


## How to interact with the folders

- `.`
    - `make serve` to serve everything on `http://localhost:3000`.
    - `make test`  to test the build
    - `make clean` to remove the compiled files
    - `make cleanall` to perform an in-depth cleaning
    - `make integration-test`to run a test-case against a server already running at `http://localhost:3000` (prefer `./integration-test.sh`)
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
        - `make integration-test` to run a test-case against a server already running at `http://localhost:3000`
    - `vaultage-ui-webcli`
        - `make build` to
            - copy the compiled `.js` file from `vaultage-client` (you need to run `make dist/vaultage.js` in `vaultage-client`)
            - build the UI into `public/`
        - `make serve` to build and serve the UI at `http://localhost:9000`. It watches for file changes in the UI. CAUTION: it does not start the backend !
        - `make clean` to remove the compiled files in `public/dist`
        - `make cleanall` to remove the node_modules
