import { describe, expect, it } from "vitest";

import { isObject, isRecord } from "../src/guard";
import { entries, keys, map, values } from "../src/object";

describe("guards", () => {
  it("isRecord accepts plain objects, rejects arrays and null", () => {
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord([1])).toBe(false);
    expect(isRecord(null)).toBe(false);
  });

  it("isObject accepts class instances, rejects arrays", () => {
    expect(isObject(new Date())).toBe(true);
    expect(isObject([1])).toBe(false);
  });
});

describe("object helpers", () => {
  const subject = { a: 1, b: 2 };

  it("keys / values / entries stay typed to the object", () => {
    expect(keys(subject)).toEqual(["a", "b"]);
    expect(values(subject)).toEqual([1, 2]);
    expect(entries(subject)).toEqual([
      ["a", 1],
      ["b", 2],
    ]);
  });

  it("map preserves keys and transforms values", () => {
    expect(map(subject, (v) => v * 10)).toEqual({ a: 10, b: 20 });
  });
});
