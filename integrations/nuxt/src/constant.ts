/**
 * The mount point of the module's catalog endpoints. The wire routes extend
 * this base — listings at `${MOUNT}/sets`, payloads at `${MOUNT}/sets/{id}` —
 * and a catalog client on the app side points its `base` here.
 */
export const MOUNT = "/api/iconic";

/**
 * The server-assets base the module writes the catalog under: the routes read
 * their data from the `assets:${ASSETS}` storage.
 */
export const ASSETS = "iconic";

/**
 * The asset key of the manifest: the entries the listing route filters, orders,
 * and windows.
 */
export const ENTRIES = "entries.json";

/**
 * The asset key of the payload record: the sets the retrieval route answers
 * with, keyed by id.
 */
export const SETS = "sets.json";

/**
 * The id of the DOM element holding the inline sprite sheet: written into the
 * body server-side, kept in sync client-side.
 */
export const CONTAINER = "iconic-sprite";
