/**
 * Calculates the sum of left and right
 *
 * @param left
 * @param right
 */
export function add(left: number | null, right: number | null): number | null {
    if (left === null) {
        return null;
    }
    if (right === null) {
        return null;
    }
    return left + right;
}