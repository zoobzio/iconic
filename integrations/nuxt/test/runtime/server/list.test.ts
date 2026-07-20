import type { Page } from "iconic/catalog";

import { describe, it, expect, vi, beforeEach } from "vitest";

let assets: Record<string, unknown>;
let query: { q?: string };

vi.mock("h3", () => ({
  defineEventHandler: (handler: unknown) => handler,
  getQuery: () => query,
  createError: (input: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input),
}));

vi.mock("#imports", () => ({
  useStorage: () => ({
    getItem: (key: string) => Promise.resolve(assets[key] ?? null),
  }),
}));

import handler from "../../../src/runtime/server/list";

const list = handler as unknown as (event: unknown) => Promise<Page>;

const entries = [
  { id: "sharp", name: "Sharp" },
  { id: "round", name: "Round", tags: ["soft"] },
];

describe("catalog listing route", () => {
  beforeEach(() => {
    assets = { "entries.json": entries };
    query = {};
  });

  it("lists all entries under the default window, sorted by name", async () => {
    const page = await list({});
    expect(page.entries.map((entry) => entry.id)).toEqual(["round", "sharp"]);
    expect(page.total).toBe(2);
  });

  it("filters by search", async () => {
    query = { q: JSON.stringify({ search: "sharp" }) };
    const page = await list({});
    expect(page.entries.map((entry) => entry.id)).toEqual(["sharp"]);
  });

  it("filters by tags", async () => {
    query = { q: JSON.stringify({ tags: ["soft"] }) };
    const page = await list({});
    expect(page.entries.map((entry) => entry.id)).toEqual(["round"]);
  });

  it("rejects a malformed query", async () => {
    query = { q: "{not json" };
    await expect(list({})).rejects.toMatchObject({ statusCode: 400 });
  });

  it("answers 500 when the manifest is missing", async () => {
    assets = {};
    await expect(list({})).rejects.toMatchObject({ statusCode: 500 });
  });
});
