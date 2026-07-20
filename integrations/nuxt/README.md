# @iconic/nuxt

Nuxt module for iconic. At build time it resolves the icon refs configured in
`nuxt.config` against the Iconify collections into a flat contract, derives the
`Alias` union for autocompletion, inlines an SVG sprite sheet server-side, and
registers the runtime `<Icon>` component, the `useIconic` composable, and a
catalog served over the wire protocol.

## Usage

Author icons as refs — the module resolves them with
[`@iconic/iconify`](../iconify) at build time:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@iconic/nuxt"],
  iconic: {
    icons: {
      home: "lucide:home",
      save: "lucide:content-save",
    },
    // Optional switchable sets, served over the catalog.
    sets: {
      sharp: { id: "sharp", name: "Sharp", icons: { home: "lucide:home" } },
    },
  },
});
```

Reference aliases by name — a typo fails to compile:

```vue
<template>
  <Icon name="home" />
</template>
```

## Runtime

`useIconic()` returns the icon service — the active contract, the applied set,
and the user override layer:

```ts
const icons = useIconic();
icons.resolve("home"); // the resolved icon literal
```

Sets are discovered and retrieved through the catalog the module mounts at
`/api/iconic/sets`; `apply` swaps the active document and the sprite re-renders in
place (the `<use href="#alias">` never changes). A selection does not yet persist
across reloads — that lands with SSR-safe restoration later.

## How it works

- **Build** — resolves `icons` into a contract, writes it to `#build/iconic.mjs`,
  and derives `Alias` into `#build/types/iconic.d.ts`. Sets are resolved to JSON,
  mounted as nitro server assets, and served by the catalog routes; payloads
  never enter the app bundle.
- **Server** — a nitro plugin inlines the base contract's sprite into the body so
  icons paint on first load.
- **Client** — a plugin builds the service over a reactive, SSR-serializable
  container and keeps the sprite in sync as sets and overrides change.
