

export interface LoginPreferences {
    username: string;
    host: string;
}

export class StorageService {
    
    public storeLoginPreferences(prefs: LoginPreferences): void {
        localStorage.setItem('login', JSON.stringify(prefs));
    }

    public getLoginPreferences(): LoginPreferences | null {
        let prefs = localStorage.getItem('login');
        if (prefs) {
            return JSON.parse(prefs) as LoginPreferences;
        } else {
            return null;
        }
    }
}