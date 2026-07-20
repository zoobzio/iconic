import { defineNitroPlugin } from "#imports";
import { makeIconic } from "iconic";
import { defineSprite } from "iconic/svg";
import { contract } from "#build/iconic.mjs";

import { CONTAINER } from "@iconic/nuxt/constant";

/*
 * The base contract's sprite, built once per server process. Inlining it into
 * the body means icons paint on first load without waiting for hydration; the
 * client plugin takes the same container over and keeps it in sync as sets apply.
 */
const sprite = defineSprite(makeIconic({ contract, override: {} }));
const markup = `<div id="${CONTAINER}">${sprite.sheet()}</div>`;

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    html.bodyPrepend.push(markup);
  });
});
