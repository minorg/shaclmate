import { xsd } from "@tpluscode/rdf-ns-builders";
import { NonEmptyList } from "purify-ts";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";
import { AbstractPrimitiveType } from "./AbstractPrimitiveType.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { sharedImports } from "./sharedImports.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

const localSnippets = {
  BooleanFilter: conditionalOutput(
    `${syntheticNamePrefix}BooleanFilter`,
    code`\
interface ${syntheticNamePrefix}BooleanFilter {
  readonly value?: boolean;
}`,
  ),
};

export class BooleanType extends AbstractPrimitiveType<boolean> {
  override readonly filterFunction = code`${conditionalOutput(
    `${syntheticNamePrefix}filterBoolean`,
    code`\
function ${syntheticNamePrefix}filterBoolean(filter: ${localSnippets.BooleanFilter}, value: boolean) {
  if (typeof filter.value !== "undefined" && value !== filter.value) {
    return false;
  }

  return true;
}`,
  )}`;

  override readonly filterType = code`${localSnippets.BooleanFilter}`;

  override readonly graphqlType = new AbstractPrimitiveType.GraphqlType(
    code`${sharedImports.GraphQLBoolean}`,
  );

  override readonly sparqlWherePatternsFunction = code`${conditionalOutput(
    `${syntheticNamePrefix}booleanSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}booleanSparqlWherePatterns: ${sharedSnippets.SparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> =
  ({ filter, valueVariable, ...otherParameters }) => {
    const filterPatterns: ${sharedSnippets.SparqlFilterPattern}[] = [];

    if (filter) {
      if (typeof filter.value !== "undefined") {
        filterPatterns.push(${sharedSnippets.sparqlValueInPattern}({ lift: true, valueVariable, valueIn: [filter.value] }));
      }
    }

    return ${sharedSnippets.termSchemaSparqlWherePatterns}({ filterPatterns, valueVariable, ...otherParameters });
  }`,
  )}`;

  readonly kind = "BooleanType";
  override readonly typeofs = NonEmptyList(["boolean" as const]);

  @Memoize()
  override get name(): Code {
    if (this.primitiveIn.length > 0) {
      return code`${this.primitiveIn.map((value) => value.toString()).join(" | ")}`;
    }
    return code`boolean`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      in: this.primitiveIn.length > 0 ? this.primitiveIn.concat() : undefined,
    };
  }

  protected override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      "in?": `readonly boolean[]`,
    };
  }

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractPrimitiveType<boolean>["jsonZodSchema"]>[0]): Code {
    if (this.primitiveIn.length === 1) {
      return code`${variables.zod}.literal(${this.primitiveIn[0]})`;
    }
    return code`${variables.zod}.boolean()`;
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractPrimitiveType<boolean>["toRdfExpression"]>[0]): Code {
    return code`[${sharedImports.dataFactory}.literal(${variables.value}.toString(), ${rdfjsTermExpression(xsd.boolean)})]`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractPrimitiveType<boolean>["fromRdfExpressionChain"]
  >[0]): ReturnType<AbstractPrimitiveType<boolean>["fromRdfExpressionChain"]> {
    let fromRdfResourceValueExpression = "value.toBoolean()";
    if (this.primitiveIn.length === 1) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      fromRdfResourceValueExpression = `${fromRdfResourceValueExpression}.chain(primitiveValue => primitiveValue === ${this.primitiveIn[0]} ? ${sharedImports.Either}.of${eitherTypeParameters}(primitiveValue) : ${sharedImports.Left}${eitherTypeParameters}(new ${sharedImports.Resource}.MistypedTermValueError(${{ actualValue: "value.toTerm()", expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})))`;
    }

    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      preferredLanguages: undefined,
      valueTo: code`chain(values => values.chainMap(value => ${fromRdfResourceValueExpression}))`,
    };
  }
}
