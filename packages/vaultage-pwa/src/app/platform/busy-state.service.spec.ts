import { getService } from 'ng-vacuum';
import { BusyStateService } from './busy-state.service';

describe('BusyStateService', () => {

    let service: BusyStateService;

    beforeEach(() => {
        service = getService(BusyStateService);
    });

    it('stores a simple boolean value', () => {
        expect(service.isBusy).toBe(false);
        service.setBusy(true);
        expect(service.isBusy).toBe(true);
        service.setBusy(false);
        expect(service.isBusy).toBe(false);
    });
});

