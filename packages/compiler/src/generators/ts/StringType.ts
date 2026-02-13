import { NonEmptyList } from "purify-ts";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { sharedImports } from "./sharedImports.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class StringType extends AbstractPrimitiveType<string> {
  override readonly filterFunction = code`${localSnippets.filterString}`;
  override readonly filterType = code`${localSnippets.StringFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${sharedImports.GraphQLString}`,
  );
  readonly kind = "StringType";
  override readonly schemaType = code`${localSnippets.StringSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${localSnippets.stringSparqlWherePatterns}`;
  override readonly typeofs = NonEmptyList(["string" as const]);

  @Memoize()
  override get name(): Code {
    if (this.primitiveIn.length > 0) {
      return code`${this.primitiveIn.map((value) => `"${value}"`).join(" | ")}`;
    }
    return code`string`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in:
        this.primitiveIn.length > 0
          ? this.primitiveIn.map((_) => JSON.stringify(_)).concat()
          : undefined,
    };
  }

  override hashStatements({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["hashStatements"]
  >[0]): readonly Code[] {
    return [code`${variables.hasher}.update(${variables.value});`];
  }

  override jsonZodSchema(
    _parameters: Parameters<AbstractPrimitiveType<string>["jsonZodSchema"]>[0],
  ): Code {
    switch (this.primitiveIn.length) {
      case 0:
        return code`${sharedImports.z}.string()`;
      case 1:
        return code`${sharedImports.z}.literal(${this.primitiveIn[0]})`;
      default:
        return code`${sharedImports.z}.enum(${JSON.stringify(this.primitiveIn)})`;
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<string>["toRdfExpression"]>[0]): Code {
    return code`[${sharedImports.dataFactory}.literal(${variables.value})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<string>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<string>["fromRdfExpressionChain"]> {
    const inChain =
      this.primitiveIn.length > 0
        ? code`.chain(string_ => { switch (string_) { ${this.primitiveIn.map((value) => `case "${value}":`).join(" ")} return ${sharedImports.Either}.of<Error, ${this.name}>(string_); default: return ${sharedImports.Left}<Error, ${this.name}>(new ${sharedImports.Resource}.MistypedTermValueError(${{ actualValue: "value.toTerm()", expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})); } })`
        : "";

    return {
      ...super.fromRdfExpressionChain({ variables }),
      valueTo: code`chain(values => values.chainMap(value => value.toString()${inChain}))`,
    };
  }
}

namespace localSnippets {
  export const StringFilter = conditionalOutput(
    `${syntheticNamePrefix}StringFilter`,
    code`\
interface ${syntheticNamePrefix}StringFilter {
  readonly in?: readonly string[];
  readonly maxLength?: number;
  readonly minLength?: number;
}`,
  );

  export const StringSchema = conditionalOutput(
    `${syntheticNamePrefix}StringSchema`,
    code`\
interface ${syntheticNamePrefix}StringSchema {
  readonly kind: "StringType";
  readonly in?: readonly string[];
}`,
  );

  export const filterString = conditionalOutput(
    `${syntheticNamePrefix}filterString`,
    code`\
function ${syntheticNamePrefix}filterString(filter: ${StringFilter}, value: string) {
  if (typeof filter.in !== "undefined" && !filter.in.some(inValue => inValue === value)) {
    return false;
  }

  if (typeof filter.maxLength !== "undefined" && value.length > filter.maxLength) {
    return false;
  }

  if (typeof filter.minLength !== "undefined" && value.length < filter.minLength) {
    return false;
  }

  return true;
}`,
  );

  export const stringSparqlWherePatterns = conditionalOutput(
    `${syntheticNamePrefix}stringSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}stringSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${StringFilter}, ${StringSchema}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${sharedSnippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (typeof filter.in !== "undefined" && filter.in.length > 0) {
        filterPatterns.push(${sharedSnippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: filter.in }));
      }

      if (typeof filter.maxLength !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: "<=",
            args: [{ args: [valueVariable], operator: "strlen", type: "operation" }, ${sharedSnippets.toLiteral}(filter.maxLength)],
          },
          lift: true,
          type: "filter",
        });
      }

      if (typeof filter.minLength !== "undefined") {
        filterPatterns.push({
          expression: {
            type: "operation",
            operator: ">=",
            args: [{ args: [valueVariable], operator: "strlen", type: "operation" }, ${sharedSnippets.toLiteral}(filter.minLength)],
          },
          lift: true,
          type: "filter",
        });
      }
    }

    return ${sharedSnippets.literalSchemaSparqlWherePatterns}({ filterPatterns, valueVariable, ...otherParameters });
  }`,
  );
}
