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
    const config = defineIconicPreset({
      id: "flags",
      name: "Flags",
      icons: { us, gb },
    })
      .configure({ icons: { home, settings } })
      .use();
    const icons = makeIconic(config);

    expect(icons.aliases().sort()).toEqual(["gb", "home", "settings", "us"]);
    expect(icons.resolve("us").body).toContain("us");
    expect(icons.resolve("home").body).toContain("home");
  });

  it("keeps the root preset's identity when configuring", () => {
    const preset = defineIconicPreset({
      id: "flags",
      name: "Flags",
      icons: { us },
    }).configure({ icons: { home } });
    expect(preset.contract.id).toBe("flags");
    expect(preset.contract.name).toBe("Flags");
  });

  it("chains two separately-defined presets by feeding one's contract into configure", () => {
    const flagPack = defineIconicPreset({
      id: "flags",
      name: "Flags",
      icons: { us, gb },
    });
    const uiPack = defineIconicPreset({
      id: "ui",
      name: "UI",
      icons: { home, settings },
    });

    const icons = makeIconic(flagPack.configure(uiPack.contract).use());

    expect(icons.aliases().sort()).toEqual(["gb", "home", "settings", "us"]);
    expect(icons.resolve("settings").body).toContain("settings");
  });

  it("use() seeds an empty override and a detached contract", () => {
    const config = defineIconicPreset({
      id: "flags",
      name: "Flags",
      icons: { us },
    }).use();
    expect(config.override).toEqual({});
    expect(config.contract.icons.us).toBeDefined();
  });
});
