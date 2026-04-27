import {
  ShapesGraph as _ShapesGraph,
  type CurieFactory,
} from "@shaclmate/shacl-ast";
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
      // .map((generatedShape) => {
      //   let isClass =
      //     resource.isInstanceOf(owl.Class) || resource.isInstanceOf(rdfs.Class);

      //   const isList = resource.isSubClassOf(rdf.List);
      //   if (isList) {
      //     isClass = true; // RDFS entailment: if A rdfs:subClassOf rdf:List then A is an rdfs:Class
      //   }

      //   const ancestorClassIris_ = ancestorClassIris(
      //     resource,
      //     Number.MAX_SAFE_INTEGER,
      //   ).filter((ancestorClassIri) => !ancestorClassIri.equals(rdf.List));
      //   if (ancestorClassIris_.length > 0) {
      //     isClass = true; // RDFS entailment: if A rdfs:subClassOf B then both A and B are rdfs:Class's
      //   }

      //   const descendantClassIris_ = descendantClassIris(
      //     resource,
      //     Number.MAX_SAFE_INTEGER,
      //   );
      //   if (descendantClassIris_.length > 0) {
      //     isClass = true; // RDFS entailment, see above
      //   }

      //   return {
      //     ...generatedShape,
      //     ancestorClassIris: ancestorClassIris_,
      //     childClassIris: descendantClassIris(resource, 1),
      //     descendantClassIris: descendantClassIris_,
      //     isClass,
      //     isList,
      //     parentClassIris: ancestorClassIris(resource, 1).filter(
      //       (ancestorClassIri) => !ancestorClassIri.equals(rdf.List),
      //     ),
      //   };
      // });
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
      curieFactory,
      resource,
    }: {
      curieFactory: CurieFactory;
      resource: Resource;
    }): Either<Error, generated.PropertyShape> {
      return generated.PropertyShape.$fromRdfResource(resource, {
        ignoreRdfType: true,
        preferredLanguages: this.preferredLanguages,
      }).map((generatedShape) => ({
        ...generatedShape,
        path:
          (generatedShape.path.termType === "NamedNode"
            ? curieFactory.create(generatedShape.path).extract()
            : undefined) ?? generatedShape.path,
      }));
    }
  }

  const factory = new Factory();

  export function create(
    parameters: Parameters<Factory["createShapesGraph"]>[0],
  ): Either<Error, ShapesGraph> {
    return factory.createShapesGraph(parameters);
  }
}
