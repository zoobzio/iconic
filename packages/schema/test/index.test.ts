import { describe, expect, it } from "vitest";

import { defineSchema } from "../src/schema";
import type { IconifyIcon } from "../src/types";

const home: IconifyIcon = { body: '<path d="M0 0"/>', width: 24, height: 24 };
const star: IconifyIcon = { body: "<circle/>", width: 24, height: 24 };

const schema = defineSchema({
  base: { home, star },
  sets: {},
});

describe("defineSchema", () => {
  it("reads the aliases off the catalog", () => {
    expect([...schema.enums.aliases].sort()).toEqual(["home", "star"]);
  });

  it("checks alias membership", () => {
    expect(schema.check.alias("home")).toBe(true);
    expect(schema.check.alias("nope")).toBe(false);
  });

  it("accepts a well-formed icon literal", () => {
    expect(schema.check.icon(home)).toBe(true);
    expect(schema.check.icon({ body: "<path/>" })).toBe(true);
  });

  it("rejects an icon missing a string body", () => {
    expect(schema.check.icon({ width: 24 })).toBe(false);
    const result = schema.inspect.icon({ body: 42 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.code).toBe("not_icon");
      expect(result.issues[0]?.path).toEqual(["body"]);
    }
  });

  it("rejects an icon whose geometry is the wrong type", () => {
    const result = schema.inspect.icon({ body: "<path/>", width: "24" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.path).toEqual(["width"]);
    }
  });

  it("rejects an icon whose flip flag is not a boolean", () => {
    expect(schema.check.icon({ body: "<path/>", hFlip: "yes" })).toBe(false);
  });

  it("asserts a set of known-alias overrides", () => {
    expect(() => schema.assert.set({ home: star })).not.toThrow();
  });

  it("rejects a set overriding an unknown alias", () => {
    const result = schema.inspect.set({ ghost: star });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.code).toBe("unknown_alias");
    }
  });

  it("rejects a set whose override is a malformed icon", () => {
    const result = schema.inspect.set({ home: { width: 24 } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.code).toBe("not_icon");
      expect(result.issues[0]?.path).toEqual(["home", "body"]);
    }
  });

  it("throws when constructing from a malformed catalog", () => {
    expect(() =>
      defineSchema({
        base: {
          // @ts-expect-error an icon literal must carry a string body
          home: { width: 24 },
        },
        sets: {},
      }),
    ).toThrow();
  });
});
