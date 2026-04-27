import { ShapesGraph as _ShapesGraph } from "@shaclmate/shacl-ast";
import type { Either } from "purify-ts";
import type { Resource } from "rdfjs-resource";
import * as generated from "./generated.js";

export type ShapesGraph = _ShapesGraph<
  generated.NodeShape,
  generated.Ontology,
  generated.PropertyGroup,
  generated.PropertyShape,
  generated.Shape
>;

export namespace ShapesGraph {
  class Factory extends _ShapesGraph.Factory<
    generated.NodeShape,
    generated.Ontology,
    generated.PropertyGroup,
    generated.PropertyShape,
    generated.Shape
  > {
    protected override createNodeShape({
      resource,
    }: {
      resource: Resource;
    }): Either<Error, generated.NodeShape> {
      return generated.NodeShape.$fromRdfResource(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      });
    }

    protected override createOntology({
      resource,
    }: {
      resource: Resource;
    }): Either<Error, generated.Ontology> {
      return generated.Ontology.$fromRdfResource(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      });
    }

    protected override createPropertyGroup({
      resource,
    }: {
      resource: Resource;
    }): Either<Error, generated.PropertyGroup> {
      return generated.PropertyGroup.$fromRdfResource(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      });
    }

    protected override createPropertyShape({
      resource,
    }: {
      resource: Resource;
    }): Either<Error, generated.PropertyShape> {
      return generated.PropertyShape.$fromRdfResource(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      });
    }
  }

  const factory = new Factory();

  export function create(
    parameters: Parameters<Factory["createShapesGraph"]>[0],
  ): Either<Error, ShapesGraph> {
    return factory.createShapesGraph(parameters);
  }
}
