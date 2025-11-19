/**
 * A placeholder used temporarily when a type is being resolved.
 */
export abstract class PlaceholderType {
  readonly kind = "PlaceholderType";

  equals(_other: PlaceholderType): boolean {
    return true;
  }

  toString(): string {
    return `${this.kind}()`;
  }
}
