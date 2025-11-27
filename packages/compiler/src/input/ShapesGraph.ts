import type { ShapesGraph as _ShapesGraph } from "@shaclmate/shacl-ast";
import type {
  NodeShape,
  Ontology,
  PropertyGroup,
  PropertyShape,
  Shape,
} from "./index.js";

export type ShapesGraph = _ShapesGraph<
  NodeShape,
  Ontology,
  PropertyGroup,
  PropertyShape,
  Shape
>;
