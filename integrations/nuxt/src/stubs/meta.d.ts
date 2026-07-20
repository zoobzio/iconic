// Typecheck-only stub for the `import.meta.client` / `import.meta.server` flags
// Nuxt defines at build time.
interface ImportMeta {
  readonly client: boolean;
  readonly server: boolean;
}
