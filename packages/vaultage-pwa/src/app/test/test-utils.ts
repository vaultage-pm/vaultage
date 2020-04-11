
export function createNewEvent(eventName: string, bubbles = false, cancelable = false) {
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(eventName, bubbles, cancelable, null);
    return evt;
}

export function typeValue(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(createNewEvent('input'));
}
