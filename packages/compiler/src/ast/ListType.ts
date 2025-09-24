import type { NamedNode } from "@rdfjs/types";
import type { IdentifierNodeKind } from "@shaclmate/shacl-ast";
import type { Maybe } from "purify-ts";
import type { IdentifierMintingStrategy } from "../enums/IdentifierMintingStrategy.js";
import type { Name } from "./Name.js";
import type { Type } from "./Type.js";

/**
 * An ordered sequence of items with zero or one values of an item type.
 *
 * ListType is transformed from a SHACL node shape that models an RDF list (https://www.w3.org/TR/rdf11-schema/#ch_collectionvocab).
 *
 * Contrast SetType, which is transformed from any SHACL property shape with no maxCount or maxCount greater than 1.
 */
export interface ListType {
  /**
   * Documentation comment from rdfs:comment.
   */
  readonly comment: Maybe<string>;

  /**
   * Type of identifier (blank or named node) to use for lists and sub-lists.
   */
  readonly identifierNodeKind: IdentifierNodeKind;

  /**
   * List item type.
   *
   * Mutable to support cycle-handling logic in the compiler.
   */
  itemType: Type;

  readonly kind: "ListType";

  /**
   * Human-readable label from rdfs:label.
   */
  readonly label: Maybe<string>;
  /**
   * Strategy for minting new list and sub-list identifiers.
   */
  readonly identifierMintingStrategy: Maybe<IdentifierMintingStrategy>;
  /**
   * The list should be mutable in generated code.
   */
  readonly mutable: Maybe<boolean>;
  /**
   * Name of this type, usually derived from sh:name or shaclmate:name.
   */
  readonly name: Name;
  /**
   * rdf:type's that will be added to this object when it's serialized toRdf.
   *
   * This is usually the identifier of an sh:NodeShape that is also an rdfs:Class (i.e., a node shape with implicit
   * class targets).
   */
  readonly toRdfTypes: readonly NamedNode[];
}
