import type { BlankNode, NamedNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { maybeEquals, strictEquals } from "./equals.js";

/**
 * Abstract base class for operations, services, and types.
 */
export abstract class AbstractConstruct {
  /**
   * Documentation comment from rdfs:comment.
   */
  readonly comment: Maybe<string> = Maybe.empty();

  /**
   * Type discriminant
   */
  abstract readonly kind: string;

  /**
   * Human-readable label from rdfs:label.
   */
  readonly label: Maybe<string> = Maybe.empty();

  /**
   * Identifier of the shape this type was derived from.
   */
  readonly shapeIdentifier: BlankNode | NamedNode;

  constructor({
    comment,
    label,
    shapeIdentifier,
  }: {
    comment: Maybe<string>;
    label: Maybe<string>;
    shapeIdentifier: BlankNode | NamedNode;
  }) {
    this.comment = comment;
    this.label = label;
    this.shapeIdentifier = shapeIdentifier;
  }

  equals(other: AbstractConstruct): boolean {
    if (!maybeEquals(strictEquals)(this.comment, other.comment)) {
      return false;
    }

    if (!maybeEquals(strictEquals)(this.label, other.label)) {
      return false;
    }

    return true;
  }

  toJSON() {
    return {
      comment: this.comment.extract(),
      kind: this.kind,
      label: this.label.extract(),
      shapeIdentifier: this.shapeIdentifier,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
