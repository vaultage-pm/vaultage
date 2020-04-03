import {
    Inject,
    InjectionToken,
    ModuleWithProviders,
    Optional,
    Self,
    SkipSelf,
    Type,
    ɵReflectionCapabilities as ReflectionCapabilities,
} from '@angular/core';
import { TestBed, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { instance, Mock, mock, verify } from 'omnimock';
import { Shallow } from 'shallow-render';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

/**
 * This file is an incubator for a potential library of helpers to write terse and correct tests
 * in angular with omnimock.
 */

const _globalMocks: Map<Type<any> | InjectionToken<any>, Mock<any>> = new Map();

afterEach(() => {
    const mocksToFlush = new Map(_globalMocks);
    _globalMocks.clear();
    for (const entry of mocksToFlush.values()) {
        verify(entry);
    }
});

function createMockForToken<T>(token: Type<T> | InjectionToken<T>, type: Type<T> | string): Mock<T> {
    const m = typeof type === 'string' ? mock<T>(type) : mock(type);
    _globalMocks.set(token, m);
    return m;
}

function createMocks(target: Type<unknown>) {
    const ref = new ReflectionCapabilities();
    const params = ref.parameters(target);

    for (const annotations of params) {
        if (annotations == null) {
            // tslint:disable-next-line: max-line-length
            throw new Error(`Cannot find dependency injection data for service ${getMockName(target)}. Make sure it is annotated with @Injectable().`);
        }
        const meta: any = {};
        for (const annotation of annotations) {
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

}

export function getMock<T>(token: Type<T> | InjectionToken<T>): Mock<T> {
    const m = _globalMocks.get(token);
    if (m == null) {
        return createMockForToken(token, token instanceof InjectionToken ? token.toString() : token);
    }
    return m as Mock<T>;
}

export function getService<T>(testService: Type<T>): T {

    createMocks(testService);

    const providers: any[] = [ testService ];
    for (const [provide, m] of _globalMocks.entries()) {
        providers.push({ provide, useFactory: () => instance(m) });
    }
    TestBed.configureTestingModule({
        providers
    });
    return TestBed.inject(testService);
}

export function getShallow<T>(testComponent: Type<T>, testModule: Type<any> | ModuleWithProviders): Shallow<T> {

    createMocks(testComponent);

    let shallow = new Shallow(testComponent, testModule)
        .replaceModule(BrowserAnimationsModule, NoopAnimationsModule);

    for (const [provide, m] of _globalMocks.entries()) {
        shallow = shallow.provideMock({ provide, useFactory: () => instance(m) });
    }

    return shallow;
}

export function renderComponent<T>(testComponent: Type<T>, testModule: Type<any> | ModuleWithProviders): Promise<Rendering<T, never>> {
    return getShallow(testComponent, testModule).render();
}

function getMockName(p: unknown) {
    return typeof p === 'function' && 'name' in p ? p.name : p;
}
