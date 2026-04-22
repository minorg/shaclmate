import type { BlankNode, NamedNode } from "@rdfjs/types";

/**
 * A Compact URI (https://www.w3.org/TR/curie)
 */
export class Curie implements NamedNode {
  readonly prefix: string;
  readonly #hasUniqueReference: () => boolean;
  readonly reference: string;
  readonly termType = "NamedNode";
  readonly value: string;

  constructor({
    hasUniqueReference,
    prefix,
    reference,
    value,
  }: {
    hasUniqueReference?: () => boolean;
    prefix: string;
    reference: string;
    value: string;
  }) {
    this.#hasUniqueReference = hasUniqueReference ?? (() => false);
    this.prefix = prefix;
    this.reference = reference;
    this.value = value;
  }

  equals(other: BlankNode | NamedNode): boolean {
    if (other.termType === "BlankNode") {
      return false;
    }

    return this.value === other.value; // Allow a Curie to equal a NamedNode
  }

  get hasUniqueReference(): boolean {
    return this.#hasUniqueReference();
  }

  toString(): string {
    return `${this.prefix}:${this.reference}`;
  }
}
