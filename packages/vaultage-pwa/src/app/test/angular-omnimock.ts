import { Inject, InjectionToken, Optional, Self, SkipSelf, ɵReflectionCapabilities as ReflectionCapabilities } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { instance, Mock, mock, verify } from 'omnimock';
import { ConstructorType } from 'omnimock/dist/base-types';

/**
 * This file is an incubator for a potential library of helpers to write terse and correct tests
 * in angular with omnimock.
 */

const _globalMocks: Map<ConstructorType<any> | InjectionToken<any>, Mock<any>> = new Map();

afterEach(() => {
    const mocksToFlush = new Map(_globalMocks);
    _globalMocks.clear();
    for (const entry of mocksToFlush.values()) {
        verify(entry);
    }
});

function createMockForToken<T>(token: ConstructorType<T> | InjectionToken<T>, type: ConstructorType<T> | string): Mock<T> {
    const m = typeof type === 'string' ? mock<T>(type) : mock(type);
    _globalMocks.set(token, m);
    return m;
}

export function getMock<T>(token: ConstructorType<T> | InjectionToken<T>): Mock<T> {
    const m = _globalMocks.get(token);
    if (m == null) {
        return createMockForToken(token, token instanceof InjectionToken ? token.toString() : token);
    }
    return m as Mock<T>;
}

export function getService<T>(srv: ConstructorType<T>): T {
    const ref = new ReflectionCapabilities();
    const params = ref.parameters(srv);

    for (const annotations of params) {
        if (annotations == null) {
            // tslint:disable-next-line: max-line-length
            throw new Error(`Cannot find dependency injection data for service ${getMockName(srv)}. Make sure it is annotated with @Injectable().`);
        }
        const meta: any = {};
        for (const annotation of annotations) {
            if (annotation instanceof Optional || annotation === Optional) {
                // skip
            } else if (annotation instanceof SkipSelf || annotation === SkipSelf) {
                // skip
            } else if (annotation instanceof Self || annotation === Self) {
                // skip
            } else if (annotation instanceof Inject) {
                meta.token = annotation.token;
            } else {
                meta.type = annotation;
            }
        }
        const m = mock(meta.type || String(meta.token));
        const p = meta.token || meta.type;
        if (_globalMocks.has(p)) {
            // This token is already mocked. Skip it.
            continue;
        }
        _globalMocks.set(p, m);
    }

    const providers: any[] = [ srv ];
    for (const [provide, m] of _globalMocks.entries()) {
        providers.push({ provide, useFactory: () => instance(m) });
    }

    TestBed.configureTestingModule({
        providers
    });

    return TestBed.inject(srv);
}

function getMockName(p: unknown) {
    return typeof p === 'function' && 'name' in p ? p.name : p;
}
