import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { Type } from "./Type.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression";

/**
 * Abstract base class for IdentifierType and LiteralType.
 */
export abstract class RdfjsTermType<
  RdfjsTermT extends BlankNode | Literal | NamedNode,
> extends Type {
  readonly defaultValue: Maybe<RdfjsTermT>;
  readonly hasValue: Maybe<RdfjsTermT>;
  abstract override readonly kind: "IdentifierType" | "LiteralType";

  constructor({
    defaultValue,
    hasValue,
    ...superParameters
  }: {
    defaultValue: Maybe<RdfjsTermT>;
    hasValue: Maybe<RdfjsTermT>;
  } & ConstructorParameters<typeof Type>[0]) {
    super(superParameters);
    this.defaultValue = defaultValue;
    this.hasValue = hasValue;
  }

  override equalsFunction(): string {
    return "purifyHelpers.Equatable.booleanEquals";
  }

  override sparqlGraphPatternExpression(): Maybe<Type.SparqlGraphPatternExpression> {
    // Don't add any additional graph patterns for terms
    return Maybe.empty();
  }

  override toRdfStatements({
    variables,
  }: Parameters<Type["toRdfStatements"]>[0]): readonly string[] {
    const statement = `${variables.resource}.add(${variables.predicate}, ${variables.value});`;
    return this.defaultValue
      .map((defaultValue) => [
        `if (!${variables.value}.equals(${variables.value}, ${rdfjsTermExpression(defaultValue, this.configuration)})) { ${statement} }`,
      ])
      .orDefault([statement]);
  }
}
