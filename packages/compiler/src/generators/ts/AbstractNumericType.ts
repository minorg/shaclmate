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
  abstract override readonly kind: "BigIntType" | "FloatType" | "IntType";

  @Memoize()
  override get filterFunction(): Code {
    return code`${this.reusables.snippets.filterNumeric}<${this.typeofs[0]}>`;
  }

  @Memoize()
  override get filterType(): Code {
    return code`${this.reusables.snippets.NumericFilter}<${this.typeofs[0]}>`;
  }

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return `${this.primitiveIn.map((value) => this.literalOf(value)).join(" | ")}`;
    }
    return this.typeofs[0];
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${this.reusables.snippets.NumericSchema}<${this.typeofs[0]}>`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`${this.reusables.snippets.numericSparqlWherePatterns}<${this.typeofs[0]}>`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in:
        this.primitiveIn.length > 0
          ? this.primitiveIn.map((_) => code`${this.literalOf(_)}`)
          : undefined,
    };
  }

  override jsonSchema(
    _parameters: Parameters<AbstractPrimitiveType<ValueT>["jsonSchema"]>[0],
  ): Code {
    switch (this.primitiveIn.length) {
      case 0:
        return code`${this.reusables.imports.z}.${this.typeofs[0]}()`;
      case 1:
        return code`${this.reusables.imports.z}.literal(${this.literalOf(this.primitiveIn[0])})`;
      default:
        return code`${this.reusables.imports.z}.union([${joinCode(
          this.primitiveIn.map(
            (value) =>
              code`${this.reusables.imports.z}.literal(${this.literalOf(value)})`,
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
    return code`[${this.reusables.snippets.literalFactory}.${this.typeofs[0]}(${variables.value}, ${this.rdfjsTermExpression(this.datatype)})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<ValueT>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<ValueT>["fromRdfExpressionChain"]> {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: code`chain(values => values.chainMap(value => ${this.fromRdfResourceValueExpression(
        {
          variables: { value: code`value` },
        },
      )}))`,
    };
  }

  protected abstract fromRdfResourceValueExpression(variables: {
    variables: {
      value: Code;
    };
  }): Code;

  protected abstract literalOf(value: ValueT): string;
}

export namespace AbstractNumericType {
  export type Conversion = AbstractPrimitiveType.Conversion;
  export const JsonType = AbstractPrimitiveType.JsonType;
  export type JsonType = AbstractPrimitiveType.JsonType;
}
