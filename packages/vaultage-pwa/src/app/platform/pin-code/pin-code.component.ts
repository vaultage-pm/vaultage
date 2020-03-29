import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-pin-code',
    templateUrl: 'pin-code.component.html',
    styleUrls: ['pin-code.component.scss'],
    animations: [
        trigger('digit', [
            transition('* => visible', [
                query(':enter', [
                    style({
                        display: 'block',
                        transform: 'scale(0, 0)'
                    }),
                    animate('200ms')
                ])
            ]),
            transition('visible => invisible', [
                group([
                    query(':enter', [
                        style({
                            transform: 'scale(0, 0)'
                        }),
                        animate('200ms')
                    ]),
                    query(':leave', [
                        animate('200ms', style({
                            transform: 'scale(0, 0)',
                            display: 'none'
                        })),
                    ])
                ])
            ]),
            transition('* => *', [
                query(':leave', [
                    animate('100ms', style({
                        transform: 'scale(0, 0)',
                        display: 'none'
                    })),
                ])
            ])
        ]),
    ]
})
export class PinCodeComponent {

    @Input()
    public title: string = 'Enter Pin Code';

    @Input()
    public minDigits: number = 4;

    @Input()
    public reset: Observable<void> = new Observable();

    @Input()
    public errorMessage: string = '';

    @Output()
    public confirm: EventEmitter<string> = new EventEmitter();

    @Input()
    public altActionName?: string;

    @Output()
    public altAction: EventEmitter<void> = new EventEmitter();

    public digits: number[] = [];
    public visibleDigit = -1;

    public get canAccept() {
        return this.digits.length >= this.minDigits;
    }

    public addDigit(t: number) {
        this.visibleDigit = this.digits.length;
        this.digits.push(t);
    }

    public removeDigit() {
        this.digits = this.digits.slice(0, -1);
        this.visibleDigit = -1;
    }

    public acceptCombination() {
        this.visibleDigit = -1;
        this.confirm.emit(this.digits.reduce((acc, curr) => acc + String(curr), ''));
    }

    public onAltAction() {
        this.altAction.emit();
    }
}
