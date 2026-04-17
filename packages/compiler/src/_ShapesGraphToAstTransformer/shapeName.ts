import type { Maybe } from "purify-ts";
import type * as input from "../input/index.js";

export function shapeName(shape: input.Shape): Maybe<string> {
  if (shape.kind === "PropertyShape") {
    return shape.name.alt(shape.shaclmateName);
  }
  return shape.shaclmateName;
}
