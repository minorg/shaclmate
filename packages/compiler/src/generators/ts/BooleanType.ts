import type { Literal } from "@rdfjs/types";
import { LiteralDecoder } from "@rdfx/literal";

import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class BooleanType extends AbstractPrimitiveType<boolean> {
  override readonly filterFunction =
    code`${this.reusables.snippets.filterBoolean}`;
  override readonly filterType = code`${this.reusables.snippets.BooleanFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${this.reusables.imports.GraphQLBoolean}`,
    this.reusables,
  );
  override readonly hashFunction = code`${this.reusables.snippets.hashBoolean}`;
  override readonly jsTypes = [{ typeof: "boolean" }] as const;
  override readonly kind = "Boolean";
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.booleanSparqlWherePatterns}`;

  @Memoize()
  get fromRdfResourceValuesFunction(): Code {
    return code`${this.reusables.snippets.booleanFromRdfResourceValues}<${this.expression}>`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.BooleanSchema}<${this.expression}>`;
  }

  override valueExpression(literal: boolean | Literal): Code {
    return code`${typeof literal === "boolean" ? literal : LiteralDecoder.decodeBooleanLiteral(literal).unsafeCoerce()}`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractPrimitiveType<boolean>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.boolean(${variables.value}, ${this.rdfjsTermExpression(this.datatype)})]`;
  }
}
