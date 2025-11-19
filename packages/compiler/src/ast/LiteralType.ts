import type { Literal, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import { TermType } from "./TermType.js";

export abstract class LiteralType extends TermType<Literal, Literal> {
  readonly datatype: Maybe<NamedNode>;
  readonly kind = "LiteralType";
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
  } & ConstructorParameters<typeof TermType<Literal, Literal>>[0]) {
    super(superParameters);
    this.datatype = datatype;
    this.languageIn = languageIn;
    this.maxExclusive = maxExclusive;
    this.maxInclusive = maxInclusive;
    this.minExclusive = minExclusive;
    this.minInclusive = minInclusive;
  }

  override toString(): string {
    return `${this.kind}()`;
  }
}
