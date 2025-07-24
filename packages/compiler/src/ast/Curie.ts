import { invariant } from "ts-invariant";

/**
 * A Compact URI (https://www.w3.org/TR/curie)
 */
export class Curie {
  readonly prefix: string;
  readonly reference: string;

  constructor({
    prefix,
    reference,
  }: {
    prefix: string;
    reference: string;
  }) {
    this.prefix = prefix;
    this.reference = reference;
  }

  static parse(curie: string): Curie {
    const split = curie.split(":", 2);
    invariant(split.length === 2);
    return new Curie({ prefix: split[0], reference: split[1] });
  }

  toString(): string {
    return `${this.prefix}:${this.reference}`;
  }
}
