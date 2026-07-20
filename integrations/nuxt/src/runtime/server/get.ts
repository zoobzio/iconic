import { createError, defineEventHandler, getRouterParam } from "h3";
import { isRecord } from "iconic/common";
import { useStorage } from "#imports";

import { ASSETS, SETS } from "@iconic/nuxt/constant";

/**
 * The catalog's retrieval route: answers with the stored set for the id, or 404
 * for a miss. Every payload was proven against the contract when the module wrote
 * it, so it is served as stored; a consuming client re-proves on receipt.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id", { decode: true });
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Set id required",
    });
  }

  const stored = await useStorage(`assets:${ASSETS}`).getItem(SETS);
  if (!isRecord(stored)) {
    throw createError({
      statusCode: 500,
      statusMessage: "Catalog payloads unavailable",
    });
  }

  const set = stored[id];
  if (set === undefined || set === null) {
    throw createError({
      statusCode: 404,
      statusMessage: "Set not found",
    });
  }

  return set;
});
