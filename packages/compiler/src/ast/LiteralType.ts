import type { Literal, NamedNode } from "@rdfjs/types";

import type { Maybe } from "purify-ts";

import { AbstractTermType } from "./AbstractTermType.js";
import {
  arrayEquals,
  maybeEquals,
  strictEquals,
  termEquals,
} from "./equals.js";

export class LiteralType extends AbstractTermType<Literal, Literal> {
  readonly datatype: Maybe<NamedNode>;
  override readonly kind = "LiteralType";
  override readonly nodeKinds = nodeKinds;
  readonly languageIn: readonly string[];
  readonly maxExclusive: Maybe<Literal>;
  readonly maxInclusive: Maybe<Literal>;
  readonly minExclusive: Maybe<Literal>;
  readonly minInclusive: Maybe<Literal>;

  constructor({
    datatype,
    languageIn,
    maxExclusive,
    maxInclusive,
    minExclusive,
    minInclusive,
    ...superParameters
  }: {
    datatype: Maybe<NamedNode>;
    languageIn: readonly string[];
    maxExclusive: Maybe<Literal>;
    maxInclusive: Maybe<Literal>;
    minExclusive: Maybe<Literal>;
    minInclusive: Maybe<Literal>;
  } & Omit<
    ConstructorParameters<typeof AbstractTermType<Literal, Literal>>[0],
    "nodeKinds"
  >) {
    super(superParameters);
    this.datatype = datatype;
    this.languageIn = languageIn;
    this.maxExclusive = maxExclusive;
    this.maxInclusive = maxInclusive;
    this.minExclusive = minExclusive;
    this.minInclusive = minInclusive;
  }

  override equals(other: AbstractTermType<Literal, Literal>): boolean {
    if (!super.equals(other)) {
      return false;
    }
    const otherLiteralType = other as LiteralType;

    if (!maybeEquals(termEquals)(this.datatype, otherLiteralType.datatype)) {
      return false;
    }

    if (
      !arrayEquals(strictEquals)(this.languageIn, otherLiteralType.languageIn)
    ) {
      return false;
    }

    if (
      !maybeEquals(termEquals)(this.maxExclusive, otherLiteralType.maxExclusive)
    ) {
      return false;
    }

    if (
      !maybeEquals(termEquals)(this.maxInclusive, otherLiteralType.maxInclusive)
    ) {
      return false;
    }

    if (
      !maybeEquals(termEquals)(this.minExclusive, otherLiteralType.minExclusive)
    ) {
      return false;
    }

    if (
      !maybeEquals(termEquals)(this.minInclusive, otherLiteralType.minInclusive)
    ) {
      return false;
    }

    return true;
  }

  override toString(): string {
    return `${this.kind}()`;
  }
}

const nodeKinds: ReadonlySet<"Literal"> = new Set(["Literal"]);
