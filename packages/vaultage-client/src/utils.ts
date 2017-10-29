
export type GUID = string;

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

/**
 * Creates a good-enough probably unique id.
 */
export function guid(): GUID {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}


export function deepCopy<T>(source: T): T {
    // Probably one of the most inefficient way to perform a deep copy but at least it guarantees isolation,
    // is short and easy to understand, and works as long as we dont mess with non-primitive types
    return JSON.parse(JSON.stringify(source));
}

/**
 * Converts a numeric value to a fixed length string by padding with zeros.
 * 
 * @param value Numeric value to convert
 */
export function fixedLength(value: number, length: number): string {
    return (Array(length + 1).join('0') + value).substr(-length);
}

/**
 * Utilities for performing queries in the DB
 */
export abstract class QueryUtils {

    // This could use some beefing up
    private static SUBSTITUTIONS = {
        'à': 'a', 'ä': 'a',
        'é': 'e', 'è': 'e', 'ë': 'e',
        'ï': 'i',
        'ö': 'o',
        'ù': 'u',
        'ñ': 'n',
    };

    private static normalize(s: string): string {
        let str = s.toLowerCase();
        let result = '';
        for (let i = 0 ; i < str.length ; i++) {
            const c = str.charAt(i);
            result += QueryUtils.SUBSTITUTIONS[c] || c;
        }
        return result;
    }

    public static stringContains(entry: string, criteria?: string): boolean {
        return criteria == null || QueryUtils.normalize(entry).indexOf(QueryUtils.normalize(criteria)) !== -1;
    }
}

