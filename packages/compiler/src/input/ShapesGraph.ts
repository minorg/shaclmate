import type { BlankNode, DatasetCore, NamedNode } from "@rdfjs/types";
import { datasetFactory, type PrefixMap, TermMap } from "@rdfx/collection";
import { shrinkQuads } from "@rdfx/curie";
import dataFactory from "@rdfx/data-factory";
import type { Logger } from "@rdfx/logger";
import { ResourceSet } from "@rdfx/resource";
import { AbstractShapesGraph } from "@shaclmate/shacl-ast";
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
  readonly #curieReferenceCounts: Record<string, number> = {};
  private readonly servicesByIdentifier: TermMap<
    BlankNode | NamedNode,
    generated.Service
  > = new TermMap();

  protected readonly typeFunctions = typeFunctions;

  get curieReferenceCounts(): Readonly<Record<string, number>> {
    return this.#curieReferenceCounts;
  }

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
    const shapesGraph = new ShapesGraph();

    if (options?.prefixMap) {
      dataset = datasetFactory.dataset([
        ...shrinkQuads(dataset, {
          dataFactory,
          prefixMap: options.prefixMap,
          referenceCounts: shapesGraph.curieReferenceCounts,
        }),
      ]);
    }

    return AbstractShapesGraph._fromDataset(
      dataset,
      options,
      shapesGraph,
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
      | generated.NodeShape.Discriminated
      | generated.Ontology.Discriminated
      | generated.PropertyGroup.Discriminated
      | generated.PropertyShape.Discriminated
      | generated.Service.Discriminated
    )[]
  ): ShapesGraph {
    const otherObjects: (
      | generated.NodeShape.Discriminated
      | generated.Ontology.Discriminated
      | generated.PropertyGroup.Discriminated
      | generated.PropertyShape.Discriminated
    )[] = [];
    const services: generated.Service[] = [];
    for (const object of objects) {
      if (generated.Service.isService(object)) {
        services.push(object);
      } else {
        otherObjects.push(object);
      }
    }

    const shapesGraph = AbstractShapesGraph._fromObjects<
      generated.NodeShape,
      generated.Ontology,
      generated.PropertyGroup,
      generated.PropertyShape,
      ShapesGraph
    >(new ShapesGraph(), ...otherObjects);

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
