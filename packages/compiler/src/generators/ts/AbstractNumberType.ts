import { NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractNumericType } from "./AbstractNumericType.js";
import { snippets } from "./snippets.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for TypeScript number types.
 */
export abstract class AbstractNumberType extends AbstractNumericType<number> {
  override readonly filterFunction = code`${snippets.filterNumber}`;
  override readonly filterType = code`${snippets.NumberFilter}`;
  abstract override readonly kind: "FloatType" | "IntType";
  override readonly schemaType = code`${snippets.NumberSchema}`;
  override readonly typeofs = NonEmptyList(["number" as const]);

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`${snippets.numberSparqlWherePatterns}`;
  }

  protected override fromRdfResourceValueExpression({
    variables,
  }: Parameters<
    AbstractNumericType<number>["fromRdfResourceValueExpression"]
  >[0]): Code {
    return code`${variables.value}.toNumber()`;
  }

  protected override valueToString(value: number): string {
    return value.toString();
  }
}
