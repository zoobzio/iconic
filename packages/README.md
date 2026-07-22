# Packages

| Package                      | Directory         | Description                                                         |
| ---------------------------- | ----------------- | ------------------------------------------------------------------- |
| [`iconic`](./iconic)         | `packages/iconic` | Umbrella package — core API at the root, `svg` subpath              |
| [`@iconic/core`](./core)     | `packages/core`   | The icon engine (`defineIconic`) — load, resolve, subset            |
| [`@iconic/svg`](./svg)       | `packages/svg`    | SVG sprite-sheet renderer (`defineSprite`)                          |
| [`@iconic/schema`](./schema) | `packages/schema` | Iconify JSON contract types and runtime validation (`defineSchema`) |
| [`@iconic/utils`](./utils)   | `packages/utils`  | Structural icon-set operations (`merge`/`subset`/`prune`/`diff`)    |

Framework integrations (e.g. the Nuxt module) live in [`../integrations`](../integrations).
