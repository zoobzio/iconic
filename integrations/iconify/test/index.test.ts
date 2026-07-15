import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import type { IconifyIcon, IconifyJSON } from "@iconify/types";
import { defineIconic } from "iconic";

import { generate } from "../src/generate";
import { parseRef, plan } from "../src/refs";
import type { Req } from "../src/types";

/**
 * A mock collection served over the injected `req` — the Iconify-API path,
 * since the "mock" prefix is not installed as a local `@iconify-json/*`
 * package. Carries an `aliases` entry so alias-chain flattening is exercised.
 */
const collection: IconifyJSON = {
  prefix: "mock",
  width: 24,
  height: 24,
  icons: {
    home: { body: '<path d="M0 0"/>' },
    "content-save": { body: "<rect/>" },
    house: { body: "<house/>" },
  },
  aliases: {
    "home-alias": { parent: "house", hFlip: true },
  },
};

const urlIcon: IconifyIcon = { body: "<url-icon/>", width: 16, height: 16 };

/** Records every requested URL and answers from in-memory fixtures. */
const stub = (): { req: Req; requested: string[] } => {
  const requested: string[] = [];
  const req: Req = async (src) => {
    requested.push(src.href);
    if (src.hostname === "api.iconify.design") {
      return JSON.stringify(collection);
    }
    if (src.href === "https://icons.example.test/star.json") {
      return JSON.stringify(urlIcon);
    }
    if (src.href === "https://icons.example.test/bad.json") {
      return "not json at all";
    }
    if (src.href === "https://icons.example.test/noticon.json") {
      return JSON.stringify({ nope: true });
    }
    throw new Error(`unexpected request: ${src.href}`);
  };
  return { req, requested };
};

describe("parseRef", () => {
  it("parses a prefix:name ref into an iconify reference", () => {
    expect(parseRef("home", "lucide:home")).toEqual({
      scheme: "iconify",
      provider: "",
      prefix: "lucide",
      name: "home",
    });
  });

  it("parses a $/ ref into a url reference", () => {
    const parsed = parseRef("star", "$/icons.example.test/star.json");
    expect(parsed.scheme).toBe("url");
    if (parsed.scheme === "url") {
      expect(parsed.url.href).toBe("https://icons.example.test/star.json");
    }
  });

  it("throws on an unparseable ref, naming the alias", () => {
    expect(() => parseRef("home", "nonsense")).toThrow(/alias "home"/);
  });

  it("flattens base and sets into planned entries", () => {
    const entries = plan({
      base: { home: "mock:home" },
      sets: { sharp: { home: "mock:content-save" } },
    });
    expect(entries.map((entry) => entry.path)).toEqual([
      ["base", "home"],
      ["sets", "sharp", "home"],
    ]);
  });
});

describe("generate", () => {
  it("resolves refs into a literal document and validates it", async () => {
    const { req } = stub();
    const result = await generate({
      config: { base: { home: "mock:home", save: "mock:content-save" } },
      req,
    });
    expect(result.filename).toBe("iconic.config.ts");
    expect(result.contents).toContain(
      `import { defineIconicConfig } from "iconic/config";`,
    );
    expect(result.contents).toContain(`home: {`);
    expect(result.contents).toContain(`body: "<path d=\\"M0 0\\"/>"`);
    // The collection-root width/height are baked into each resolved icon.
    expect(result.contents).toContain("width: 24");
  });

  it("batches acquisition into one request per prefix", async () => {
    const { req, requested } = stub();
    await generate({
      config: { base: { home: "mock:home", save: "mock:content-save" } },
      req,
    });
    expect(requested).toHaveLength(1);
    expect(requested[0]).toContain("icons=home,content-save");
  });

  it("flattens an Iconify alias chain through getIconData", async () => {
    const { req } = stub();
    const result = await generate({
      config: { base: { flipped: "mock:home-alias" } },
      req,
    });
    expect(result.contents).toContain("<house/>");
    expect(result.contents).toContain("hFlip: true");
  });

  it("resolves a $/ ref by fetching a single icon", async () => {
    const { req } = stub();
    const result = await generate({
      config: { base: { star: "$/icons.example.test/star.json" } },
      req,
    });
    expect(result.contents).toContain("<url-icon/>");
  });

  it("throws a ref-attributed error on a non-JSON $/ response", async () => {
    const { req } = stub();
    await expect(
      generate({
        config: { base: { star: "$/icons.example.test/bad.json" } },
        req,
      }),
    ).rejects.toThrow(/did not return JSON/);
  });

  it("throws when a $/ response is not an icon", async () => {
    const { req } = stub();
    await expect(
      generate({
        config: { base: { star: "$/icons.example.test/noticon.json" } },
        req,
      }),
    ).rejects.toThrow(/did not return an icon/);
  });

  it("collects every unresolvable ref into one error", async () => {
    const { req } = stub();
    await expect(
      generate({
        config: { base: { ghost: "mock:missing", wraith: "mock:absent" } },
        req,
      }),
    ).rejects.toThrow(
      /base\.ghost → mock:missing[\s\S]*base\.wraith → mock:absent/,
    );
  });

  it("lets a caller-supplied resolver override a scheme", async () => {
    const result = await generate({
      config: { base: { star: "$/icons.example.test/star.json" } },
      resolvers: {
        url: async () => ({ body: "<custom-url/>" }),
      },
    });
    expect(result.contents).toContain("<custom-url/>");
  });

  it("round-trips: the emitted config feeds defineIconic and every alias resolves", async () => {
    const { req } = stub();
    const result = await generate({
      config: {
        base: { home: "mock:home", save: "mock:content-save" },
        sets: { sharp: { home: "mock:content-save" } },
      },
      req,
    });

    const out = new URL("./.generated/", import.meta.url);
    await mkdir(out, { recursive: true });
    await writeFile(new URL("./.gitignore", out), "*\n");
    const file = new URL("./iconic.config.mjs", out);
    await writeFile(file, result.contents);
    const imported = await import(pathToFileURL(file.pathname).href);
    const config = imported.default;

    const icons = defineIconic({ base: config.base, sets: config.sets });
    expect(icons.aliases().sort()).toEqual(["home", "save"]);
    expect(icons.resolve("home").body).toContain("path");
    expect(icons.resolve("home", "sharp").body).toBe("<rect/>");
  });
});
