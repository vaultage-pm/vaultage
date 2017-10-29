const escaper = document.createElement('div');

export function escape(input: string): string  {
    escaper.innerText = input;
    return escaper.innerHTML;
}