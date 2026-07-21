import type { Contract, Schema, Set } from "@iconic/iconic";
import type { Entry } from "@iconic/iconic/catalog";
import type { NuxtIconicConfig } from "./config";

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { defineSchema, makeIconic } from "@iconic/iconic";
import { ROUTE } from "@iconic/iconic/catalog";
import { defineSprite } from "@iconic/iconic/svg";
import { resolveContract, resolveSet } from "@iconic/iconify";
import type { Req } from "@iconic/iconify";

import {
  defineNuxtModule,
  addTemplate,
  addTypeTemplate,
  addPlugin,
  addComponent,
  addImports,
  addServerHandler,
  addServerPlugin,
  createResolver,
} from "@nuxt/kit";

import {
  ASSETS,
  CONTAINER,
  ENTRIES,
  MOUNT,
  SETS,
  SPRITE,
  TOKEN_ENV,
} from "./constant";

/**
 * Nuxt module for iconic.
 *
 * At build time it resolves the configured icon refs against the Iconify
 * collections into a flat contract, writes it to the `iconic.mjs` build
 * template, derives the `Alias` union into `types/iconic.d.ts`, and registers
 * the runtime plugin, the `<Icon>` component, and the `useIconic` auto-import.
 * Set payloads are never bundled with the app: they are resolved to JSON,
 * mounted as nitro server assets, and served over the catalog wire protocol —
 * listings at `${MOUNT}/sets`, payloads at `${MOUNT}/sets/:id`.
 */
export default defineNuxtModule<NuxtIconicConfig>({
  meta: {
    name: "iconic",
    configKey: "iconic",
  },
  setup: async (options, nuxt) => {
    const resolver = createResolver(import.meta.url);

    if (!options.icons) {
      throw new Error(
        "iconic: no icons configured — set `iconic.icons` in nuxt.config.",
      );
    }

    /*
     * The remote catalog's auth, resolved for the build phase: the bearer token
     * from the shared env var (the same one `runtimeConfig` reads at runtime),
     * merged with any static headers. Attached to every resolution fetch so refs
     * from a private source resolve; absent when neither is set, so resolution
     * falls back to the plain default loader.
     */
    const token = process.env[TOKEN_ENV];
    const extra = options.catalog?.headers;
    const headers: Record<string, string> | undefined = token
      ? { ...extra, authorization: `Bearer ${token}` }
      : extra;
    const req: Req | undefined = headers
      ? async (src) => {
          const response = await fetch(src, { headers });
          if (!response.ok) {
            throw new Error(
              `iconic: fetching ${src.href} failed with ${response.status} ${response.statusText}`,
            );
          }
          return response.text();
        }
      : undefined;

    const contract = await resolveContract({
      req,
      config: {
        id: options.id ?? "app",
        name: options.name ?? "App Icons",
        icons: options.icons,
      },
    });

    const schema: Schema<Contract> = defineSchema(contract);
    const aliases = Object.keys(contract.icons);

    /*
     * The catalog, re-keyed by each set's own id — the identity the wire protocol
     * lists and retrieves by. Every set is resolved and proven against the
     * contract here, so the routes serve stored payloads without re-proving.
     */
    const catalog: Record<string, Set> = {};
    for (const ref of Object.values(options.sets ?? {})) {
      const { icons, ...identity } = ref;
      const set = await resolveSet({ req, identity, aliases, icons });
      schema.assert.set(set);
      if (set.id in catalog) {
        throw new Error(
          `iconic: duplicate set id "${set.id}" in \`iconic.sets\`.`,
        );
      }
      catalog[set.id] = set;
    }

    const entries = Object.values(catalog).map((set) => {
      const entry: Entry = { id: set.id, name: set.name };
      if (set.description !== undefined) entry.description = set.description;
      if (set.tags !== undefined) entry.tags = set.tags;
      return entry;
    });

    /*
     * The base contract's sprite, rendered here where the contract is in hand.
     * The server runtime cannot import the app's `#build` contract, so the markup
     * is written as an asset the nitro plugin reads and inlines.
     */
    const sprite = defineSprite(makeIconic({ contract, override: {} }));
    const markup = `<div id="${CONTAINER}">${sprite.sheet()}</div>`;

    /*
     * Set payloads stay off the app bundle: plain JSON files in the build
     * directory, mounted as nitro server assets. The write waits for
     * `build:before`, which fires after nuxt has cleared the build directory; a
     * write during setup would be wiped.
     */
    const assets = join(nuxt.options.buildDir, ASSETS);

    nuxt.hook("build:before", async () => {
      await mkdir(assets, { recursive: true });
      await writeFile(join(assets, ENTRIES), JSON.stringify(entries));
      await writeFile(join(assets, SETS), JSON.stringify(catalog));
      await writeFile(join(assets, SPRITE), markup);
    });

    nuxt.options.nitro.serverAssets ||= [];
    nuxt.options.nitro.serverAssets.push({ baseName: ASSETS, dir: assets });

    /*
     * The remote catalog, exposed to the server routes through runtimeConfig so
     * the base and headers are env-overridable and the token stays server-side.
     * `token` defaults empty and is filled at runtime by `${TOKEN_ENV}` — the
     * same variable read from `process.env` above — so one env var serves both
     * the build-time resolution and the runtime set loading.
     */
    nuxt.options.runtimeConfig.iconic = {
      base: options.catalog?.base ?? "",
      headers: options.catalog?.headers ?? {},
      token: "",
    };

    addServerHandler({
      route: `${MOUNT}/${ROUTE}`,
      method: "get",
      handler: resolver.resolve("./runtime/server/list"),
    });

    addServerHandler({
      route: `${MOUNT}/${ROUTE}/:id`,
      method: "get",
      handler: resolver.resolve("./runtime/server/get"),
    });

    addTypeTemplate({
      filename: "types/iconic.d.ts",
      write: true,
      getContents: () => {
        const union = Array.from(schema.enums.aliases)
          .map((alias) => JSON.stringify(alias))
          .join(" | ");
        return [
          `import type { IconifyIcon } from "@iconic/iconic";`,
          `export type Alias = ${union || "never"};`,
          `export type Overrides = Partial<Record<Alias, IconifyIcon>>;`,
        ].join("\n");
      },
    });

    addTemplate({
      filename: "iconic.mjs",
      write: true,
      getContents: () => `export const contract = ${JSON.stringify(contract)};`,
    });

    addTemplate({
      filename: "iconic.d.mts",
      write: true,
      getContents: () =>
        [
          `import type { Identity, IconifyIcon } from "@iconic/iconic";`,
          `import type { Alias } from "./types/iconic";`,
          `export const contract: Identity & { icons: Record<Alias, IconifyIcon> };`,
        ].join("\n"),
    });

    addPlugin({
      src: resolver.resolve("./runtime/plugin"),
    });

    addServerPlugin(resolver.resolve("./runtime/server/sprite"));

    addComponent({
      name: "Icon",
      filePath: resolver.resolve("./runtime/component/Icon"),
    });

    addImports([
      {
        from: resolver.resolve("./runtime/composable"),
        name: "useIconic",
      },
      {
        from: resolver.resolve("./runtime/store"),
        name: "accessIconic",
      },
      ...[
        "AppContract",
        "AppSet",
        "AppOverrides",
        "AppConfig",
        "AppIconic",
      ].map((name) => ({
        from: resolver.resolve("./runtime/types"),
        name,
        type: true,
      })),
    ]);
  },
});
