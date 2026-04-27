import type PrefixMap from "@rdfjs/prefix-map/PrefixMap.js";
import type { DatasetCore } from "@rdfjs/types";
import { AbstractShapesGraph } from "@shaclmate/shacl-ast";
import type { Either } from "purify-ts";
import type { Ast } from "../ast/Ast.js";
import { Compiler } from "../Compiler.js";
import type { TsFeature } from "../enums/TsFeature.js";
import type { Generator } from "../generators/Generator.js";
import { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import * as generated from "./generated.js";

export class ShapesGraph extends AbstractShapesGraph<
  generated.NodeShape,
  generated.Ontology,
  generated.PropertyGroup,
  generated.PropertyShape
> {
  compile(parameters: {
    generator: Generator;
    tsFeaturesDefault?: ReadonlySet<TsFeature>;
  }): Either<Error, string> {
    return new Compiler(parameters).compile(this);
  }

  static builder(): ShapesGraph.Builder {
    return new ShapesGraph.Builder();
  }

  toAst(options?: {
    tsFeaturesDefault?: ReadonlySet<TsFeature>;
  }): Either<Error, Ast> {
    return new ShapesGraphToAstTransformer({
      ...options,
      shapesGraph: this,
    }).transform();
  }
}

export namespace ShapesGraph {
  export class Builder extends AbstractShapesGraph.AbstractBuilder<
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

    build(): ShapesGraph {
      return new ShapesGraph({
        nodeShapesByIdentifier: this.nodeShapesByIdentifier,
        ontologiesByIdentifier: this.ontologiesByIdentifier,
        propertyGroupsByIdentifier: this.propertyGroupsByIdentifier,
        propertyShapesByIdentifier: this.propertyShapesByIdentifier,
      });
    }
  }
}
