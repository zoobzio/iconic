# iconic

A type-safe icon system that resolves [Iconify](https://iconify.design) icons
into a flat catalog of definition literals and renders them as optimized **SVG
sprite sheets**, with framework integrations.

iconic separates the **source** — the Iconify JSON collections icons are drawn
from, with their aliases and inherited transforms — from the **catalog** the
runtime carries. The build layer resolves each authored reference through the
Iconify spec once, at build time, and emits a flat `alias → icon definition
literal` map. The runtime never holds a collection and does no alias-tree
resolution: it looks an alias up, returns the stored literal, and renders it.
The catalog is carried in the types — icon names autocomplete and typos fail to
compile — and re-proved at runtime by a schema over the Iconify icon shape.

## Anatomy

You author a **ref config** naming the icons an app uses by their Iconify
reference:

```ts
// icons authored as references (build-layer input)
{
  base: { home: "lucide:home", save: "lucide:content-save" },
  sets: { solid: { home: "lucide-solid:home" } },
}
```

The `@iconic/iconify` build layer resolves every reference against the Iconify
collections — flattening alias chains, merging transforms, baking in
collection-root defaults — and emits a **literal document**: a plain
`iconic.config.ts` of resolved icon data, no collections retained.

```ts
import { defineIconicConfig } from "iconic/config";

export default defineIconicConfig({
  base: { home: { body: "…", width: 24, height: 24 } },
  sets: { solid: { home: { body: "…" } } },
});
```

The runtime engine takes that literal document and resolves an alias to its
stored icon by a plain lookup (the active set's override, else the base):

```ts
import { defineIconic } from "iconic";

const icons = defineIconic({
  base: { home: { body: "…", width: 24, height: 24 } },
});

icons.resolve("home"); // the stored { body, width, height } literal
```

Rendering to a sprite keeps every icon addressable:

```ts
import { defineSprite } from "iconic/svg";

const sprite = defineSprite(icons);

sprite.symbol("home"); // '<symbol id="home" ...>…</symbol>'
sprite.href("home"); // '#home' — for <use href="#home"/>
sprite.sheet(); // the full <svg> sprite of every icon and set override
```

Reusable icon packs — a curated base plus override sets — are authored with the
kit (`iconic/kit`).

## From Iconify JSON

iconic draws from the Iconify JSON format directly, so any of the
[200k+ open-source icons](https://icon-sets.iconify.design) published as
`@iconify-json/*` packages are a valid source. The `@iconic/iconify` generation
package resolves references from those local packages, with an Iconify-API
fallback, and can also fetch a single icon from a URL.

## Workspace

| Directory                        | Contents                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| [`packages`](./packages)         | The library: the public [`iconic`](./packages/iconic) package and the internals behind it |
| [`integrations`](./integrations) | Build and framework bridges — the `@iconic/iconify` generator and the Nuxt module         |
| `presets`                        | Reusable curated icon packs (none yet — the bucket is reserved)                            |
| `examples`                       | Consuming apps demonstrating the pipeline (none yet — the bucket is reserved)              |

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
