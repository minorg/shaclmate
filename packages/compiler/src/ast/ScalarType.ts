import { Maybe } from "purify-ts";
import { maybeEquals, strictEquals } from "./equals.js";

/**
 * Abstract base class for scalar types such as ObjectType, ObjectUnionType, and TermType.
 *
 * Excludes collection/container types like ListType, OptionType, and SetType.
 */
export abstract class ScalarType {
  readonly comment: Maybe<string> = Maybe.empty();
  readonly label: Maybe<string> = Maybe.empty();

  // constructor({
  //   comment,
  //   label,
  // }: { comment: Maybe<string>; label: Maybe<string> }) {
  //   this.comment = comment;
  //   this.label = label;
  // }

  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  // biome-ignore lint/correctness/noEmptyPattern: <explanation>
  constructor({}: object) {}

  equals(other: ScalarType): boolean {
    if (!maybeEquals(this.comment, other.comment, strictEquals)) {
      return false;
    }

    if (!maybeEquals(this.label, other.label, strictEquals)) {
      return false;
    }

    return true;
  }
}
