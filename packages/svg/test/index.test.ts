import { describe, expect, it } from "vitest";

import type { IconifyIcon, SetMap } from "@iconic/schema";

import { defineSprite } from "../src/sprite";
import type { Source } from "../src/types";

type C = {
  base: Record<"home" | "star", IconifyIcon>;
  sets: Record<string, SetMap>;
};

const fixtures: Record<string, IconifyIcon> = {
  "base:home": { body: "<path/>", width: 24, height: 24 },
  "sharp:home": { body: "<rect/>", width: 24, height: 24 },
  "base:star": { body: "<circle/>", width: 24, height: 24 },
};

const make = (active = "base"): Source<C> => ({
  config: { active },
  aliases: () => ["home", "star"],
  sets: () => ["sharp"],
  overrides: (set) => (set === "sharp" ? ["home"] : []),
  resolve: (alias, set) => {
    const active_ = set ?? "base";
    const key =
      active_ === "sharp" && alias === "home" ? "sharp:home" : `base:${alias}`;
    return fixtures[key];
  },
});

describe("defineSprite", () => {
  it("emits base symbols keyed by alias", () => {
    const sheet = defineSprite(make()).sheet();
    expect(sheet).toContain('<symbol id="home"');
    expect(sheet).toContain('<symbol id="star"');
  });

  it("namespaces a set's override symbols, only for aliases it rebinds", () => {
    const sheet = defineSprite(make()).sheet();
    expect(sheet).toContain('<symbol id="sharp/home"');
    expect(sheet).not.toContain('id="sharp/star"');
  });

  it("computes href against the given set, falling through to base", () => {
    const sprite = defineSprite(make());
    expect(sprite.href("home")).toBe("#home");
    expect(sprite.href("home", "sharp")).toBe("#sharp/home");
    expect(sprite.href("star", "sharp")).toBe("#star");
  });

  it("uses the active set for default href resolution", () => {
    expect(defineSprite(make("sharp")).href("home")).toBe("#sharp/home");
  });

  it("bakes Iconify transforms into the symbol body", () => {
    const source: Source<C> = {
      ...make(),
      resolve: () => ({ body: "<path/>", width: 24, height: 24, hFlip: true }),
    };
    expect(defineSprite(source).symbol("home")).toContain("transform");
  });

  it("lists set overrides in the manifest", () => {
    expect(defineSprite(make()).manifest()).toEqual({ sharp: ["home"] });
  });
});
