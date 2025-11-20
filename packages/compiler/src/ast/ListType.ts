import type { BlankNode, NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import { CollectionType } from "ast/CollectionType.js";
import {} from "ast/equals.js";
import type { Maybe } from "purify-ts";
import type { IdentifierMintingStrategy } from "../enums/IdentifierMintingStrategy.js";
import type { Type } from "./Type.js";

/**
 * An ordered sequence of items with zero or one values of an item type.
 *
 * ListType is transformed from a SHACL node shape that models an RDF list (https://www.w3.org/TR/rdf11-schema/#ch_collectionvocab).
 *
 * Contrast SetType, which is transformed from any SHACL property shape with no maxCount or maxCount greater than 1.
 */
export class ListType<
  ItemTypeT extends Type = Type,
> extends CollectionType<ItemTypeT> {
  /**
   * Documentation comment from rdfs:comment.
   */
  readonly comment: Maybe<string>;

  /**
   * Type of identifier (blank or named node) to use for lists and sub-lists.
   */
  readonly identifierNodeKind: IdentifierNodeKind;

  readonly kind = "ListType";

  /**
   * Human-readable label from rdfs:label.
   */
  readonly label: Maybe<string>;

  /**
   * shaclmate:name from the node shape.
   */
  readonly name: Maybe<string>;

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
    comment,
    identifierMintingStrategy,
    identifierNodeKind,
    label,
    name,
    shapeIdentifier,
    toRdfTypes,
    ...superParameters
  }: {
    comment: Maybe<string>;
    identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
    identifierNodeKind: IdentifierNodeKind;
    label: Maybe<string>;
    name: Maybe<string>;
    shapeIdentifier: BlankNode | NamedNode;
    toRdfTypes: readonly NamedNode[];
  } & ConstructorParameters<typeof CollectionType<ItemTypeT>>[0]) {
    super(superParameters);
    this.comment = comment;
    this.identifierMintingStrategy = identifierMintingStrategy;
    this.identifierNodeKind = identifierNodeKind;
    this.label = label;
    this.name = name;
    this.shapeIdentifier = shapeIdentifier;
    this.toRdfTypes = toRdfTypes;
  }

  override equals(other: ListType<ItemTypeT>): boolean {
    // Don't recurse
    return this.shapeIdentifier.equals(other.shapeIdentifier);
  }
}
