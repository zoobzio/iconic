# iconic

A type-safe icon system that compiles [Iconify](https://iconify.design) icon
sets into optimized **SVG sprite sheets**, with framework integrations.

iconic separates the **catalog** — which icons exist, their geometry, and how
aliases and transforms relate them — from the **sheet** it emits. You register
one or more Iconify JSON collections, select the icons an app actually uses,
and iconic resolves each name through its aliases and inherited transforms into
a normalized symbol, then renders a single `<symbol>` sprite referenced with
`<use href="#icon-name">`. The catalog is carried in the types — icon names
autocomplete and typos fail to compile — and re-proved at runtime by a schema
derived from the Iconify JSON itself.

## Anatomy

An Iconify collection is a flat map of icon definitions plus optional aliases
and set-wide defaults (width/height/transforms). The core engine resolves an
icon name through that structure:

```ts
import { defineIconic } from "iconic";

const icons = defineIconic({
  collections: [lucide], // IconifyJSON documents
  include: ["home", "settings", "chevron-right"],
});

icons.resolve("home"); // normalized { body, width, height, viewBox }
```

Rendering to a sprite keeps every icon addressable:

```ts
import { defineSprite } from "iconic/svg";

const sprite = defineSprite(icons);

sprite.symbol("home"); // '<symbol id="home" ...>…</symbol>'
sprite.use("home"); // '<svg><use href="#home"/></svg>'
sprite.sheet(); // the full <svg> sprite of every included icon
```

Reusable icon collections — a curated set plus normalization — are authored
with the kit (`iconic/kit`).

## From Iconify JSON

iconic consumes the Iconify JSON format directly, so any of the
[200k+ open-source icons](https://icon-sets.iconify.design) published as
`@iconify-json/*` packages are a valid input — no conversion step.

## Workspace

| Directory                        | Contents                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| [`packages`](./packages)         | The library: the public [`iconic`](./packages/iconic) package and the internals behind it |
| [`integrations`](./integrations) | Framework bridges — the Nuxt module                                                       |
| `presets`                        | Reusable curated icon collections (none yet — the bucket is reserved)                     |
| `examples`                       | Consuming apps demonstrating the pipeline (none yet — the bucket is reserved)             |

## Development

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

## License

MIT
