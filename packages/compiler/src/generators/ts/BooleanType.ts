import { xsd } from "@tpluscode/rdf-ns-builders";

import { NonEmptyList } from "purify-ts";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class BooleanType extends AbstractPrimitiveType<boolean> {
  override readonly filterFunction = code`${localSnippets.filterBoolean}`;
  override readonly filterType = code`${localSnippets.BooleanFilter}`;
  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${imports.GraphQLBoolean}`,
  );
  readonly kind = "BooleanType";
  override readonly schemaType = code`${localSnippets.BooleanSchema}`;
  override readonly sparqlWherePatternsFunction = code`${conditionalOutput(
    `${syntheticNamePrefix}booleanSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}booleanSparqlWherePatterns: ${snippets.SparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${snippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (typeof filter.value !== "undefined") {
        filterPatterns.push(${snippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: [filter.value] }));
      }
    }

    return ${snippets.termSchemaSparqlWherePatterns}({ filterPatterns, valueVariable, ...otherParameters });
  }`,
  )}`;
  override readonly typeofs = NonEmptyList(["boolean" as const]);

  @Memoize()
  override get name(): string {
    if (this.primitiveIn.length > 0) {
      return `${this.primitiveIn.map((value) => value.toString()).join(" | ")}`;
    }
    return `boolean`;
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
    if (this.primitiveIn.length === 1) {
      return code`${imports.z}.literal(${this.primitiveIn[0]})`;
    }
    return code`${imports.z}.boolean()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<boolean>["toRdfExpression"]>[0]): Code {
    return code`[${imports.dataFactory}.literal(${variables.value}.toString(), ${rdfjsTermExpression(xsd.boolean)})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<boolean>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<boolean>["fromRdfExpressionChain"]> {
    let fromRdfResourceValueExpression = "value.toBoolean()";
    if (this.primitiveIn.length === 1) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(primitiveValue => primitiveValue === ${this.primitiveIn[0]} ? ${imports.Either}.of${eitherTypeParameters}(primitiveValue) : ${imports.Left}${eitherTypeParameters}(new ${imports.Resource}.MistypedTermValueError(${{ actualValue: "value.toTerm()", expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})))`;
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
  export const BooleanFilter = conditionalOutput(
    `${syntheticNamePrefix}BooleanFilter`,
    code`\
interface ${syntheticNamePrefix}BooleanFilter {
  readonly value?: boolean;
}`,
  );

  export const BooleanSchema = conditionalOutput(
    `${syntheticNamePrefix}BooleanSchema`,
    code`\
interface ${syntheticNamePrefix}BooleanSchema {
  readonly in?: readonly boolean[];
}`,
  );

  export const filterBoolean = conditionalOutput(
    `${syntheticNamePrefix}filterBoolean`,
    code`\
function ${syntheticNamePrefix}filterBoolean(filter: ${BooleanFilter}, value: boolean) {
  if (typeof filter.value !== "undefined" && value !== filter.value) {
    return false;
  }

  return true;
}`,
  );
}
