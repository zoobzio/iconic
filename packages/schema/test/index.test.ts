import { describe, expect, it } from "vitest";

import { defineSchema } from "../src/schema";
import type { Contract, IconifyIcon } from "../src/types";

const home: IconifyIcon = { body: '<path d="M0 0"/>', width: 24, height: 24 };
const star: IconifyIcon = { body: "<circle/>", width: 24, height: 24 };

const contract: Contract = {
  id: "demo",
  name: "Demo",
  icons: { home, star },
};

const schema = defineSchema(contract);

describe("defineSchema", () => {
  it("reads the aliases off the contract", () => {
    expect([...schema.enums.aliases].sort()).toEqual(["home", "star"]);
  });

  it("checks alias membership", () => {
    expect(schema.check.alias("home")).toBe(true);
    expect(schema.check.alias("nope")).toBe(false);
  });

  it("accepts a well-formed icon literal, rejects a bodyless one", () => {
    expect(schema.check.icon(home)).toBe(true);
    const result = schema.inspect.icon({ width: 24 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.code).toBe("not_icon");
      expect(result.issues[0]?.path).toEqual(["body"]);
    }
  });

  it("accepts an overrides map of known aliases", () => {
    expect(schema.check.overrides({ home: star })).toBe(true);
  });

  it("rejects overrides on an unknown alias", () => {
    const result = schema.inspect.overrides({ ghost: star });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.code).toBe("unknown_alias");
    }
  });

  it("rejects overrides carrying a malformed icon", () => {
    const result = schema.inspect.overrides({ home: { width: 24 } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.path).toEqual(["home", "body"]);
    }
  });

  it("validates a set: identity plus optional known-alias overrides", () => {
    expect(() =>
      schema.assert.set({ id: "sharp", name: "Sharp", icons: { home: star } }),
    ).not.toThrow();
    expect(() => schema.assert.set({ id: "bare", name: "Bare" })).not.toThrow();
  });

  it("rejects a set missing its identity", () => {
    const result = schema.inspect.set({ icons: { home: star } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.code).toBe("not_string");
      expect(result.issues[0]?.path).toEqual(["id"]);
    }
  });

  it("rejects a set whose tags are not strings", () => {
    const result = schema.inspect.set({ id: "s", name: "S", tags: [1] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.path).toEqual(["tags", "0"]);
    }
  });

  it("rejects a set overriding an unknown alias, pathed under icons", () => {
    const result = schema.inspect.set({
      id: "s",
      name: "S",
      icons: { ghost: star },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]?.code).toBe("unknown_alias");
      expect(result.issues[0]?.path).toEqual(["icons", "ghost"]);
    }
  });

  it("throws when constructing from a contract missing identity", () => {
    expect(() =>
      // @ts-expect-error a contract requires an id
      defineSchema({ name: "No id", icons: { home } }),
    ).toThrow();
  });

  it("throws when constructing from a contract with a malformed icon", () => {
    expect(() =>
      defineSchema({
        id: "bad",
        name: "Bad",
        // @ts-expect-error an icon literal must carry a string body
        icons: { home: { width: 24 } },
      }),
    ).toThrow();
  });
});
