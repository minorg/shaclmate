import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { snippets } from "./snippets.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for TypeScript numeric types (bigint | number).
 */
export abstract class AbstractNumericType<
  ValueT extends bigint | number,
> extends AbstractPrimitiveType<ValueT> {
  abstract override readonly kind: "BigIntType" | "FloatType" | "IntType";

  @Memoize()
  override get filterFunction(): Code {
    return code`${snippets.filterNumeric}<${this.typeofs[0]}>`;
  }

  @Memoize()
  override get filterType(): Code {
    return code`${snippets.NumericFilter}<${this.typeofs[0]}>`;
  }

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return `${this.primitiveIn.map((value) => this.valueToString(value)).join(" | ")}`;
    }
    return this.typeofs[0];
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${snippets.NumericSchema}<${this.typeofs[0]}>`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`${snippets.numericSparqlWherePatterns}<${this.typeofs[0]}>`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in: this.primitiveIn.length > 0 ? this.primitiveIn.concat() : undefined,
    };
  }

  override jsonZodSchema(
    _parameters: Parameters<AbstractPrimitiveType<ValueT>["jsonZodSchema"]>[0],
  ): Code {
    switch (this.primitiveIn.length) {
      case 0:
        return code`${imports.z}.${this.typeofs[0]}()`;
      case 1:
        return code`${imports.z}.literal(${this.valueToString(this.primitiveIn[0])})`;
      default:
        return code`${imports.z}.union([${joinCode(
          this.primitiveIn.map(
            (value) => code`${imports.z}.literal(${this.valueToString(value)})`,
          ),
          { on: "," },
        )}])`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["toRdfExpression"]>[0]): Code {
    return code`[${snippets.literalFactory}.${this.typeofs[0]}(${variables.value}, ${rdfjsTermExpression(this.datatype)})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<ValueT>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<ValueT>["fromRdfExpressionChain"]> {
    let fromRdfResourceValueExpression = this.fromRdfResourceValueExpression({
      variables: { value: code`value` },
    });
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = code`<Error, ${this.name}>`;
      fromRdfResourceValueExpression = code`${fromRdfResourceValueExpression}.chain(primitiveValue => { switch (primitiveValue) { ${this.primitiveIn.map((value) => `case ${this.valueToString(value)}:`).join(" ")} return ${imports.Either}.of${eitherTypeParameters}(primitiveValue); default: return ${imports.Left}${eitherTypeParameters}(new ${imports.Resource}.MistypedTermValueError(${{ actualValue: code`value.toTerm()`, expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})); } })`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: code`chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }

  protected abstract fromRdfResourceValueExpression(variables: {
    variables: {
      value: Code;
    };
  }): Code;

  protected abstract valueToString(value: ValueT): string;
}
