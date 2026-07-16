import type { DatasetCore } from "@rdfjs/types";
import type { PrefixMap } from "@rdfx/collection";
import type { Either } from "purify-ts";
import { AbstractShapesGraph } from "./AbstractShapesGraph.js";
import * as generated from "./shacl-ast.shaclmate.js";

const typeFunctions = {
  NodeShape: generated.NodeShape,
  Ontology: generated.Ontology,
  PropertyGroup: generated.PropertyGroup,
  PropertyShape: generated.PropertyShape,
} as const;

export class ShapesGraph extends AbstractShapesGraph<
  generated.NodeShape,
  generated.Ontology,
  generated.PropertyGroup,
  generated.PropertyShape
> {
  protected readonly typeFunctions = typeFunctions;

  static fromDataset(
    dataset: DatasetCore,
    options?: {
      ignoreUndefinedShapes?: boolean;
      prefixMap?: PrefixMap;
    },
  ): Either<Error, ShapesGraph> {
    return AbstractShapesGraph._fromDataset(
      dataset,
      options,
      new ShapesGraph(),
    );
  }

  static fromShapes(
    ...objects: readonly (
      | generated.NodeShape
      | generated.Ontology
      | generated.PropertyGroup
      | generated.PropertyShape
    )[]
  ): ShapesGraph {
    return AbstractShapesGraph._fromShapes(new ShapesGraph(), ...objects);
  }
}
