import type { NamedNode } from "@rdfjs/types";
import { NodeShape as ShaclCoreNodeShape } from "@shaclmate/shacl-ast";
import { Maybe } from "purify-ts";
import type {
  IdentifierMintingStrategy,
  TsFeature,
  TsObjectDeclarationType,
} from "../enums/index.js";
import type { Shape } from "./Shape.js";
import type * as generated from "./generated.js";
import type {
  Ontology,
  PropertyGroup,
  PropertyShape,
  ShapesGraph,
} from "./index.js";
import { tsFeatures } from "./tsFeatures.js";

export class NodeShape extends ShaclCoreNodeShape<
  any,
  Ontology,
  PropertyGroup,
  PropertyShape,
  Shape
> {
  readonly isClass: boolean;
  readonly isList: boolean;
  private readonly ancestorClassIris: readonly NamedNode[];
  private readonly childClassIris: readonly NamedNode[];
  private readonly descendantClassIris: readonly NamedNode[];
  private readonly generatedShaclmateNodeShape: generated.ShaclmateNodeShape;
  private readonly parentClassIris: readonly NamedNode[];

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

  get ancestorNodeShapes(): readonly NodeShape[] {
    return this.isClass
      ? this.ancestorClassIris.flatMap((classIri) =>
          this.shapesGraph.nodeShapeByIdentifier(classIri).toList(),
        )
      : [];
  }

  get childNodeShapes(): readonly NodeShape[] {
    return this.isClass
      ? this.childClassIris.flatMap((classIri) =>
          this.shapesGraph.nodeShapeByIdentifier(classIri).toList(),
        )
      : [];
  }

  get descendantNodeShapes(): readonly NodeShape[] {
    return this.isClass
      ? this.descendantClassIris.flatMap((classIri) =>
          this.shapesGraph.nodeShapeByIdentifier(classIri).toList(),
        )
      : [];
  }

  get export(): Maybe<boolean> {
    return this.generatedShaclmateNodeShape.export_;
  }

  get extern(): Maybe<boolean> {
    return this.generatedShaclmateNodeShape.extern;
  }

  get fromRdfType(): Maybe<NamedNode> {
    // Check for an explicit shaclmate:fromRdfType
    const fromRdfType = this.generatedShaclmateNodeShape.fromRdfType;
    if (fromRdfType.isJust()) {
      return fromRdfType;
    }

    // No explicit shaclmate:fromRdfType
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

  get identifierMintingStrategy(): Maybe<IdentifierMintingStrategy> {
    const thisMintingStrategy = this._mintingStrategy;
    if (thisMintingStrategy.isNothing()) {
      for (const ancestorNodeShape of this.ancestorNodeShapes) {
        const ancestorMintingStrategy = ancestorNodeShape._mintingStrategy;
        if (ancestorMintingStrategy.isJust()) {
          return ancestorMintingStrategy;
        }
      }
    }
    return thisMintingStrategy.altLazy(() =>
      this.nodeKinds.has("BlankNode") ? Maybe.of("blankNode") : Maybe.empty(),
    );
  }

  get mutable(): Maybe<boolean> {
    return this.generatedShaclmateNodeShape.mutable;
  }

  get nodeKinds(): Set<"BlankNode" | "NamedNode"> {
    const thisNodeKinds = new Set<"BlankNode" | "NamedNode">(
      [...this.constraints.nodeKinds.orDefault(new Set())].filter(
        (nodeKind) => nodeKind !== "Literal",
      ) as ("BlankNode" | "NamedNode")[],
    );

    const parentNodeKinds = new Set<"BlankNode" | "NamedNode">();
    for (const parentNodeShape of this.parentNodeShapes) {
      for (const parentNodeKind of parentNodeShape.nodeKinds) {
        parentNodeKinds.add(parentNodeKind);
      }
    }

    if (thisNodeKinds.size === 0 && parentNodeKinds.size > 0) {
      // No node kinds on this shape, use the parent's
      return parentNodeKinds;
    }

    if (thisNodeKinds.size > 0 && parentNodeKinds.size > 0) {
      // Node kinds on this shape and the parent's shape
      // This node kinds must be a subset of parent node kinds.
      for (const thisNodeKind of thisNodeKinds) {
        if (!parentNodeKinds.has(thisNodeKind)) {
          throw new Error(
            `${this} has a nodeKind ${thisNodeKind} that is not in its parent's node kinds`,
          );
        }
      }
    }

    if (thisNodeKinds.size === 0) {
      // Default: both node kinds
      thisNodeKinds.add("BlankNode");
      thisNodeKinds.add("NamedNode");
    }

    return thisNodeKinds;
  }

  get parentNodeShapes(): readonly NodeShape[] {
    return this.isClass
      ? this.parentClassIris.flatMap((classIri) =>
          this.shapesGraph.nodeShapeByIdentifier(classIri).toList(),
        )
      : [];
  }

  get shaclmateName(): Maybe<string> {
    return this.generatedShaclmateNodeShape.name;
  }

  get toRdfTypes(): readonly NamedNode[] {
    // Look for one or more explicit shaclmate:toRdfType's
    const toRdfTypes = this.generatedShaclmateNodeShape.toRdfTypes.concat();

    // Ensure the toRdfTypes includes the fromRdfType if there is one
    this.fromRdfType.ifJust((fromRdfType) => {
      if (!toRdfTypes.some((toRdfType) => toRdfType.equals(fromRdfType))) {
        toRdfTypes.push(fromRdfType);
      }
    });

    if (toRdfTypes.length === 0) {
      // No explicit shaclmate:toRdfType's
      // If the shape is a class, not abstract, and identified by an IRI then use the shape IRI as the fromRdfType.
      if (
        !this.abstract.orDefault(false) &&
        this.isClass &&
        this.identifier.termType === "NamedNode"
      ) {
        toRdfTypes.push(this.identifier);
      }
    }

    return toRdfTypes;
  }

  get tsFeatures(): Maybe<Set<TsFeature>> {
    return tsFeatures(this.generatedShaclmateNodeShape).altLazy(() =>
      this.isDefinedBy.chain((ontology) => ontology.tsFeatures),
    );
  }

  get tsImports(): readonly string[] {
    return this.generatedShaclmateNodeShape.tsImports;
  }

  get tsObjectDeclarationType(): Maybe<TsObjectDeclarationType> {
    return this.generatedShaclmateNodeShape.tsObjectDeclarationType
      .map((iri) => {
        switch (iri.value) {
          case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Class":
            return "class";
          case "http://purl.org/shaclmate/ontology#_TsObjectDeclarationType_Interface":
            return "interface";
          default:
            throw new RangeError(iri.value);
        }
      })
      .altLazy(() =>
        this.isDefinedBy.chain((ontology) => ontology.tsObjectDeclarationType),
      );
  }

  get tsObjectIdentifierPropertyName(): Maybe<string> {
    return this.generatedShaclmateNodeShape.tsObjectIdentifierPropertyName;
  }

  get tsObjectTypeDiscriminatorPropertyName(): Maybe<string> {
    return this.generatedShaclmateNodeShape
      .tsObjectTypeDiscriminatorPropertyName;
  }

  private get _mintingStrategy(): Maybe<IdentifierMintingStrategy> {
    return this.generatedShaclmateNodeShape.identifierMintingStrategy.map(
      (iri) => {
        switch (iri.value) {
          case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_BlankNode":
            return "blankNode";
          case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_SHA256":
            return "sha256";
          case "http://purl.org/shaclmate/ontology#_IdentifierMintingStrategy_UUIDv4":
            return "uuidv4";
        }
      },
    );
  }
}
