// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'zone.js/dist/zone-testing';

import { ErrorHandler, NgZone } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';


declare const require: {
    context(path: string, deep?: boolean, filter?: RegExp): {
        keys(): string[];
        <T>(id: string): T;
    };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);


let uncaughtErrors: any[] = [];

beforeEach(() => {
    getTestBed().overrideProvider(ErrorHandler, { useValue: testingErrorHandler });
});

const testingErrorHandler: ErrorHandler = {
    handleError: errorHandler
};
window.onerror = errorHandler;

function errorHandler(err: any) {
    uncaughtErrors.push(err);
}

afterEach(() => {
    const errors = uncaughtErrors;
    uncaughtErrors = [];
    for (const err of errors) {
        fail(`Uncaught error: ${err}`);
    }
});

