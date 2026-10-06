import type { BlankNode, DatasetCore, NamedNode } from "@rdfjs/types";
import { type PrefixMap, TermMap } from "@rdfx/collection";
import dataFactory from "@rdfx/data-factory";
import type { Logger } from "@rdfx/logger";
import { ResourceSet } from "@rdfx/resource";
import { AbstractShapesGraph, curieDataset } from "@shaclmate/shacl-ast";

import { Either } from "purify-ts";
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
  private readonly servicesByIdentifier: TermMap<
    BlankNode | NamedNode,
    generated.Service
  > = new TermMap();

  protected readonly typeFunctions = typeFunctions;

  get services(): readonly generated.Service[] {
    return [...this.servicesByIdentifier.values()];
  }

  static fromDataset(
    dataset: DatasetCore,
    options?: {
      ignoreUndefinedShapes?: boolean;
      prefixMap?: PrefixMap;
    },
  ): Either<Error, ShapesGraph> {
    return AbstractShapesGraph._fromDataset(
      options?.prefixMap ? curieDataset(dataset, options.prefixMap) : dataset,
      options,
      new ShapesGraph(),
    ).chain((shapesGraph) => {
      const resourceSet = new ResourceSet({ dataFactory, dataset });

      for (const resource of resourceSet.instancesOf(
        generated.Service.schema.properties.$rdfType.fromRdfType,
      )) {
        const serviceEither = generated.Service.fromRdfResource(resource);
        if (serviceEither.isLeft()) {
          return serviceEither;
        }
        const service = serviceEither.extract() as generated.Service;
        shapesGraph.servicesByIdentifier.set(service.$identifier(), service);
      }

      return Either.of(shapesGraph);
    });
  }

  static fromObjects(
    ...objects: readonly (
      | generated.NodeShape
      | generated.Ontology
      | generated.PropertyGroup
      | generated.PropertyShape
      | generated.Service
    )[]
  ): ShapesGraph {
    const otherObjects: (
      | generated.NodeShape
      | generated.Ontology
      | generated.PropertyGroup
      | generated.PropertyShape
    )[] = [];
    const services: generated.Service[] = [];
    for (const object of objects) {
      if (generated.Service.isService(object)) {
        services.push(object);
      } else {
        otherObjects.push(object);
      }
    }

    const shapesGraph = AbstractShapesGraph._fromObjects(
      new ShapesGraph(),
      ...otherObjects,
    );

    for (const service of services) {
      shapesGraph.servicesByIdentifier.set(service.$identifier(), service);
    }

    return shapesGraph;
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
