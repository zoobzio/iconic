import { describe, it, expect } from "vitest";

import { isPage, isQuery } from "../src/util";
import { entries } from "./fixture";

describe("isQuery", () => {
  it("accepts the empty query and every declared field", () => {
    expect(isQuery({})).toBe(true);
    expect(
      isQuery({
        search: "nord",
        tags: ["dark"],
        sort: { field: "name", direction: "asc" },
        limit: 10,
        offset: 20,
      }),
    ).toBe(true);
  });

  it("accepts a zero limit — the total-only probe", () => {
    expect(isQuery({ limit: 0 })).toBe(true);
  });

  it("rejects unknown keys rather than ignoring them", () => {
    expect(isQuery({ ghost: true })).toBe(false);
    expect(isQuery({ search: "nord", extra: 1 })).toBe(false);
  });

  it("rejects a tags filter that is not a string array", () => {
    expect(isQuery({ tags: "dark" })).toBe(false);
    expect(isQuery({ tags: [1] })).toBe(false);
  });

  it("rejects a sort outside the model", () => {
    expect(isQuery({ sort: { field: "name" } })).toBe(false);
    expect(isQuery({ sort: { field: "tags", direction: "asc" } })).toBe(false);
    expect(isQuery({ sort: { field: "name", direction: "up" } })).toBe(false);
    expect(
      isQuery({ sort: { field: "name", direction: "asc", nulls: "last" } }),
    ).toBe(false);
  });

  it("rejects fields of the wrong shape", () => {
    expect(isQuery({ search: 4 })).toBe(false);
    expect(isQuery({ limit: -1 })).toBe(false);
    expect(isQuery({ limit: 1.5 })).toBe(false);
    expect(isQuery({ offset: "0" })).toBe(false);
  });

  it("rejects non-records", () => {
    expect(isQuery("nord")).toBe(false);
    expect(isQuery(null)).toBe(false);
  });
});

describe("isPage", () => {
  it("accepts entries with the three counts", () => {
    expect(
      isPage({ entries, total: entries.length, limit: 20, offset: 0 }),
    ).toBe(true);
    expect(isPage({ entries: [], total: 0, limit: 0, offset: 40 })).toBe(true);
  });

  it("tolerates fields beyond the model on member entries", () => {
    expect(
      isPage({
        entries: [{ id: "nord", name: "Nord", preview: "#2e3440" }],
        total: 1,
        limit: 20,
        offset: 0,
      }),
    ).toBe(true);
  });

  it("rejects a member entry with malformed description or tags", () => {
    const members: unknown[] = [
      [{ id: "nord", name: "Nord", description: 4 }],
      [{ id: "nord", name: "Nord", tags: "dark" }],
      [{ id: "nord", name: "Nord", tags: [1] }],
    ];
    for (const broken of members) {
      expect(isPage({ entries: broken, total: 1, limit: 20, offset: 0 })).toBe(
        false,
      );
    }
  });

  it("rejects a member entry with a missing or empty identity", () => {
    const members: unknown[] = [
      [{ id: "", name: "Nord" }],
      [{ id: "nord", name: "" }],
      [{ id: "nord" }],
      [{ name: "Nord" }],
      ["nord"],
    ];
    for (const broken of members) {
      expect(isPage({ entries: broken, total: 1, limit: 20, offset: 0 })).toBe(
        false,
      );
    }
  });

  it("rejects missing or malformed counts", () => {
    expect(isPage({ entries, limit: 20, offset: 0 })).toBe(false);
    expect(isPage({ entries, total: -1, limit: 20, offset: 0 })).toBe(false);
    expect(isPage({ entries, total: 4, limit: 20, offset: 0.5 })).toBe(false);
  });

  it("rejects non-records and a non-array entries", () => {
    expect(isPage([])).toBe(false);
    expect(isPage({ entries: {}, total: 0, limit: 20, offset: 0 })).toBe(false);
  });
});
