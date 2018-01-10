
export class BusyIndicator {
    private steps = [ '\\&nbsp;', '|&nbsp;', '/&nbsp;', '-&nbsp;' ];
    private currentStep = 0;

    private interval: number;

    constructor(
            private callback: (ind: string) => void) {
        this.interval = window.setInterval(() => this.update(), 150);
        this.update();
    }

    public stop() {
        clearInterval(this.interval);
    }

    private update() {
        this.currentStep = (this.currentStep + 1) % this.steps.length;
        this.callback(this.steps[this.currentStep]);
    }
}
