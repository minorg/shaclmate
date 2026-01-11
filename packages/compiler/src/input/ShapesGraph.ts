import { ShapesGraph as _ShapesGraph } from "@shaclmate/shacl-ast";
import { owl, rdf, rdfs } from "@tpluscode/rdf-ns-builders";
import type { Either } from "purify-ts";
import type { Resource } from "rdfjs-resource";
import { ancestorClassIris } from "./ancestorClassIris.js";
import { descendantClassIris } from "./descendantClassIris.js";
import * as generated from "./generated.js";
import {
  NodeShape,
  Ontology,
  PropertyGroup,
  PropertyShape,
  type Shape,
} from "./index.js";

export type ShapesGraph = _ShapesGraph<
  NodeShape,
  Ontology,
  PropertyGroup,
  PropertyShape,
  Shape
>;

export namespace ShapesGraph {
  class Factory extends _ShapesGraph.Factory<
    NodeShape,
    Ontology,
    PropertyGroup,
    PropertyShape,
    Shape
  > {
    protected override createNodeShape({
      resource,
      shapesGraph,
    }: {
      resource: Resource;
      shapesGraph: ShapesGraph;
    }): Either<Error, NodeShape> {
      return generated.ShaclmateNodeShape.$fromRdf(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      }).map(
        (generatedShape) =>
          new NodeShape({
            ancestorClassIris: ancestorClassIris(
              resource,
              Number.MAX_SAFE_INTEGER,
            ),
            childClassIris: descendantClassIris(resource, 1),
            descendantClassIris: descendantClassIris(
              resource,
              Number.MAX_SAFE_INTEGER,
            ),
            generatedShaclmateNodeShape: generatedShape,
            isClass:
              resource.isInstanceOf(owl.Class) ||
              resource.isInstanceOf(rdfs.Class),
            isList: resource.isSubClassOf(rdf.List),
            parentClassIris: ancestorClassIris(resource, 1),
            shapesGraph,
          }),
      );
    }

    protected override createOntology({
      resource,
    }: {
      resource: Resource;
    }): Either<Error, Ontology> {
      return generated.ShaclmateOntology.$fromRdf(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      }).map((generatedOntology) => new Ontology(generatedOntology));
    }

    protected override createPropertyGroup({
      resource,
    }: {
      resource: Resource;
    }): Either<Error, PropertyGroup> {
      return generated.ShaclCorePropertyGroup.$fromRdf(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      }).map(
        (generatedPropertyGroup) => new PropertyGroup(generatedPropertyGroup),
      );
    }

    protected override createPropertyShape({
      resource,
      shapesGraph,
    }: {
      resource: Resource;
      shapesGraph: ShapesGraph;
    }): Either<Error, PropertyShape> {
      return generated.ShaclmatePropertyShape.$fromRdf(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      }).map(
        (generatedShape) => new PropertyShape(generatedShape, shapesGraph),
      );
    }
  }

  const factory = new Factory();

  export function create(
    parameters: Parameters<Factory["createShapesGraph"]>[0],
  ): Either<Error, ShapesGraph> {
    return factory.createShapesGraph(parameters);
  }
}
