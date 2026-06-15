import type { Literal } from "@rdfjs/types";

import { Maybe } from "purify-ts";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export class LangStringType extends AbstractLiteralType {
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
    code`${this.reusables.snippets.literalSparqlWherePatterns}`;

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
  }

  protected override get schemaInitializers() {
    let initializers = super.schemaInitializers;
    if (this.in_.length > 0) {
      initializers = initializers.concat(
        code`in: ${arrayOf(...this.in_.map((in_) => this.rdfjsTermExpression(in_)))}`,
      );
    }
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

  override jsonSchema({
    includeDiscriminantProperty,
  }: Parameters<AbstractLiteralType["jsonSchema"]>[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${this.reusables.imports.z}.literal("Literal")`
      : "";

    return code`${this.reusables.imports.z}.object({ "@language": ${this.reusables.imports.z}.string()${discriminantProperty}, "@value": ${this.reusables.imports.z}.string() })`;
  }

  override jsonType(
    parameters?: Parameters<AbstractLiteralType["jsonType"]>[0],
  ): AbstractLiteralType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "Literal"`
      : "";
    return new AbstractLiteralType.JsonType(
      code`{ readonly "@language": string${discriminantProperty}, readonly "@value": string }`,
    );
  }

  override literalValueExpression(literal: Literal): Code {
    return this.rdfjsTermExpression(literal);
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return code`{ "@language": ${variables.value}.language${includeDiscriminantProperty ? `, "termType": "Literal" as const` : ""}, "@value": ${variables.value}.value }`;
  }
}
