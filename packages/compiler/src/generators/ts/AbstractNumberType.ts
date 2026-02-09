import type { NamedNode } from "@rdfjs/types";

import { NonEmptyList } from "purify-ts";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { sharedImports } from "./sharedImports.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

const localSnippets = {
  NumberFilter: conditionalOutput(
    `${syntheticNamePrefix}NumberFilter`,
    code`\
interface ${syntheticNamePrefix}NumberFilter {
  readonly in?: readonly number[];
  readonly maxExclusive?: number;
  readonly maxInclusive?: number;
  readonly minExclusive?: number;
  readonly minInclusive?: number;
}`,
  ),
};

export abstract class AbstractNumberType extends AbstractPrimitiveType<number> {
  private readonly datatype: NamedNode;

  override readonly filterFunction = code`${conditionalOutput(
    `${syntheticNamePrefix}filterNumber`,
    code`\
function ${syntheticNamePrefix}filterNumber(filter: ${localSnippets.NumberFilter}, value: number) {
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
  )}`;

  override readonly filterType = code`${localSnippets.NumberFilter}`;
  abstract override readonly kind: "FloatType" | "IntType";
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
  override get name(): Code {
    if (this.primitiveIn.length > 0) {
      return code`${this.primitiveIn.map((value) => value.toString()).join(" | ")}`;
    }
    return code`number`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in: this.primitiveIn.length > 0 ? this.primitiveIn.concat() : undefined,
    };
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${conditionalOutput(`${syntheticNamePrefix}NumberSchema`, code`type ${syntheticNamePrefix}NumberSchema = Readonly<${this.schemaTypeObject}>;`)}`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`${conditionalOutput(
      `${syntheticNamePrefix}numberSparqlWherePatterns`,
      code`\
const ${syntheticNamePrefix}numberSparqlWherePatterns: ${sharedSnippets.SparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${sharedSnippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (typeof filter.in !== "undefined" && filter.in.length > 0) {
        filterPatterns.push(${sharedSnippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
      }

      if (typeof filter.maxExclusive !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<",
            args: [valueVariable, ${sharedSnippets.toLiteral}(filter.maxExclusive)],
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
            args: [valueVariable, ${sharedSnippets.toLiteral}(filter.maxInclusive)],
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
            args: [valueVariable, ${sharedSnippets.toLiteral}(filter.minExclusive)],
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
            args: [valueVariable, ${sharedSnippets.toLiteral}(filter.minInclusive)],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    return ${sharedSnippets.termSchemaSparqlWherePatterns}({ filterPatterns, valueVariable, ...otherParameters });
  }`,
    )}`;
  }

  protected override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      kind: code`"FloatType" | "IntType"`,
      "in?": `readonly number[]`,
    };
  }

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractPrimitiveType<number>["jsonZodSchema"]>[0]): Code {
    switch (this.primitiveIn.length) {
      case 0:
        return code`${variables.zod}.number()`;
      case 1:
        return code`${variables.zod}.literal(${this.primitiveIn[0]})`;
      default:
        return code`${variables.zod}.union([${this.primitiveIn.map((value) => `${variables.zod}.literal(${value})`).join(", ")}])`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["toRdfExpression"]>[0]): Code {
    return code`[${sharedImports.dataFactory}.literal(${variables.value}.toString(10), ${rdfjsTermExpression(this.datatype)})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<number>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<number>["fromRdfExpressionChain"]> {
    let fromRdfResourceValueExpression = "value.toNumber()";
    if (this.primitiveIn.length > 0) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(primitiveValue => { switch (primitiveValue) { ${this.primitiveIn.map((value) => `case ${value}:`).join(" ")} return ${sharedImports.Either}.of${eitherTypeParameters}(primitiveValue); default: return ${sharedImports.Left}${eitherTypeParameters}(new ${sharedImports.Resource}.MistypedTermValueError(${{ actualValue: "value.toTerm()", expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})); } })`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: code`chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }
}
