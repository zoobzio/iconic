import type { Sort } from "./types";

/**
 * The window size applied when a query names none.
 */
export const LIMIT = 20;

/**
 * The ordering applied when a query names none.
 */
export const SORT: Sort = { field: "name", direction: "asc" };

/**
 * The path segment the wire protocol hangs off a client's base URL: listings at
 * `{base}/sets`, payloads at `{base}/sets/{id}`.
 */
export const ROUTE = "sets";
