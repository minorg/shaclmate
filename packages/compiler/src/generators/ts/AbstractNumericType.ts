import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for TypeScript numeric types (bigint | number).
 */
export abstract class AbstractNumericType<
  ValueT extends bigint | number,
> extends AbstractPrimitiveType<ValueT> {
  override readonly hashFunction = code`${this.reusables.snippets.hashNumeric}`;
  abstract override readonly kind: "BigInt" | "Float" | "Int";

  @Memoize()
  override get filterFunction(): Code {
    return code`${this.reusables.snippets.filterNumeric}<${this.expression}>`;
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
  override get valueSparqlWherePatternsFunction() {
    return code`${this.reusables.snippets.numericSparqlWherePatterns}<${this.expression}>`;
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    if (this.primitiveIn.length > 0) {
      return code`${joinCode(
        this.primitiveIn.map((value) => this.literalValueExpression(value)),
        { on: " | " },
      )}`;
    }
    return code`${this.jsTypes[0].typeof}`;
  }

  override jsonSchema(
    _parameters: Parameters<AbstractPrimitiveType<ValueT>["jsonSchema"]>[0],
  ): Code {
    switch (this.primitiveIn.length) {
      case 0:
        return code`${this.reusables.imports.z}.${this.jsTypes[0].typeof}()`;
      case 1:
        return code`${this.reusables.imports.z}.literal(${this.literalValueExpression(this.primitiveIn[0])})`;
      default:
        return code`${this.reusables.imports.z}.union([${joinCode(
          this.primitiveIn.map(
            (value) =>
              code`${this.reusables.imports.z}.literal(${this.literalValueExpression(value)})`,
          ),
          { on: "," },
        )}])`;
    }
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
  export const JsonType = AbstractPrimitiveType.JsonType;
  export type JsonType = AbstractPrimitiveType.JsonType;
}
