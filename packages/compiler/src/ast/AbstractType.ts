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
   * Name of this type, usually derived from sh:name or shaclmate:name.
   */
  readonly name: Maybe<string> = Maybe.empty();

  constructor({
    comment,
    label,
    name,
  }: { comment: Maybe<string>; label: Maybe<string>; name: Maybe<string> }) {
    this.comment = comment;
    this.label = label;
    this.name = name;
  }

  equals(other: AbstractType): boolean {
    if (!maybeEquals(this.comment, other.comment, strictEquals)) {
      return false;
    }

    if (!maybeEquals(this.label, other.label, strictEquals)) {
      return false;
    }

    if (!maybeEquals(this.name, other.name, strictEquals)) {
      return false;
    }

    return true;
  }

  abstract toString(): string;
}
