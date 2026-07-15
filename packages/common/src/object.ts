/**
 * Object.keys typed to the object's own key union rather than string. The
 * cast asserts the object holds no keys beyond those in its type; safe for
 * literals built in place, a lie for objects that arrive with extra keys.
 */
export const keys = <T extends object>(obj: T) =>
  Object.keys(obj) as (keyof T & string)[];

/**
 * Object.values typed to the union of the object's value types rather than
 * the widened value type. Carries the same exact-keys assumption as keys.
 */
export const values = <T extends object>(obj: T) =>
  Object.values(obj) as T[keyof T & string][];

/**
 * Object.entries typed so each pair keeps its key with that key's own value
 * type, rather than collapsing to [string, union-of-values]. Carries the same
 * exact-keys assumption as keys.
 */
export const entries = <T extends object>(obj: T) =>
  Object.entries(obj) as { [K in keyof T & string]: [K, T[K]] }[keyof T &
    string][];

/**
 * Object-shaped reduce: folds the entries into an accumulator, with each key
 * and value carrying its own type from T rather than string/unknown. The
 * accumulator type A is whatever the caller seeds and returns.
 */
export const reduce = <T extends object, A>(
  obj: T,
  fn: (acc: A, key: keyof T & string, value: T[keyof T & string]) => A,
  init: A,
): A => entries(obj).reduce((acc, [key, value]) => fn(acc, key, value), init);

/**
 * Maps every value through the callback, preserving the object's keys. Each
 * original key stays typed and lands required — an optional key that is absent
 * at runtime yields no entry, so presence is asserted, not proven — and every
 * value takes the callback's return type R. The callback sees the union of
 * value types, not the type of the specific key. Carries the same exact-keys
 * assumption as keys.
 */
export const map = <T extends object, R>(
  obj: T,
  fn: (value: T[keyof T & string], key: keyof T & string) => R,
) =>
  Object.fromEntries(
    entries(obj).map(([key, value]) => [key, fn(value, key)]),
  ) as { [K in keyof T & string]: R };
