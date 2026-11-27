/**
 * Prefix a /public file path with the site's base path. GitHub Pages serves the site under /clavex,
 * and next/image does not add the base path to `src` on its own (next/link does).
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
