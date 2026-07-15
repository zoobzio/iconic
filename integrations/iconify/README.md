# @iconic/iconify

Codegen from an authored **ref config** to an `iconic.config.ts` of resolved
icon literals. The build-layer analog of iconic's runtime: it holds all the
IconifyJSON handling — loading collections, flattening alias chains, merging
transforms — so the runtime carries none of it.

You name the icons an app uses by their Iconify reference; `generate()` resolves
each one into a self-contained icon definition literal and emits a flat catalog
the runtime consumes directly.

## Ref grammar

- `prefix:name` — an icon from an Iconify collection. Resolved from a local
  `@iconify-json/{prefix}` package when installed, else fetched (batched, one
  request per prefix) from the Iconify API.
- `$/host/path` — a single icon fetched from `https://host/path`, which returns
  one `IconifyIcon` as JSON.

## Programmatic

`generate()` does no filesystem writes and owns no I/O: a caller-supplied `req`
intercepts every fetch (authentication, offline fixtures), and the result is
the file contents for the caller to write.

```ts
import { writeFile } from "node:fs/promises";
import { generate } from "@iconic/iconify";

const { filename, contents } = await generate({
  config: {
    base: { home: "lucide:home", save: "lucide:content-save" },
    sets: { solid: { home: "lucide-solid:home" } },
  },
});

await writeFile(filename, contents);
```

The emitted `iconic.config.ts`:

```ts
import { defineIconicConfig } from "iconic/config";

export default defineIconicConfig({
  base: { home: { body: "…", width: 24, height: 24 } },
  sets: { solid: { home: { body: "…" } } },
});
```

## Boundaries

- Resolution is scheme-keyed; `options.resolvers` overrides the built-in
  `iconify` / `url` behaviour (a custom endpoint, an offline fixture).
- Every unresolvable ref is collected and reported together, each as
  `path → ref`.
- The assembled catalog is validated through `@iconic/schema` before emission;
  a failure there is a resolution bug or a bad config, cited to the ref.
- `$/` responses are trusted, not sanitized — untrusted sources are a separate
  concern.
