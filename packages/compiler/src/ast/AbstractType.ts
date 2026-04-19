import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { maybeEquals, strictEquals } from "./equals.js";

/**
 * Abstract base class for Types.
 */
export abstract class AbstractType {
  /**
   * Documentation comment from rdfs:comment.
   */
  readonly comment: Maybe<string> = Maybe.empty();

  /**
   * Human-readable label from rdfs:label.
   */
  readonly label: Maybe<string> = Maybe.empty();

  /**
   * Name of this type, from shaclmate:name or sh:name.
   */
  readonly name: Maybe<string>;

  /**
   * Identifier of the shape this type was derived from.
   */
  readonly shapeIdentifier: BlankNode | NamedNode;

  constructor({
    comment,
    label,
    name,
    shapeIdentifier,
  }: {
    comment: Maybe<string>;
    label: Maybe<string>;
    name: Maybe<string>;
    shapeIdentifier: BlankNode | NamedNode;
  }) {
    this.comment = comment;
    this.label = label;
    this.name = name;
    this.shapeIdentifier = shapeIdentifier;
  }

  equals(other: AbstractType): boolean {
    if (!maybeEquals(strictEquals)(this.comment, other.comment)) {
      return false;
    }

    if (!maybeEquals(strictEquals)(this.label, other.label)) {
      return false;
    }

    return true;
  }

  abstract toString(): string;
}
