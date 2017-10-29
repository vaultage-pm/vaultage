
export class Notification {
    constructor(
            private $mdToast: ng.material.IToastService,
            private p: angular.IPromise<any>) {
    }

    public discard(): void {
        this.$mdToast.hide(this.p);
    }

}


export interface INotificationSettings {
    persistent: boolean;
};

export class NotificationService {
    constructor(
            private $mdToast: ng.material.IToastService) {
    }

    public notifyError(message: string, settings?: INotificationSettings): Notification {
        if (console) {
            console.error(message);
        }
        return this._showToast(message, settings);
    }

    public notifySuccess(message: string, settings?: INotificationSettings): Notification {
        if (console) {
            console.log(message);
        }
        return this._showToast(message, settings);
    }

    public notifyInfo(message: string, settings?: INotificationSettings): Notification {
        if (console) {
            console.log(message);
        }
        return this._showToast(message, settings);
    }

    private _showToast(message: string, settings?: INotificationSettings): Notification {
        let leToast = this.$mdToast.simple()
            .textContent(message)
            .position('top right');
        if (settings) {
            if (settings.persistent) {
                leToast.hideDelay(0);
            }
        }
        return new Notification(this.$mdToast, this.$mdToast.show(leToast));
    }
}