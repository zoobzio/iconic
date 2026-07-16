import { describe, expect, it } from "vitest";

import { makeIconic } from "../src/index";
import { defineIconicConfig, useIconicConfig } from "../src/config";

const config = defineIconicConfig({
  contract: {
    id: "app",
    name: "App",
    icons: { home: { body: "<path/>", width: 24 } },
  },
});

describe("iconic config", () => {
  it("seeds a detached container per call — safe for concurrent sessions", () => {
    const a = useIconicConfig(config);
    const b = useIconicConfig(config);
    expect(a.contract).not.toBe(b.contract);
    expect(a.override).toEqual({});
  });

  it("boots a service that resolves the contract's aliases", () => {
    const icons = makeIconic(useIconicConfig(config));
    expect(icons.resolve("home").body).toContain("path");
  });
});
