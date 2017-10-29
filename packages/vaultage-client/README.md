Vaultage JavaScript SDK
=======================

The JavaScript SDK wraps server calls and cryptographic primitives and exposes
a simple API that allows apps to be easily written on top of it.

It is written in TypeScript to ensure type safety within the SDK and is extensively
tested with [Karma](https://karma-runner.github.io/) and the [Jasmine](https://jasmine.github.io/)
testing framework. Tests run in Chrome so you need to have Chrome installed in such a way that
Karma can launch it.

## API Documentation

TODO: generate some kind of API doc from the class definitions and comments

## Contributing

Run `make` to build and test the SDK. Alternatively, use `npm test` and `npm run watch` to test
and watch changes-then test, respectively.

Upon successful test execution, a coverage report is available under `coverage/`.

Only the `src` and `test` directories contain source material, the rest is build artifacts and dependencies.
