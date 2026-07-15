import { describe, expect, it } from "vitest";

import type { IconifyIcon } from "@iconic/schema";

import { defineIconic } from "../src/service";
import { UnknownSetError } from "../src/error";

const home: IconifyIcon = { body: '<path d="M0 0"/>', width: 24, height: 24 };
const star: IconifyIcon = { body: "<circle/>", width: 24, height: 24 };
const sharpHome: IconifyIcon = { body: "<rect/>", width: 24, height: 24 };
const homeFlipped: IconifyIcon = {
  body: '<path d="M0 0"/>',
  width: 24,
  height: 24,
  hFlip: true,
};

describe("defineIconic", () => {
  it("resolves a base alias to its stored icon literal", () => {
    const icons = defineIconic({ base: { home } });
    expect(icons.resolve("home").body).toContain("path");
  });

  it("returns the literal whole, including baked transforms", () => {
    const icons = defineIconic({ base: { home: homeFlipped } });
    expect(icons.resolve("home").hFlip).toBe(true);
  });

  it("lists aliases and registered sets", () => {
    const icons = defineIconic({
      base: { home, star },
      sets: { sharp: { home: sharpHome } },
    });
    expect(icons.aliases().sort()).toEqual(["home", "star"]);
    expect(icons.sets()).toEqual(["sharp"]);
  });

  it("a set overrides only its aliases; others fall through to base", () => {
    const icons = defineIconic({
      base: { home, star },
      sets: { sharp: { home: sharpHome } },
    });
    expect(icons.resolve("home", "sharp").body).toBe("<rect/>");
    expect(icons.resolve("star", "sharp").body).toBe("<circle/>");
  });

  it("swap changes the active set used by resolve", () => {
    const icons = defineIconic({
      base: { home },
      sets: { sharp: { home: sharpHome } },
    });
    expect(icons.resolve("home").body).toBe('<path d="M0 0"/>');
    icons.swap("sharp");
    expect(icons.config.active).toBe("sharp");
    expect(icons.resolve("home").body).toBe("<rect/>");
  });

  it("overrides() reports the aliases a set rebinds", () => {
    const icons = defineIconic({
      base: { home, star },
      sets: { sharp: { home: sharpHome } },
    });
    expect(icons.overrides("sharp")).toEqual(["home"]);
    expect(icons.overrides("base")).toEqual([]);
  });

  it("register files a validated set at runtime, then swaps to it", () => {
    const icons = defineIconic({ base: { home } });
    icons.register("sharp", { home: sharpHome });
    icons.swap("sharp");
    expect(icons.resolve("home").body).toBe("<rect/>");
  });

  it("register rejects a set overriding an unknown alias", () => {
    const icons = defineIconic({ base: { home } });
    expect(() =>
      icons.register("bad", {
        // @ts-expect-error a set may only override known aliases
        ghost: sharpHome,
      }),
    ).toThrow(/unknown alias/);
  });

  it("register rejects a set carrying a malformed icon", () => {
    const icons = defineIconic({ base: { home } });
    expect(() =>
      // @ts-expect-error an override must be a well-formed icon literal
      icons.register("bad", { home: { width: 24 } }),
    ).toThrow();
  });

  it("resolve of an unknown alias throws", () => {
    const icons = defineIconic({ base: { home } });
    // @ts-expect-error "ghost" is not a declared alias
    expect(() => icons.resolve("ghost")).toThrow(/unknown alias/);
  });

  it("swap to an undefined set throws", () => {
    const icons = defineIconic({ base: { home } });
    expect(() => icons.swap("ghost")).toThrow(UnknownSetError);
  });
});
