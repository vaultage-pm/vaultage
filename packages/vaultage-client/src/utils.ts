
// Utility functions

export function deepCopy<T>(source: T): T {
    // Probably one of the most inefficient way to perform a deep copy but at least it guarantees isolation,
    // is short and easy to understand, and works as long as we dont mess with non-primitive types
    return JSON.parse(JSON.stringify(source));
}
