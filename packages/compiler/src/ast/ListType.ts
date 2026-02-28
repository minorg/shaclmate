import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import type { Maybe } from "purify-ts";
import type { IdentifierMintingStrategy } from "../enums/IdentifierMintingStrategy.js";
import { AbstractCollectionType } from "./AbstractCollectionType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IntersectionType } from "./IntersectionType.js";
import type { IriType } from "./IriType.js";
import type { LiteralType } from "./LiteralType.js";
import type { ObjectIntersectionType } from "./ObjectIntersectionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { PlaceholderType } from "./PlaceholderType.js";
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

  override readonly kind = "ListType";

  /**
   * Strategy for minting new list and sub-list identifiers.
   */
  readonly identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;

  /**
   * Identifier of the node shape this type was derived from.
   */
  readonly shapeIdentifier: BlankNode | NamedNode;

  /**
   * rdf:type's that will be added to this object when it's serialized toRdf.
   *
   * This is usually the identifier of an sh:NodeShape that is also an rdfs:Class (i.e., a node shape with implicit
   * class targets).
   */
  readonly toRdfTypes: readonly NamedNode[];

  constructor({
    identifierMintingStrategy,
    identifierNodeKind,
    shapeIdentifier,
    toRdfTypes,
    ...superParameters
  }: {
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    identifierNodeKind: IdentifierNodeKind;
    shapeIdentifier: BlankNode | NamedNode;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof AbstractCollectionType<ItemTypeT>>[0]) {
    super(superParameters);
    this.identifierMintingStrategy = identifierMintingStrategy;
    this.identifierNodeKind = identifierNodeKind;
    this.shapeIdentifier = shapeIdentifier;
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
    | LiteralType
    | ObjectIntersectionType
    | ObjectType
    | ObjectUnionType
    | PlaceholderType
    | TermType
    | UnionType;

  export function isItemType(type: Type): type is ItemType {
    switch (type.kind) {
      case "BlankNodeType":
      case "IdentifierType":
      case "IntersectionType":
      case "IriType":
      case "LiteralType":
      case "ObjectIntersectionType":
      case "ObjectType":
      case "ObjectUnionType":
      case "PlaceholderType":
      case "TermType":
      case "UnionType":
        return true;
      case "DefaultValueType":
      case "LazyObjectOptionType":
      case "LazyObjectSetType":
      case "LazyObjectType":
      case "ListType":
      case "OptionType":
      case "SetType":
        return false;
    }
  }
}
