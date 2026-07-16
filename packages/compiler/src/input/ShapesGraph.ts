import type { DatasetCore } from "@rdfjs/types";
import type { PrefixMap } from "@rdfx/collection";
import { AbstractShapesGraph } from "@shaclmate/shacl-ast";
import type { Either } from "purify-ts";
import type { Logger } from "ts-log";
import type { Ast } from "../ast/Ast.js";
import { Compiler } from "../Compiler.js";
import type { Generator } from "../generators/Generator.js";
import { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import * as generated from "./input.shaclmate.js";

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

  /**
   * Compile the shapes graph using the given generator and return the generator's output.
   */
  compile(parameters: {
    generator: Generator;
    logger: Logger;
  }): Either<Error, string> {
    return new Compiler(parameters).compile(this);
  }

  /**
   * Transform the shapes graph to an AST.
   */
  toAst({ logger }: { logger: Logger }): Either<Error, Ast> {
    return new ShapesGraphToAstTransformer({
      logger,
      shapesGraph: this,
    }).transform();
  }
}

const typeFunctions = {
  NodeShape: generated.NodeShape,
  Ontology: generated.Ontology,
  PropertyGroup: generated.PropertyGroup,
  PropertyShape: generated.PropertyShape,
} as const;
