import { FetchListener, FetchListenerFn } from "../fetch-listener";

declare var Deno: unknown;
declare var Bun: unknown;

export async function listen(fn: FetchListenerFn): Promise<FetchListener> {
  /* c8 ignore start */
  if (typeof Deno !== "undefined") {
    const module = await import("./deno");
    return module.listen(fn);
  } else if (typeof Bun !== "undefined") {
    const module = await import("./bun");
    return module.listen(fn);
  } else if (typeof process !== "undefined") {
  /* c8 ignore end */
    const module = await import("./node");
    return module.listen(fn);
  }
  const module = await import("./memory");
  return module.listen(fn);
}
