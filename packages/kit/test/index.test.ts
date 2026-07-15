import { describe, expect, it } from "vitest";

import type { IconifyIcon } from "@iconic/schema";
import { makeIconic } from "@iconic/core";

import { defineIconicPreset } from "../src/preset";

const us: IconifyIcon = { body: "<us/>", width: 24 };
const gb: IconifyIcon = { body: "<gb/>", width: 24 };
const home: IconifyIcon = { body: "<home/>", width: 24 };
const settings: IconifyIcon = { body: "<settings/>", width: 24 };

describe("defineIconicPreset", () => {
  it("strings packs together into one service that knows every alias", () => {
    const config = defineIconicPreset({ base: { us, gb } })
      .configure({ base: { home, settings } })
      .use();
    const icons = makeIconic(config);

    expect(icons.aliases().sort()).toEqual(["gb", "home", "settings", "us"]);
    expect(icons.resolve("us").body).toContain("us");
    expect(icons.resolve("home").body).toContain("home");
  });

  it("chains two separately-defined presets by feeding one's catalog into configure", () => {
    const flagPack = defineIconicPreset({ base: { us, gb } });
    const uiPack = defineIconicPreset({ base: { home, settings } });

    const icons = makeIconic(flagPack.configure(uiPack.catalog).use());

    expect(icons.aliases().sort()).toEqual(["gb", "home", "settings", "us"]);
    expect(icons.resolve("settings").body).toContain("settings");
  });

  it("use() seeds the active set and a detached catalog", () => {
    const config = defineIconicPreset({ base: { us } }).use();
    expect(config.active).toBe("base");
    expect(config.catalog.base.us).toBeDefined();
  });

  it("carries sets from a configured pack through to the service", () => {
    const config = defineIconicPreset({ base: { home } })
      .configure({
        base: { settings },
        sets: { alt: { home: settings } },
      })
      .use();
    const icons = makeIconic(config);

    expect(icons.sets()).toEqual(["alt"]);
    expect(icons.resolve("home", "alt").body).toContain("settings");
  });
});
