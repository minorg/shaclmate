import type { NamedNode } from "@rdfjs/types";
import { NodeShape as ShaclCoreNodeShape } from "@shaclmate/shacl-ast";
import { rdf } from "@tpluscode/rdf-ns-builders";
import { Either, List, Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type {
  IdentifierMintingStrategy,
  TsFeature,
  TsObjectDeclarationType,
} from "../enums/index.js";
import type * as generated from "./generated.js";
import type {
  Ontology,
  PropertyGroup,
  PropertyShape,
  ShapesGraph,
} from "./index.js";
import type { Shape } from "./Shape.js";
import { tsFeatures } from "./tsFeatures.js";

export class NodeShape extends ShaclCoreNodeShape<
  any,
  Ontology,
  PropertyGroup,
  PropertyShape,
  Shape
> {
  private readonly ancestorClassIris: readonly NamedNode[];
  private readonly childClassIris: readonly NamedNode[];
  private readonly descendantClassIris: readonly NamedNode[];
  private readonly generatedShaclmateNodeShape: generated.ShaclmateNodeShape;
  private readonly parentClassIris: readonly NamedNode[];

  readonly isClass: boolean;
  readonly isList: boolean;

  constructor({
    ancestorClassIris,
    childClassIris,
    descendantClassIris,
    generatedShaclmateNodeShape,
    isClass,
    isList,
    parentClassIris,
    shapesGraph,
  }: {
    ancestorClassIris: readonly NamedNode[];
    generatedShaclmateNodeShape: generated.ShaclmateNodeShape;
    childClassIris: readonly NamedNode[];
    descendantClassIris: readonly NamedNode[];
    isClass: boolean;
    isList: boolean;
    parentClassIris: readonly NamedNode[];
    shapesGraph: ShapesGraph;
  }) {
    super(generatedShaclmateNodeShape, shapesGraph);
    this.ancestorClassIris = ancestorClassIris;
    this.childClassIris = childClassIris;
    this.descendantClassIris = descendantClassIris;
    this.generatedShaclmateNodeShape = generatedShaclmateNodeShape;
    this.isClass = isClass;
    this.isList = isList;
    this.parentClassIris = parentClassIris;
  }

  get abstract(): Maybe<boolean> {
    return this.generatedShaclmateNodeShape.abstract;
  }

  @Memoize()
  get ancestorNodeShapes(): Either<Error, readonly NodeShape[]> {
    return Either.sequence(
      this.isClass
        ? this.ancestorClassIris
            .filter((classIri) => !classIri.equals(rdf.List))
            .map((classIri) => this.shapesGraph.nodeShapeByIdentifier(classIri))
        : [],
    );
  }

  @Memoize()
  get childNodeShapes(): Either<Error, readonly NodeShape[]> {
    return Either.sequence(
      this.isClass
        ? this.childClassIris.flatMap((classIri) =>
            this.shapesGraph.nodeShapeByIdentifier(classIri),
          )
        : [],
    );
  }

  get comment(): Maybe<string> {
    return List.head(this.comments);
  }

  @Memoize()
  get descendantNodeShapes(): Either<Error, readonly NodeShape[]> {
    return Either.sequence(
      this.isClass
        ? this.descendantClassIris.flatMap((classIri) =>
            this.shapesGraph.nodeShapeByIdentifier(classIri),
          )
        : [],
    );
  }

  get discriminantValue(): Maybe<string> {
    return this.generatedShaclmateNodeShape.discriminantValue;
  }

  get export(): Maybe<boolean> {
    return this.generatedShaclmateNodeShape.export_;
  }

  get extern(): Maybe<boolean> {
    return this.generatedShaclmateNodeShape.extern;
  }

  get fromRdfType(): Maybe<NamedNode> {
    return this.generatedShaclmateNodeShape.fromRdfType;
  }

  @Memoize()
  get identifierIn(): readonly NamedNode[] {
    return this.constraints.in_.filter(
      (value) => value.termType === "NamedNode",
    );
  }

  @Memoize()
  get identifierMintingStrategy(): Maybe<IdentifierMintingStrategy> {
    return this.generatedShaclmateNodeShape.identifierMintingStrategy.map(
      (iri) => {
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
      },
    );
  }

  get label(): Maybe<string> {
    return List.head(this.labels);
  }

  get mutable(): Maybe<boolean> {
    return this.generatedShaclmateNodeShape.mutable;
  }

  @Memoize()
  get parentNodeShapes(): Either<Error, readonly NodeShape[]> {
    return Either.sequence(
      this.isClass
        ? this.parentClassIris
            .filter((classIri) => !classIri.equals(rdf.List))
            .map((classIri) => this.shapesGraph.nodeShapeByIdentifier(classIri))
        : [],
    );
  }

  @Memoize()
  get rdfType(): Maybe<NamedNode> {
    // Check for an explicit shaclmate:rdfType
    const rdfType = this.generatedShaclmateNodeShape.rdfType;
    if (rdfType.isJust()) {
      return rdfType;
    }

    // No explicit shaclmate:rdfType
    // If the shape is a class, not abstract, and identified by an IRI then use the shape IRI as the fromRdfType.
    if (
      !this.abstract.orDefault(false) &&
      this.isClass &&
      this.identifier.termType === "NamedNode"
    ) {
      return Maybe.of(this.identifier);
    }

    return Maybe.empty();
  }

  get shaclmateName(): Maybe<string> {
    return this.generatedShaclmateNodeShape.name;
  }

  get toRdfTypes(): readonly NamedNode[] {
    return this.generatedShaclmateNodeShape.toRdfTypes;
  }

  @Memoize()
  get tsFeatures(): Maybe<ReadonlySet<TsFeature>> {
    return tsFeatures(this.generatedShaclmateNodeShape);
  }

  get tsImports(): readonly string[] {
    return this.generatedShaclmateNodeShape.tsImports;
  }

  @Memoize()
  get tsObjectDeclarationType(): Maybe<TsObjectDeclarationType> {
    return this.generatedShaclmateNodeShape.tsObjectDeclarationType.map(
      (iri) => {
        switch (iri.value) {
          case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
            return "class";
          case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
            return "interface";
          default:
            throw new RangeError(iri.value);
        }
      },
    );
  }
}
