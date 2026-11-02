export {
  NodeShape,
  Ontology,
  Operation,
  PropertyGroup,
  PropertyShape,
  Service,
  Shape as DiscriminatedShape,
} from "./input.shaclmate.js";

import type { Shape as DiscriminatedShape } from "./input.shaclmate.js";
export type UndiscriminatedShape = Omit<DiscriminatedShape, "$type">;
export * from "./ShapesGraph.js";
