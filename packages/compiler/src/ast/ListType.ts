import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { IriType } from "./IriType.js";
import type { LiteralType } from "./LiteralType.js";
import type { StructType } from "./StructType.js";
import type { TermType } from "./TermType.js";
import type { Type } from "./Type.js";
import type { UnionType } from "./UnionType.js";

/**
 * An ordered sequence of items with zero or one values of an item type.
 *
 * ListType is transformed from a SHACL node shape that models an RDF list (https://www.w3.org/TR/rdf11-schema/#ch_collectionvocab).
 *
 * Contrast SetType, which is transformed from any SHACL property shape with no maxCount or maxCount greater than 1.
 */
export class ListType<
  ItemTypeT extends ListType.ItemType = ListType.ItemType,
> extends AbstractCollectionType<ItemTypeT> {
  /**
   * Type of identifier (blank or named node) to use for lists and sub-lists.
   */
  readonly identifierNodeKind: IdentifierNodeKind;

  override readonly kind = "List";

  /**
   * rdf:type's that will be added to this object when it's serialized toRdf.
   *
   * This is usually the identifier of an sh:NodeShape that is also an rdfs:Class (i.e., a node shape with implicit
   * class targets).
   */
  readonly toRdfTypes: readonly NamedNode[];

  constructor({
    identifierNodeKind,
    toRdfTypes,
    ...superParameters
  }: {
    identifierNodeKind: IdentifierNodeKind;
    shapeIdentifier: BlankNode | NamedNode;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof AbstractCollectionType<ItemTypeT>>[0]) {
    super(superParameters);
    this.identifierNodeKind = identifierNodeKind;
    this.toRdfTypes = toRdfTypes;
  }

  override equals(other: ListType<ItemTypeT>): boolean {
    // Don't recurse
    return this.shapeIdentifier.equals(other.shapeIdentifier);
  }
}

export namespace ListType {
  export type ItemType =
    | BlankNodeType
    | IdentifierType
    | IntersectionType
    | IriType
    | ListType
    | LiteralType
    | StructType
    | TermType
    | UnionType;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
      case "BlankNode":
      case "Identifier":
      case "Intersection":
      case "Iri":
      case "List":
      case "Literal":
      case "Struct":
      case "Term":
      case "Union":
        return true;
      case "DefaultValue":
      case "LazyOption":
      case "LazySet":
      case "Lazy":
      case "Option":
      case "Set":
        return false;
    }
  }
}
