
/**
 * Wrapper for strings which are known to be safe to render as HTML.
 *
 * This class leverages the type system and the runtime to check for XSSes.
 */
export class SanitizedString {

    constructor(private wrapped: string) {}

    // Splitting a sane string keeps it safe
    public split(separator: string | RegExp, limit?: number): SanitizedString[] {
        return this.wrapped.split(separator, limit).map((e) => new SanitizedString(e));
    }

    public isEmpty(): boolean {
        return this.wrapped === '';
    }

    public valueOf(): string {
        return this.wrapped;
    }

    public toString(): string {
        return this.wrapped;
    }

    public transform(transformation: (e: string) => string): SanitizedString {
        return new SanitizedString(transformation(this.valueOf()));
    }
}

/**
 * Escapes html tags and attributes from the string, making it safe.
 */
export function escape(input: string): SanitizedString  {
    return new SanitizedString(input
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\//g, '&#x2F;')
            .replace(/`/g, '&#x60;')
            .replace(/=/g, '&#x3D;'));
}

/**
 * To use instead of Array.join
 */
export function join(inputs: SanitizedString[], glue?: SanitizedString | undefined): SanitizedString {
    return new SanitizedString(inputs.join(glue === undefined ? '' : glue.valueOf()));
}

/**
 * Template string tag to sanitize html. Use like this:
 *
 *     const sanitized = html`Welcome ${user.name}! Would you like a ${user.favoriteDrink} ?`;
 */
export function html(literals: TemplateStringsArray, ...placeholders: (string|number|SanitizedString)[]): SanitizedString {
    let result = '';

    // interleave the literals with the placeholders
    for (let i = 0; i < placeholders.length; i++) {
        const placeholder = placeholders[i];
        result += literals[i];

        if (typeof placeholder === 'number' || placeholder instanceof SanitizedString) {
            result += placeholder.valueOf();
        } else {
            result += escape(placeholder);
        }
    }

    // add the last literal
    result += literals[literals.length - 1];
    return new SanitizedString(result);
}

