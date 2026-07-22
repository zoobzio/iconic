import type { Entry, Page, Query, Sort } from "./types";

import { record } from "objectively";

/**
 * Whether a value is a whole non-negative count — the shape shared by `limit`,
 * `offset`, and `total`.
 */
const isCount = (value: unknown): value is number => {
  if (typeof value !== "number") {
    return false;
  }
  return Number.isInteger(value) && value >= 0;
};

/**
 * Whether a value is an array of strings — the shape of a `tags` filter or an
 * entry's tags.
 */
const isTags = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((tag) => typeof tag === "string");
};

/**
 * Whether a value is a well-formed {@link Sort}: a sortable entry field, a known
 * direction, and nothing else. Strict about unknown keys for the same reason as
 * {@link isQuery} — a sort is an instruction.
 */
const isSort = (value: unknown): value is Sort => {
  if (!record(value)) {
    return false;
  }
  for (const key of Object.keys(value)) {
    if (key !== "field" && key !== "direction") {
      return false;
    }
  }
  if (value.field !== "id" && value.field !== "name") {
    return false;
  }
  return value.direction === "asc" || value.direction === "desc";
};

/**
 * Whether a value is a well-formed {@link Query}: every present field of the
 * declared shape, and no fields beyond the model. Unknown keys are rejected
 * rather than ignored — a query is an instruction, and silently dropping a
 * filter the catalog does not understand would return unfiltered results
 * disguised as filtered ones.
 */
export const isQuery = (value: unknown): value is Query => {
  if (!record(value)) {
    return false;
  }
  for (const key of Object.keys(value)) {
    if (
      key !== "search" &&
      key !== "tags" &&
      key !== "sort" &&
      key !== "limit" &&
      key !== "offset"
    ) {
      return false;
    }
  }
  if (value.search !== undefined && typeof value.search !== "string") {
    return false;
  }
  if (value.tags !== undefined && !isTags(value.tags)) {
    return false;
  }
  if (value.sort !== undefined && !isSort(value.sort)) {
    return false;
  }
  if (value.limit !== undefined && !isCount(value.limit)) {
    return false;
  }
  return value.offset === undefined || isCount(value.offset);
};

/**
 * Whether a value carries a well-formed {@link Entry}: a non-empty id and name,
 * and — where present — a string description and a string-array of tags. Fields
 * beyond the model are tolerated, but the model's own optional fields must be
 * well-formed when present, so a source cannot slip malformed metadata past
 * discovery.
 */
const isEntry = (value: unknown): value is Entry => {
  if (!record(value)) {
    return false;
  }
  if (typeof value.id !== "string" || value.id.length === 0) {
    return false;
  }
  if (typeof value.name !== "string" || value.name.length === 0) {
    return false;
  }
  if (
    value.description !== undefined &&
    typeof value.description !== "string"
  ) {
    return false;
  }
  return value.tags === undefined || isTags(value.tags);
};

/**
 * Whether a value carries a well-formed {@link Page}: an array of entries and
 * the three paging counts. Structural only — coherence between the counts and
 * the entries is the producing catalog's responsibility.
 */
export const isPage = (value: unknown): value is Page => {
  if (!record(value)) {
    return false;
  }
  if (!Array.isArray(value.entries)) {
    return false;
  }
  if (!value.entries.every(isEntry)) {
    return false;
  }
  return isCount(value.total) && isCount(value.limit) && isCount(value.offset);
};
