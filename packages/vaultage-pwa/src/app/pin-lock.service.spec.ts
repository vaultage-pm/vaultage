import { getMock, getService } from 'ng-vacuum';
import { anyString, Mock, reset, when } from 'omnimock';

import { PinLockService } from './pin-lock.service';
import { LOCAL_STORAGE } from './platform/providers';

/*
decrypted mock data:
{
    "pin": "1234",
    "data": "53cr37"
}
-------
encrypted mock data:
[
    '7534e92f7cff82815e997e2b2e8d65421f8f0482344b18d44c50f4745d7ee7f85f3fca088e7dfdcb6bbca5582a1869d1e597cea27e19e1b3e124ccf5d2fd81b5',
    '7d80a5a2b8b1ba326fdf5feeacfd00b52e4ca9cd8e831d41d823dcbfebbd1ccd'
]

*/


describe('PinLockServiceTest', () => {

    let lsMock: Mock<Storage>;
    let service: PinLockService;

    beforeEach(() => {
        lsMock = getMock(LOCAL_STORAGE);
        service = getService(PinLockService);
    });

    it('setSecret sets the secret', () => {
        when(lsMock.setItem(anyString(), anyString())).call((key, datum) => {
            expect(key).toBe('vaultage_locked');

            expect(JSON.parse(datum)).toEqual([
                "7534e92f7cff82815e997e2b2e8d65421f8f0482344b18d44c50f4745d7ee7f85f3fca088e7dfdcb6bbca5582a1869d1e597cea27e19e1b3e124ccf5d2fd81b5",
                "7d80a5a2b8b1ba326fdf5feeacfd00b52e4ca9cd8e831d41d823dcbfebbd1ccd"
            ]);
        }).once();
        service.setSecret('1234', '53cr37');
    });

    it('getSecret with good pin returns the secret', () => {
        when(lsMock.getItem(anyString())).call(key => {
            expect(key).toBe('vaultage_locked');

            return `[
                "7534e92f7cff82815e997e2b2e8d65421f8f0482344b18d44c50f4745d7ee7f85f3fca088e7dfdcb6bbca5582a1869d1e597cea27e19e1b3e124ccf5d2fd81b5",
                "7d80a5a2b8b1ba326fdf5feeacfd00b52e4ca9cd8e831d41d823dcbfebbd1ccd"
            ]`;
        });
        expect(service.getSecret('1234')).toBe('53cr37');
    });

    it('getSecret with bad pin returns undefined', () => {
        when(lsMock.getItem(anyString())).call(key => {
            expect(key).toBe('vaultage_locked');

            return `[
                "7534e92f7cff82815e997e2b2e8d65421f8f0482344b18d44c50f4745d7ee7f85f3fca088e7dfdcb6bbca5582a1869d1e597cea27e19e1b3e124ccf5d2fd81b5",
                "7d80a5a2b8b1ba326fdf5feeacfd00b52e4ca9cd8e831d41d823dcbfebbd1ccd"
            ]`;
        });
        expect(service.getSecret('4321')).toBe(undefined);
    });

    it('getSecret with no storage', () => {
        when(lsMock.getItem(anyString())).call(key => {
            expect(key).toBe('vaultage_locked');
            return null;
        });
        expect(service.getSecret('4321')).toBe(undefined);
    });

    it('hasSecret returns true iff there is a secret', () => {
        when(lsMock.getItem(anyString())).return(null);
        expect(service.hasSecret).toBe(false);

        reset(lsMock);
        when(lsMock.getItem(anyString())).return(`{
            "pin": "1234",
            "data": "53cr37"
        }`);
        expect(service.hasSecret).toBe(true);
    });

    it('reset resets the store', () => {
        when(lsMock.removeItem(anyString())).call(key => {
            expect(key).toBe('vaultage_locked');
        });
        service.reset();
    });
});
