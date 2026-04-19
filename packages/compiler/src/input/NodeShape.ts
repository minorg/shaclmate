import type { NamedNode } from "@rdfjs/types";
import { NodeShape as ShaclAstNodeShape } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";
import { Either, List, type Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { IdentifierMintingStrategy } from "../enums/IdentifierMintingStrategy.js";
import type { TsObjectDeclarationType } from "../enums/TsObjectDeclarationType.js";
import type * as generated from "./generated.js";
import type {
  Ontology,
  PropertyGroup,
  PropertyShape,
  ShapesGraph,
} from "./index.js";
import type { Shape } from "./Shape.js";

export class NodeShape extends ShaclAstNodeShape<
  any,
  Ontology,
  PropertyGroup,
  PropertyShape,
  Shape
> {
  private readonly ancestorClassIris: readonly NamedNode[];
  private readonly childClassIris: readonly NamedNode[];
  private readonly descendantClassIris: readonly NamedNode[];
  private readonly generatedNodeShape: generated.NodeShape;
  private readonly parentClassIris: readonly NamedNode[];

  readonly isClass: boolean;
  readonly isList: boolean;
  readonly kind = "NodeShape";

  constructor({
    ancestorClassIris,
    childClassIris,
    descendantClassIris,
    generatedNodeShape,
    isClass,
    isList,
    parentClassIris,
    shapesGraph,
  }: {
    ancestorClassIris: readonly NamedNode[];
    generatedNodeShape: generated.NodeShape;
    childClassIris: readonly NamedNode[];
    descendantClassIris: readonly NamedNode[];
    isClass: boolean;
    isList: boolean;
    parentClassIris: readonly NamedNode[];
    shapesGraph: ShapesGraph;
  }) {
    super(generatedNodeShape, shapesGraph);

    if (
      ancestorClassIris.length > 0 ||
      childClassIris.length > 0 ||
      descendantClassIris.length > 0 ||
      isList ||
      parentClassIris.length > 0
    ) {
      invariant(isClass);
    }

    this.ancestorClassIris = ancestorClassIris;
    this.childClassIris = childClassIris;
    this.descendantClassIris = descendantClassIris;
    this.generatedNodeShape = generatedNodeShape;
    this.isClass = isClass;
    this.isList = isList;
    this.parentClassIris = parentClassIris;
  }

  get abstract(): Maybe<boolean> {
    return this.generatedNodeShape.abstract;
  }

  @Memoize()
  get ancestorNodeShapes(): Either<Error, readonly NodeShape[]> {
    return Either.sequence(
      this.ancestorClassIris
        .filter((classIri) => !classIri.equals(rdf.List))
        .map((classIri) => this.shapesGraph.nodeShapeByIdentifier(classIri)),
    );
  }

  @Memoize()
  get childNodeShapes(): Either<Error, readonly NodeShape[]> {
    return Either.sequence(
      this.childClassIris.flatMap((classIri) =>
        this.shapesGraph.nodeShapeByIdentifier(classIri),
      ),
    );
  }

  @Memoize()
  get comment(): Maybe<string> {
    return List.head(this.comments);
  }

  @Memoize()
  get descendantNodeShapes(): Either<Error, readonly NodeShape[]> {
    return Either.sequence(
      this.descendantClassIris.flatMap((classIri) =>
        this.shapesGraph.nodeShapeByIdentifier(classIri),
      ),
    );
  }

  get discriminantValue(): Maybe<string> {
    return this.generatedNodeShape.discriminantValue;
  }

  get extern(): Maybe<boolean> {
    return this.generatedNodeShape.extern;
  }

  get fromRdfType(): Maybe<NamedNode> {
    return this.generatedNodeShape.fromRdfType;
  }

  @Memoize()
  get identifierIn(): readonly NamedNode[] {
    return this.constraints.in_.filter(
      (value) => value.termType === "NamedNode",
    );
  }

  @Memoize()
  get identifierMintingStrategy(): Maybe<IdentifierMintingStrategy> {
    return this.generatedNodeShape.identifierMintingStrategy.map((iri) => {
      switch (iri.value) {
        case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode":
          return "blankNode";
        case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256":
          return "sha256";
        case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4":
          return "uuidv4";
        default:
          iri.value satisfies never;
          throw new RangeError(iri.value);
      }
    });
  }

  @Memoize()
  get label(): Maybe<string> {
    return List.head(this.labels);
  }

  get mutable(): Maybe<boolean> {
    return this.generatedNodeShape.mutable;
  }

  @Memoize()
  get parentNodeShapes(): Either<Error, readonly NodeShape[]> {
    return Either.sequence(
      this.parentClassIris
        .filter((classIri) => !classIri.equals(rdf.List))
        .map((classIri) => this.shapesGraph.nodeShapeByIdentifier(classIri)),
    );
  }

  @Memoize()
  get rdfType(): Maybe<NamedNode> {
    return this.generatedNodeShape.rdfType;
  }

  get shaclmateName(): Maybe<string> {
    return this.generatedNodeShape.name;
  }

  get toRdfTypes(): readonly NamedNode[] {
    return this.generatedNodeShape.toRdfTypes;
  }

  get tsFeatureExcludes() {
    return this.generatedNodeShape.tsFeatureExcludes;
  }

  get tsFeatureIncludes() {
    return this.generatedNodeShape.tsFeatureIncludes;
  }

  get tsImports(): readonly string[] {
    return this.generatedNodeShape.tsImports;
  }

  @Memoize()
  get tsObjectDeclarationType(): Maybe<TsObjectDeclarationType> {
    return this.generatedNodeShape.tsObjectDeclarationType.map((iri) => {
      switch (iri.value) {
        case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
          return "class";
        case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
          return "interface";
        default:
          throw new RangeError(iri.value);
      }
    });
  }
}
