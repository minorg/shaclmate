import type { Either } from "purify-ts";
import type { Resource } from "rdfjs-resource";
import type { Factory } from "./Factory.js";
import { NodeShape } from "./NodeShape.js";
import { Ontology } from "./Ontology.js";
import { PropertyGroup } from "./PropertyGroup.js";
import { PropertyShape } from "./PropertyShape.js";
import type { Shape } from "./Shape.js";
import type { ShapesGraph } from "./ShapesGraph.js";
import * as generated from "./generated.js";

type DefaultNodeShape = NodeShape<
  any,
  Ontology,
  PropertyGroup,
  DefaultPropertyShape,
  DefaultShape
>;
type DefaultPropertyShape = PropertyShape<
  DefaultNodeShape,
  Ontology,
  PropertyGroup,
  any,
  DefaultShape
>;
type DefaultShape = Shape<
  DefaultNodeShape,
  Ontology,
  PropertyGroup,
  DefaultPropertyShape,
  any
>;
type DefaultShapesGraph = ShapesGraph<
  DefaultNodeShape,
  Ontology,
  PropertyGroup,
  DefaultPropertyShape,
  DefaultShape
>;

export const defaultFactory: Factory<
  DefaultNodeShape,
  Ontology,
  PropertyGroup,
  DefaultPropertyShape,
  DefaultShape
> = {
  nodeShapeFromRdf({
    resource,
    shapesGraph,
  }: {
    resource: Resource;
    shapesGraph: DefaultShapesGraph;
  }) {
    return generated.ShaclCoreNodeShape.$fromRdf({
      ignoreRdfType: true,
      resource,
    }).map((generatedShape) => new NodeShape(generatedShape, shapesGraph));
  },

  ontologyFromRdf({
    resource,
  }: {
    resource: Resource;
    shapesGraph: DefaultShapesGraph;
  }): Either<Error, Ontology> {
    return generated.OwlOntology.$fromRdf({
      ignoreRdfType: true,
      resource,
    }).map((generatedOntology) => new Ontology(generatedOntology));
  },

  propertyGroupFromRdf({
    resource,
  }: {
    resource: Resource;
    shapesGraph: DefaultShapesGraph;
  }): Either<Error, PropertyGroup> {
    return generated.ShaclCorePropertyGroup.$fromRdf({
      ignoreRdfType: true,
      resource,
    }).map((propertyGroup) => new PropertyGroup(propertyGroup));
  },

  propertyShapeFromRdf({
    resource,
    shapesGraph,
  }: { resource: Resource; shapesGraph: DefaultShapesGraph }): Either<
    Error,
    DefaultPropertyShape
  > {
    return generated.ShaclCorePropertyShape.$fromRdf({
      ignoreRdfType: true,
      resource,
    }).map((generatedShape) => new PropertyShape(generatedShape, shapesGraph));
  },
};
