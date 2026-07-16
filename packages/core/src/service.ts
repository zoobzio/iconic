import type { Contract } from "@iconic/schema";

import type { Iconic, Options } from "./types";
import { makeIconic } from "./factory";

/**
 * Creates a runtime {@link Iconic} service from an authored contract — the front
 * door for defining an icon set inline. `C` is inferred with `const` from the
 * contract literal, so `resolve` autocompletes the contract's aliases and a typo
 * fails to compile. Seeds a fresh state container (`{ contract, override: {} }`)
 * around the contract and boots {@link makeIconic}.
 *
 * @param contract - The identified base document: identity plus the icons map.
 * @param options - Read/write middleware over the seeded container.
 * @returns An {@link Iconic} service over the contract.
 * @throws InvalidContractError when the contract violates its own shape.
 */
export const defineIconic = <const C extends Contract>(
  contract: C,
  options: Options<C> = {},
): Iconic<C> => makeIconic({ contract, override: {} }, options);
