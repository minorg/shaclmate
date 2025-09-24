import type { DatasetCore } from "@rdfjs/types";
import { RdfjsShapesGraph } from "@shaclmate/shacl-ast";
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

export class ShapesGraph extends RdfjsShapesGraph<
  NodeShape,
  Ontology,
  PropertyGroup,
  PropertyShape,
  Shape
> {
  constructor({ dataset }: { dataset: DatasetCore }) {
    super({
      dataset,
      factory: {
        nodeShapeFromRdf({
          resource,
          shapesGraph,
        }: {
          resource: Resource;
          shapesGraph: ShapesGraph;
        }): Either<Error, NodeShape> {
          return generated.ShaclmateNodeShape.$fromRdf({
            ignoreRdfType: true,
            resource,
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
        },
        ontologyFromRdf({
          resource,
        }: {
          resource: Resource;
        }): Either<Error, Ontology> {
          return generated.ShaclmateOntology.$fromRdf({
            ignoreRdfType: true,
            resource,
          }).map((generatedOntology) => new Ontology(generatedOntology));
        },
        propertyGroupFromRdf({
          resource,
        }: {
          resource: Resource;
        }): Either<Error, PropertyGroup> {
          return generated.ShaclCorePropertyGroup.$fromRdf({
            ignoreRdfType: true,
            resource,
          }).map(
            (generatedPropertyGroup) =>
              new PropertyGroup(generatedPropertyGroup),
          );
        },
        propertyShapeFromRdf({
          resource,
          shapesGraph,
        }: {
          resource: Resource;
          shapesGraph: ShapesGraph;
        }): Either<Error, PropertyShape> {
          return generated.ShaclmatePropertyShape.$fromRdf({
            ignoreRdfType: true,
            resource,
          }).map(
            (generatedShape) => new PropertyShape(generatedShape, shapesGraph),
          );
        },
      },
    });
  }
}
