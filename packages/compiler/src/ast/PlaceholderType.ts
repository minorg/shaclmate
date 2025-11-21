/**
 * A placeholder used temporarily when a type is being resolved.
 */
export class PlaceholderType {
  static readonly instance = new PlaceholderType();
  readonly kind = "PlaceholderType";

  private constructor() {}

  equals(_other: PlaceholderType): boolean {
    return true;
  }

  toString(): string {
    return `${this.kind}()`;
  }
}
