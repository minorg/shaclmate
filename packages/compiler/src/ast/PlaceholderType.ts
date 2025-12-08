import { Maybe } from "purify-ts";

/**
 * A placeholder used temporarily when a type is being resolved.
 */
export class PlaceholderType {
  static readonly instance = new PlaceholderType();
  readonly comment: Maybe<string> = Maybe.empty();
  readonly label: Maybe<string> = Maybe.empty();
  readonly kind = "PlaceholderType";
  readonly name: Maybe<string> = Maybe.empty();

  private constructor() {}

  equals(_other: PlaceholderType): boolean {
    return true;
  }

  toString(): string {
    return `${this.kind}()`;
  }
}
