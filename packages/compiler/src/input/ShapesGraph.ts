import { AbstractShapesGraph } from "@shaclmate/shacl-ast";
import type { Either } from "purify-ts";
import type { Ast } from "../ast/Ast.js";
import { Compiler } from "../Compiler.js";
import type { TsFeature } from "../enums/TsFeature.js";
import type { Generator } from "../generators/Generator.js";
import { ShapesGraphToAstTransformer } from "../ShapesGraphToAstTransformer.js";
import * as generated from "./generated.js";

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

  /**
   * Compile the shapes graph using the given generator and return the generator's output.
   */
  compile(parameters: {
    generator: Generator;
    tsFeaturesDefault?: ReadonlySet<TsFeature>;
  }): Either<Error, string> {
    return new Compiler(parameters).compile(this);
  }

  static builder(): ShapesGraph.Builder {
    return new ShapesGraph.Builder();
  }

  /**
   * Transform the shapes graph to an AST.
   */
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
    protected readonly typeFunctions = typeFunctions;

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
