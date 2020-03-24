import { BehaviorSubject, Observable } from 'rxjs';

export class BusyStateService {

    private busy = false;

    public get isBusy(): boolean {
        return this.busy;
    }

    public setBusy(busy: boolean) {
        this.busy = busy;
    }
}
