import { isEqual, isRecord } from "@iconic/common";

/**
 * Deep copy of plain data: records and arrays are rebuilt from fresh
 * containers, so mutating the copy never reaches the source. Every value is
 * reached through plain property access, so copying a reactive proxy yields an
 * inert, plain snapshot detached from the proxy.
 *
 * Non-plain values — functions and class instances, such as those an icon's
 * extended props might carry — pass through by reference rather than being
 * duplicated. `structuredClone` is never used: it throws on functions and
 * detaches proxies through a mechanism this copy deliberately avoids.
 *
 * The rebuilt value is proven equal to the source before it is returned, which
 * also narrows it back to the source type without a cast.
 */
export const copy = <T>(value: T): T => {
  if (Array.isArray(value)) {
    const result = value.map((entry) => copy(entry));
    if (!isEqual(value, result)) {
      throw new TypeError("could not copy array");
    }
    return result;
  }

  if (isRecord(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = copy(value[key]);
    }
    if (!isEqual(value, result)) {
      throw new TypeError("could not copy record");
    }
    return result;
  }

  return value;
};
