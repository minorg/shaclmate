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

  constructor({
    comment,
    label,
  }: { comment: Maybe<string>; label: Maybe<string> }) {
    this.comment = comment;
    this.label = label;
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
