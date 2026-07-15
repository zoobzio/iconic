import { describe, expect, it } from "vitest";

import type { IconifyIcon } from "@iconic/schema";

import { clone } from "../src/clone";
import { extend } from "../src/extend";

const a: IconifyIcon = { body: "x", width: 24 };
const b: IconifyIcon = { body: "y", width: 24 };

describe("clone", () => {
  it("rebuilds the structure but shares icon literals by reference", () => {
    const cat = {
      base: { home: a },
      sets: { alt: { home: b } },
    };
    const out = clone(cat);
    expect(out).toEqual(cat);
    expect(out.base).not.toBe(cat.base);
    expect(out.sets).not.toBe(cat.sets);
    expect(out.base.home).toBe(a);
  });
});

describe("extend", () => {
  it("accumulates aliases from the extension", () => {
    const base = { base: { home: a }, sets: {} };
    const out = extend(base, { base: { star: b } });
    expect(Object.keys(out.base).sort()).toEqual(["home", "star"]);
  });

  it("deep-merges sets the base and extension share", () => {
    const base = {
      base: { home: a },
      sets: { alt: { home: a } },
    };
    const out = extend(base, {
      base: {},
      sets: {
        alt: { home: b },
        sharp: { home: b },
      },
    });
    expect(Object.keys(out.sets).sort()).toEqual(["alt", "sharp"]);
    expect(out.sets.alt.home).toBe(b);
  });
});
