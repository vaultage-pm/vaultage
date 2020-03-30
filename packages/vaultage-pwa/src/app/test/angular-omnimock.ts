import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { instance, Mock, mock, verify } from 'omnimock';
import { ConstructorType } from 'omnimock/dist/base-types';

/**
 * This file is an incubator for a potential library of helpers to write terse and correct tests
 * in angular with omnimock.
 */


const allMocks: Array<Mock<unknown>> = [];
const allProviders: Array<any> = [];

export function mockService<T>(ctr: ConstructorType<T> | InjectionToken<T>, name?: string): Mock<T> {
    const m = mock<T>(name ? name : ctr as any);
    allMocks.push(m);
    allProviders.push({ provide: ctr, useFactory: () => instance(m) });
    return m;
}

export function createService<T extends ConstructorType<any>>(ctr: T): InstanceType<T> {
    TestBed.configureTestingModule({
        providers: [ctr, ...allProviders]
    });

    return TestBed.inject(ctr);
}

type EmptyConstructor<T> = new () => T;

export function TestClass() {
    return (ctr: EmptyConstructor<any>) => {
        describe(ctr.name.replace(/Test$/, ''), () => {
            let inst: InstanceType<typeof ctr>;
            beforeEach(() => {
                inst = new ctr();
            });

            afterEach(() => {
                allMocks.forEach(m => verify(m));
                allMocks.length = 0;
                allProviders.length = 0;
            });

            const proto = Object.getOwnPropertyDescriptors(ctr.prototype);
            for (const desc of (Object.keys(proto) as Array<keyof typeof proto>)) {
                if (typeof desc !== 'string') {
                    continue;
                }
                const whiteListMethods = { beforeEach, afterEach, beforeAll, afterAll };
                if (/^test.+/.test(desc)) {
                    console.log(desc);

                    it(transformTestName(desc), () => {
                        inst[desc]();
                    });
                } else if (desc in whiteListMethods) {
                    whiteListMethods[desc as keyof typeof whiteListMethods](() => {
                        inst[desc]();
                    });
                }
            }
        });
    };
}

function transformTestName(name: string): string {
    let ret = '';
    for (let i = 4 ; i < name.length ; i++) {
        const c = name.charAt(i);
        if (isUpperCase(c)) {
            ret += ' ' + c.toLocaleLowerCase();
        } else {
            ret += c;
        }
    }
    return ret.trim();
}

function isUpperCase(c: string) {
    return c.toUpperCase() === c;
}
