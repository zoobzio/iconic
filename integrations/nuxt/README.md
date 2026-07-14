# @iconic/nuxt

Nuxt module for iconic. At build time it resolves the configured icon
collections and included icons into an SVG sprite sheet, injects it, and
registers the runtime `<Icon>` component and `useIcon` composable. Depends only
on the public [`iconic`](../../packages/iconic) package.

> Scaffold — implementation pending.

## Usage

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@iconic/nuxt"],
  iconic: {
    collections: ["lucide"],
  },
});
```
