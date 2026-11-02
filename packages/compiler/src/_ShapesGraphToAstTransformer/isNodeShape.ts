import type * as input from "../input/index.js";

export function isNodeShape(
  shape: input.UndiscriminatedShape,
): shape is input.NodeShape {
  return !("path" in shape);
}
