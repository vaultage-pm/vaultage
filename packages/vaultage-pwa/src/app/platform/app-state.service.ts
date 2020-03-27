import { Injectable } from '@angular/core';

@Injectable()
export class AppStateService {


    // TODO: Write initialization logic which looks at the current state and directs to either the unlock screen or the setup screen
    // The same logic should apply when the app wakes up from background. Perhaps move it to a lifecycle.service
    // Also: Need route guards to prevent screens from being accessed while app is locked.
    // Need a platform-wide service that tells when the app is locked or unlocked
    // App can be:
    //     Unauthenticated
    //     Authenticated but locked
    //     Authenticated and unlocked
    // Need a service to represent those global states
}

export type AppState = 'unauthenticated' | 'locked' | 'unlocked';
