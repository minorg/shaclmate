import type * as rdfjs from "@rdfjs/types";
import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { Either, Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type * as generated from "./generated.js";
import type { NodeKind } from "./NodeKind.js";
import type { OntologyLike } from "./OntologyLike.js";
import type { ShapesGraph } from "./ShapesGraph.js";

export abstract class Shape<
  NodeShapeT extends ShapeT,
  OntologyT extends OntologyLike,
  PropertyGroupT,
  PropertyShapeT extends ShapeT,
  ShapeT,
> {
  abstract readonly constraints: Shape.Constraints<
    NodeShapeT,
    OntologyT,
    PropertyGroupT,
    PropertyShapeT,
    ShapeT
  >;

  constructor(
    private readonly generatedShape: Omit<generated.Shape, "$type">,
    protected readonly shapesGraph: ShapesGraph<
      NodeShapeT,
      OntologyT,
      PropertyGroupT,
      PropertyShapeT,
      ShapeT
    >,
  ) {}

  get comments(): readonly string[] {
    return this.generatedShape.comments;
  }

  get identifier(): BlankNode | NamedNode {
    return this.generatedShape.$identifier;
  }

  @Memoize()
  get isDefinedBy(): Either<Error, Maybe<OntologyT>> {
    if (this.generatedShape.isDefinedBy.isJust()) {
      // If there's an rdfs:isDefinedBy statement on the shape then don't fall back to anything else
      return this.shapesGraph
        .ontologyByIdentifier(this.generatedShape.isDefinedBy.unsafeCoerce())
        .map(Maybe.of);
    }

    // No rdfs:isDefinedBy statement on the shape

    const ontologies = this.shapesGraph.ontologies;
    if (ontologies.length === 1) {
      // If there's a single ontology in the shapes graph, consider the shape a part of the ontology
      return Either.of(Maybe.of(ontologies[0]));
    }

    if (this.identifier.termType === "NamedNode") {
      const prefixOntologies = ontologies.filter(
        (ontology) =>
          ontology.identifier.termType === "NamedNode" &&
          this.identifier.value.startsWith(ontology.identifier.value),
      );
      if (prefixOntologies.length === 1) {
        // If there's a single ontology whose IRI is a prefix of this shape's IRI, consider the shape a part of the ontology
        return Either.of(Maybe.of(prefixOntologies[0]));
      }
    }

    return Either.of(Maybe.empty());
  }

  get labels(): readonly string[] {
    return this.generatedShape.labels;
  }
}

export namespace Shape {
  export class Constraints<
    NodeShapeT extends ShapeT,
    OntologyT extends OntologyLike,
    PropertyGroupT,
    PropertyShapeT extends ShapeT,
    ShapeT,
  > {
    constructor(
      private readonly generatedShape: Omit<generated.Shape, "$type">,
      protected readonly shapesGraph: ShapesGraph<
        NodeShapeT,
        OntologyT,
        PropertyGroupT,
        PropertyShapeT,
        ShapeT
      >,
    ) {}

    @Memoize()
    get and(): Either<Error, readonly ShapeT[]> {
      return this.shapeListTakingConstraint(this.generatedShape.and);
    }

    get classes(): readonly NamedNode[] {
      return this.generatedShape.classes;
    }

    get datatype(): Maybe<NamedNode> {
      return this.generatedShape.datatype;
    }

    get hasValues(): readonly (Literal | NamedNode)[] {
      return this.generatedShape.hasValues;
    }

    get in_(): readonly (Literal | NamedNode)[] {
      return this.generatedShape.in_.orDefault([]);
    }

    get languageIn(): readonly string[] {
      return this.generatedShape.languageIn.orDefault([]);
    }

    get maxCount(): Maybe<number> {
      return this.generatedShape.maxCount;
    }

    get maxExclusive(): Maybe<Literal> {
      return this.generatedShape.maxExclusive;
    }

    get maxInclusive(): Maybe<Literal> {
      return this.generatedShape.maxInclusive;
    }

    get minCount(): Maybe<number> {
      return this.generatedShape.minCount;
    }

    get minExclusive(): Maybe<Literal> {
      return this.generatedShape.minExclusive;
    }

    get minInclusive(): Maybe<Literal> {
      return this.generatedShape.minInclusive;
    }

    @Memoize()
    get nodeKinds(): ReadonlySet<NodeKind> {
      return this.generatedShape.nodeKind
        .map((iri) => {
          const nodeKinds = new Set<NodeKind>();
          switch (iri.value) {
            case "http://www.w3.org/ns/shacl#BlankNode":
              nodeKinds.add("BlankNode");
              break;
            case "http://www.w3.org/ns/shacl#BlankNodeOrIRI":
              nodeKinds.add("BlankNode");
              nodeKinds.add("IRI");
              break;
            case "http://www.w3.org/ns/shacl#BlankNodeOrLiteral":
              nodeKinds.add("BlankNode");
              nodeKinds.add("Literal");
              break;
            case "http://www.w3.org/ns/shacl#IRI":
              nodeKinds.add("IRI");
              break;
            case "http://www.w3.org/ns/shacl#IRIOrLiteral":
              nodeKinds.add("IRI");
              nodeKinds.add("Literal");
              break;
            case "http://www.w3.org/ns/shacl#Literal":
              nodeKinds.add("Literal");
              break;
          }
          return nodeKinds;
        })
        .orDefault(new Set([]));
    }

    @Memoize()
    get nodes(): Either<Error, readonly NodeShapeT[]> {
      return Either.sequence(
        this.generatedShape.nodes.map((identifier) =>
          this.shapesGraph.nodeShapeByIdentifier(identifier),
        ),
      );
    }

    @Memoize()
    get not(): Either<Error, readonly ShapeT[]> {
      return Either.sequence(
        this.generatedShape.not.map((identifier) =>
          this.shapesGraph.shapeByIdentifier(identifier),
        ),
      );
    }

    @Memoize()
    get or(): Either<Error, readonly ShapeT[]> {
      return this.shapeListTakingConstraint(this.generatedShape.or);
    }

    @Memoize()
    get xone(): Either<Error, readonly ShapeT[]> {
      return this.shapeListTakingConstraint(this.generatedShape.xone);
    }

    private shapeListTakingConstraint(
      identifiers: readonly (readonly (rdfjs.BlankNode | rdfjs.NamedNode)[])[],
    ): Either<Error, readonly ShapeT[]> {
      return Either.sequence(
        identifiers.flatMap((identifiers) =>
          identifiers.map((identifier) =>
            this.shapesGraph.shapeByIdentifier(identifier),
          ),
        ),
      );
    }
  }
}
