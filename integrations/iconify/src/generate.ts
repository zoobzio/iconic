import { SchemaError, defineSchema } from "@iconic/schema";

import type {
  GenerateOptions,
  GenerateResult,
  RefEntry,
  SchemeResolver,
} from "./types";
import { FILENAME } from "./constant";
import { emit } from "./emit";
import { plan } from "./refs";
import { assemble } from "./resolve";
import { acquire, iconifyResolver, request, urlResolver } from "./source";

/**
 * Runs a schema validation and re-frames any failure so each issue points at
 * the alias and the authored ref it came from, rather than a raw path into the
 * assembled catalog. A failure here means the resolved data is malformed —
 * either a resolution bug or a bad ref config — so the message says so.
 *
 * @param entries - The planned refs, for citing the offending ref.
 * @param run - The validation to guard.
 */
export const reframe = <T>(entries: RefEntry[], run: () => T): T => {
  try {
    return run();
  } catch (error) {
    if (!(error instanceof SchemaError)) {
      throw error;
    }
    const lines = error.issues.map((issue) => {
      const path = issue.path ?? [];
      const at = path.join(".");
      const origin = entries.find(
        (entry) =>
          path.length >= entry.path.length &&
          entry.path.every((segment, index) => segment === path[index]),
      );
      const cite = origin ? ` (from ${origin.raw})` : "";
      return `  ${at}: ${issue.message}${cite}`;
    });
    throw new Error(
      `@iconic/iconify: the resolved catalog violates iconic's schema — this is a resolution bug or a bad ref config —\n${lines.join("\n")}`,
      { cause: error },
    );
  }
};

/**
 * The programmatic entry point: parses the ref config, acquires the Iconify
 * collections (batched, local-first with API fallback), resolves every ref into
 * an icon literal, validates the assembled catalog through iconic's own schema,
 * and returns the emitted file. No filesystem writes — the caller owns I/O both
 * directions.
 *
 * @param options - The ref config plus I/O and resolver hooks.
 */
export const generate = async (
  options: GenerateOptions,
): Promise<GenerateResult> => {
  const cwd = options.cwd ?? process.cwd();
  const req = options.req ?? request;

  const entries = plan(options.config);
  const collections = await acquire(
    entries.map((entry) => entry.parsed),
    { cwd, req },
  );

  const resolvers: Record<string, SchemeResolver> = {
    iconify: iconifyResolver(collections),
    url: urlResolver(req),
    ...options.resolvers,
  };

  const catalog = await assemble(entries, resolvers);
  reframe(entries, () => defineSchema(catalog));

  const contents = emit(catalog, "the ref config");
  return { filename: options.filename ?? FILENAME, contents };
};
