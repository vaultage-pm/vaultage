
// Utility functions

export function urlencode(data: any): string {
    let ret: string[] = [];
    let keys = Object.keys(data);
    for (var key of keys) {
        if (data[key] != null) {
            ret.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
    }
    return ret.join('&');
}

/**
 * Asserts that data has at least all the properties of ref and returns an object containing the keys of
 * ref with the non-null values of data.
 *
 * This can be used to convert object with optional properties into objects with non-null properties
 * at runtime.
 *
 * @param data object to be checked
 * @param ref The reference whose keys are used for checking
 */
export function checkParams<T>(data: any, ref: T): T {
    let ret: any = {};
    let properties = Object.keys(ref);
    for (var prop of properties) {
        if (data[prop] == null) {
            throw new Error('Missing property: ' + prop);
        }
        ret[prop] = data[prop];
    }
    return ret;
}

export function deepCopy<T>(source: T): T {
    // Probably one of the most inefficient way to perform a deep copy but at least it guarantees isolation,
    // is short and easy to understand, and works as long as we dont mess with non-primitive types
    return JSON.parse(JSON.stringify(source));
}
