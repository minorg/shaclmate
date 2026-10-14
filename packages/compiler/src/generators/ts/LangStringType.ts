import type { Literal } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export class LangStringType extends AbstractLiteralType {
  private readonly languageIn: readonly string[];

  protected override readonly inlineExpression =
    code`${this.reusables.imports.Literal}`;

  override readonly conversionFunction: Maybe<AbstractLiteralType.ConversionFunction> =
    Maybe.of({
      code: code`${this.reusables.snippets.convertToLangString}`,
      sourceTypes: [
        {
          expression: code`${this.reusables.imports.Literal}`,
          jsType: { instanceof: "Object", typeof: "object" },
        },
      ],
    });
  override readonly filterFunction =
    code`${this.reusables.snippets.filterLiteral}`;
  override readonly filterType = code`${this.reusables.snippets.LiteralFilter}`;
  override readonly fromRdfResourceValuesFunction =
    code`${this.reusables.snippets.langStringFromRdfResourceValues}`;
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "LangString";
  override readonly schemaType =
    code`${this.reusables.snippets.LangStringSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.langStringSparqlWherePatterns}`;

  constructor({
    languageIn,
    ...superParameters
  }: { languageIn: readonly string[] } & ConstructorParameters<
    typeof AbstractLiteralType
  >[0]) {
    super(superParameters);
    this.languageIn = languageIn;
  }

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
  }

  protected override get schemaInitializers() {
    let initializers = super.schemaInitializers;
    if (this.languageIn.length > 0) {
      initializers = initializers.concat(
        code`languageIn: ${arrayOf(...this.languageIn)}`,
      );
    }
    return initializers;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, ${this.expression}>(${this.reusables.imports.dataFactory}.literal(${variables.value}["@value"], ${variables.value}["@language"]))`;
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  override jsonType({
    discriminantProperty,
  }: Parameters<
    AbstractLiteralType["jsonType"]
  >[0]): AbstractLiteralType.JsonType {
    return this.jsonTypeFactory.createJsonObjectType({
      ...discriminantProperty,
      "@language": {
        type: this.jsonTypeFactory.createJsonStringType({ minLength: 1n }),
      },
      "@value": { type: this.jsonTypeFactory.createJsonStringType() },
    });
  }

  override valueExpression(literal: Literal): Code {
    return this.rdfjsTermExpression(literal);
  }

  override toJsonExpression({
    discriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return code`${{
      ...discriminantProperty,
      "@language": code`${variables.value}.language`,
      "@value": code`${variables.value}.value`,
    }}`;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractLiteralType["toLoggableExpression"]>[0]): Code {
    return code`\`\${JSON.stringify(${variables.value}.value)}@\${${variables.value}.language}\``;
  }
}
