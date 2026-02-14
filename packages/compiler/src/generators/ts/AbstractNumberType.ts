import type { NamedNode } from "@rdfjs/types";

import { NonEmptyList } from "purify-ts";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export abstract class AbstractNumberType extends AbstractPrimitiveType<number> {
  private readonly datatype: NamedNode;

  override readonly filterFunction = code`${localSnippets.filterNumber}`;
  override readonly filterType = code`${localSnippets.NumberFilter}`;
  abstract override readonly kind: "FloatType" | "IntType";
  override readonly schemaType = code`${localSnippets.NumberSchema}`;
  override readonly typeofs = NonEmptyList(["number" as const]);

  constructor({
    datatype,
    ...superParameters
  }: {
    datatype: NamedNode;
  } & ConstructorParameters<typeof AbstractPrimitiveType<number>>[0]) {
    super(superParameters);
    this.datatype = datatype;
  }

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return `${this.primitiveIn.map((value) => value.toString()).join(" | ")}`;
    }
    return "number";
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`${localSnippets.numberSparqlWherePatterns}`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in: this.primitiveIn.length > 0 ? this.primitiveIn.concat() : undefined,
    };
  }

  override jsonZodSchema(
    _parameters: Parameters<AbstractPrimitiveType<number>["jsonZodSchema"]>[0],
  ): Code {
    switch (this.primitiveIn.length) {
      case 0:
        return code`${imports.z}.number()`;
      case 1:
        return code`${imports.z}.literal(${this.primitiveIn[0]})`;
      default:
        return code`${imports.z}.union([${this.primitiveIn.map((value) => `${imports.z}.literal(${value})`).join(", ")}])`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["toRdfExpression"]>[0]): Code {
    return code`[${imports.dataFactory}.literal(${variables.value}.toString(10), ${rdfjsTermExpression(this.datatype)})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<number>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<number>["fromRdfExpressionChain"]> {
    let fromRdfResourceValueExpression = "value.toNumber()";
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(primitiveValue => { switch (primitiveValue) { ${this.primitiveIn.map((value) => `case ${value}:`).join(" ")} return ${imports.Either}.of${eitherTypeParameters}(primitiveValue); default: return ${imports.Left}${eitherTypeParameters}(new ${imports.Resource}.MistypedTermValueError(${{ actualValue: "value.toTerm()", expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})); } })`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: code`chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }
}

namespace localSnippets {
  export const NumberFilter = conditionalOutput(
    `${syntheticNamePrefix}NumberFilter`,
    code`\
interface ${syntheticNamePrefix}NumberFilter {
  readonly in?: readonly number[];
  readonly maxExclusive?: number;
  readonly maxInclusive?: number;
  readonly minExclusive?: number;
  readonly minInclusive?: number;
}`,
  );

  export const NumberSchema = conditionalOutput(
    `${syntheticNamePrefix}NumberSchema`,
    code`\
interface ${syntheticNamePrefix}NumberSchema {
  readonly kind: "FloatType" | "IntType";
  readonly in?: readonly number[];
}`,
  );

  export const filterNumber = conditionalOutput(
    `${syntheticNamePrefix}filterNumber`,
    code`\
function ${syntheticNamePrefix}filterNumber(filter: ${NumberFilter}, value: number) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue === value)) {
    return false;
  }

  if (typeof filter.maxExclusive !== "undefined" && value >= filter.maxExclusive) {
    return false;
  }

  if (typeof filter.maxInclusive !== "undefined" && value > filter.maxInclusive) {
    return false;
  }

  if (typeof filter.minExclusive !== "undefined" && value <= filter.minExclusive) {
    return false;
  }

  if (typeof filter.minInclusive !== "undefined" && value < filter.minInclusive) {
    return false;
  }

  return true;
}`,
  );

  export const numberSparqlWherePatterns = conditionalOutput(
    `${syntheticNamePrefix}numberSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}numberSparqlWherePatterns: ${snippets.SparqlWherePatternsFunction}<${NumberFilter}, ${NumberSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (typeof filter.in !== "undefined" && filter.in.length > 0) {
        filterPatterns.push(${snippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
      }

      if (typeof filter.maxExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<",
            args: [valueVariable, ${snippets.toLiteral}(filter.maxExclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.maxInclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<=",
            args: [valueVariable, ${snippets.toLiteral}(filter.maxInclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.minExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">",
            args: [valueVariable, ${snippets.toLiteral}(filter.minExclusive)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.minInclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">=",
            args: [valueVariable, ${snippets.toLiteral}(filter.minInclusive)],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    return ${snippets.termSchemaSparqlPatterns}({ filterPatterns, valueVariable, ...otherParameters });
  }`,
  );
}
