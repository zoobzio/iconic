import type { IconifyIcon } from "@iconify/types";

/**
 * The authored ref config: the input to {@link generate}. Each alias maps to a
 * ref *string* rather than an icon literal — `prefix:name` to draw from an
 * Iconify collection, or `$/host/path` to fetch a single icon from a URL. The
 * build layer resolves every ref into an icon definition literal; the runtime
 * catalog it emits is the resolved form.
 */
export type RefConfig = {
  /** The base contract: each semantic alias mapped to its icon ref. */
  base: Record<string, string>;

  /**
   * The switchable override sets, keyed by name; each rebinds a subset of the
   * base aliases with its own refs.
   */
  sets?: Record<string, Record<string, string>>;
};

/**
 * A ref parsed into a resolvable shape, discriminated by scheme. `iconify` is
 * a `prefix:name` reference into an Iconify collection; `url` is a single icon
 * fetched from `https://host/path`. The scheme keys the resolver that turns it
 * into an icon literal.
 */
export type ParsedRef =
  | { scheme: "iconify"; provider: string; prefix: string; name: string }
  | { scheme: "url"; url: URL };

/**
 * Resolves one parsed ref into an icon literal, or `null` when the ref names
 * nothing the resolver can supply (a collected miss). A resolver may throw for
 * a hard failure — a malformed response, an unreachable endpoint — which
 * aborts generation rather than being collected. Keyed by scheme in
 * {@link GenerateOptions.resolvers}, so a caller can override the built-in
 * `iconify` / `url` behaviour.
 */
export type SchemeResolver = (ref: ParsedRef) => Promise<IconifyIcon | null>;

/**
 * The document loader every fetch passes through — the seam for authenticated
 * or offline sources. Receives the URL, returns the raw response text. Defaults
 * to plain `fetch` (throwing on a non-OK status).
 */
export type Req = (src: URL) => Promise<string>;

/**
 * Options for {@link generate}. The caller owns all I/O: `req` intercepts every
 * network fetch, and the returned contents are never written to disk here.
 */
export type GenerateOptions = {
  /** The authored ref config to resolve and emit. */
  config: RefConfig;

  /**
   * The working directory local `@iconify-json/*` package resolution runs from;
   * defaults to the process working directory.
   */
  cwd?: string;

  /** The emitted filename; defaults to `iconic.config.ts`. */
  filename?: string;

  /** The document loader; defaults to plain `fetch`. */
  req?: Req;

  /**
   * Scheme resolvers merged over the built-ins, so a caller can override the
   * `iconify` or `url` resolution (a custom endpoint, an offline fixture).
   */
  resolvers?: Record<string, SchemeResolver>;
};

/**
 * What {@link generate} returns: the emitted filename and the TypeScript source
 * text. The caller owns writing it to disk.
 */
export type GenerateResult = {
  filename: string;
  contents: string;
};

/**
 * One planned ref: its location in the emitted catalog, the alias it binds, the
 * authored string, and the parsed form. The unit of work acquisition and
 * resolution both walk.
 */
export type RefEntry = {
  path: string[];
  alias: string;
  raw: string;
  parsed: ParsedRef;
};
