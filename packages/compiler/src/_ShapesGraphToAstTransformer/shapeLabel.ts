import { List, type Maybe } from "purify-ts";
import type * as input from "../input/index.js";

export function shapeLabel(shape: input.Shape): Maybe<string> {
  return List.head(shape.labels);
}
