import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import type { Callable } from "./Callable.js";
import { ReferenceCallable } from "./ReferenceCallable.js";
import { type Code, code } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for TypeScript numeric types (bigint | number).
 */
export abstract class AbstractNumericType<
  ValueT extends bigint | number,
> extends AbstractPrimitiveType<ValueT> {
  override readonly hashFunction = new ReferenceCallable(
    this.reusables.snippets.hashNumeric,
  );
  abstract override readonly kind: "BigInt" | "Float" | "Int";

  @Memoize()
  override get filterFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.filterNumeric}<${this.expression}>`,
    );
  }

  @Memoize()
  override get filterType(): Code {
    return code`${this.reusables.snippets.NumericFilter}<${this.expression}>`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.NumericSchema}<${this.expression}>`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Callable {
    return new ReferenceCallable(
      code`${this.reusables.snippets.numericSparqlWherePatterns}<${this.expression}>`,
    );
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${this.reusables.snippets.literalFactory}.${this.jsTypes[0].typeof}(${variables.value}, ${this.rdfjsTermExpression(this.datatype)})]`;
  }
}

export namespace AbstractNumericType {
  export type ConversionFunction = AbstractPrimitiveType.ConversionFunction;
  export type JsonType = AbstractPrimitiveType.JsonType;
}
