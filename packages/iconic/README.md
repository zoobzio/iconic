# iconic

The public umbrella package. Re-exports the core engine (`defineIconic`) at the
root and the rest of the library behind subpaths, so integrations depend on
this one package rather than the internal `@iconic/*` set.

| Import          | Provides                                   |
| --------------- | ------------------------------------------ |
| `iconic`        | The icon engine — `defineIconic`           |
| `iconic/svg`    | The SVG sprite renderer — `defineSprite`   |
| `iconic/kit`    | The collection-authoring toolkit           |
| `iconic/config` | Config types and the `defineConfig` helper |
| `iconic/common` | Shared guards and object helpers           |

> Scaffold — implementation pending.
