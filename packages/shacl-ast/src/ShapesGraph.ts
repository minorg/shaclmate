import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import type { DatasetCore } from "@rdfjs/types";
import type { Either } from "purify-ts";
import { AbstractShapesGraph } from "./AbstractShapesGraph.js";
import * as generated from "./generated.js";

export class ShapesGraph extends AbstractShapesGraph<
  generated.NodeShape,
  generated.Ontology,
  generated.PropertyGroup,
  generated.PropertyShape
> {
  override addDataset(
    dataset: DatasetCore,
    options?: {
      ignoreUndefinedShapes?: boolean;
      prefixMap?: PrefixMap;
    },
  ): Either<Error, this> {
    return super
      .addDataset(dataset, {
        ...options,
        fromRdfResourceFunctions: {
          NodeShape: generated.NodeShape.$fromRdfResource,
          Ontology: generated.Ontology.$fromRdfResource,
          PropertyGroup: generated.PropertyGroup.$fromRdfResource,
          PropertyShape: generated.PropertyShape.$fromRdfResource,
        },
      })
      .map(() => this);
  }
}
