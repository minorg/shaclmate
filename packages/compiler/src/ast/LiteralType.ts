import type { Literal, NamedNode } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import type { TermType } from "./TermType.js";

export interface LiteralType extends TermType<Literal, Literal> {
  readonly datatype: Maybe<NamedNode>;
  readonly kind: "LiteralType";
  readonly languageIn: readonly string[];
  readonly maxExclusive: Maybe<Literal>;
  readonly maxInclusive: Maybe<Literal>;
  readonly minExclusive: Maybe<Literal>;
  readonly minInclusive: Maybe<Literal>;
  readonly nodeKinds: Set<"Literal">;
}
