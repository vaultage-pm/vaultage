import { anyString, when } from 'omnimock';

import { PinLockService } from './pin-lock.service';
import { LocalStorageService } from './platform/local-storage.service';
import { createService, mockService, TestClass } from './test/angular-omnimock';

@TestClass()
export class PinLockServiceTest {

    private readonly lsMock = mockService(LocalStorageService);
    private readonly service = createService(PinLockService);

    public testSetSecret() {
        when(this.lsMock.getStorage().setItem(anyString(), anyString())).call((key, datum) => {
            expect(key).toBe('vaultage_locked');
            expect(JSON.parse(datum)).toEqual({
                pin: '1234',
                data: '53cr37'
            });
        }).once();
        this.service.setSecret('1234', '53cr37');
    }
}
