/**
 * Whether a value is a plain record: a non-null object whose prototype is
 * `Object.prototype` or `null`. Arrays, functions, and class instances fail
 * this test — they carry a different prototype.
 *
 * A reactive proxy over a plain object passes: the proxy forwards its prototype
 * to the wrapped target, so it reads as a plain record and its entries can be
 * walked into an inert snapshot.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

/**
 * Whether a value is a non-array object: anything indexable by key, class
 * instances included. Looser than {@link isRecord} — use this to gate key-wise
 * traversal or validation, and {@link isRecord} when only plain data may pass,
 * as when rebuilding a structure into a detached copy.
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

/**
 * Deep structural equality over plain data: records are compared key by key,
 * arrays element by element, and primitives by SameValueZero — `===` except
 * that `NaN` equals itself, so a structure containing `NaN` still equals its
 * own rebuild. Two values are equal when they have the same shape and every
 * leaf matches, which narrows `b` to `a`'s type.
 *
 * Non-plain values — functions and class instances — compare by identity;
 * `null` and `undefined` are distinct.
 */
export const isEqual = <T>(a: T, b: unknown): b is T => {
  if (a === b || (Number.isNaN(a) && Number.isNaN(b))) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let index = 0; index < a.length; index++) {
      if (!isEqual(a[index], b[index])) {
        return false;
      }
    }
    return true;
  }

  if (isRecord(a) && isRecord(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
      if (!isEqual(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
};
