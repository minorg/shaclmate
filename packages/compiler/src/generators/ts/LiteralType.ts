import type { Literal } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { FunctionReference } from "./FunctionReference.js";
import type { Typeof } from "./Typeof.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export class LiteralType extends AbstractLiteralType {
  private readonly languageIn: readonly string[];

  protected override readonly inlineExpression =
    code`${this.reusables.imports.Literal}`;

  override readonly conversionFunction: Maybe<AbstractLiteralType.ConversionFunction> =
    Maybe.of({
      code: code`${this.reusables.snippets.convertToLiteral}`,
      sourceTypes: [
        ...(
          ["bigint", "boolean", "number", "string"] satisfies readonly Typeof[]
        ).map((typeof_) => ({
          expression: code`${typeof_}`,
          jsType: { typeof: typeof_ },
        })),
        {
          expression: code`Date`,
          jsType: { instanceof: "Date", typeof: "object" },
        },
        {
          expression: code`${this.reusables.imports.Literal}`,
          jsType: { instanceof: "Object", typeof: "object" },
        },
      ],
    });
  override readonly filterFunction = new FunctionReference(
    this.reusables.snippets.filterLiteral,
  );
  override readonly filterType = code`${this.reusables.snippets.LiteralFilter}`;
  override readonly fromRdfResourceValuesFunction = new FunctionReference(
    this.reusables.snippets.literalFromRdfResourceValues,
  );
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "Literal";
  override readonly schemaType = code`${this.reusables.snippets.LiteralSchema}`;
  override readonly valueSparqlWherePatternsFunction = new FunctionReference(
    this.reusables.snippets.literalSparqlWherePatterns,
  );

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
    return code`${this.reusables.imports.Either}.of<Error, ${this.expression}>(${this.reusables.imports.dataFactory}.literal(${variables.value}["@value"], ${variables.value}["@language"] !== undefined ? ${variables.value}["@language"] : (${variables.value}["@type"] !== undefined ? ${this.reusables.imports.dataFactory}.namedNode(${variables.value}["@type"]!) : undefined)))`;
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
        optional: true,
        type: this.jsonTypeFactory.createJsonStringType(),
      },
      "@type": {
        optional: true,
        type: this.jsonTypeFactory.createJsonStringType(),
      },
      "@value": {
        type: this.jsonTypeFactory.createJsonStringType(),
      },
    });
  }

  override toJsonExpression({
    discriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return code`${{
      ...discriminantProperty,
      "@language": code`${variables.value}.language.length > 0 ? ${variables.value}.language : undefined`,
      "@type": code`${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined`,
      "@value": code`${variables.value}.value`,
    }}`;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractLiteralType["toLoggableExpression"]>[0]): Code {
    return this.toJsonExpression({ form: "expanded", variables });
  }

  override valueExpression(literal: Literal): Code {
    return this.rdfjsTermExpression(literal);
  }
}
