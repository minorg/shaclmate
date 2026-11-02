import type * as input from "../input/index.js";

export function isPropertyShape(
  shape: input.UndiscriminatedShape,
): shape is input.PropertyShape {
  return "path" in shape;
}
