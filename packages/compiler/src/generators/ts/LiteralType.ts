import type { Literal } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";

import { Maybe } from "purify-ts";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import type { Typeof } from "./Typeof.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export class LiteralType extends AbstractLiteralType {
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
  override readonly filterFunction =
    code`${this.reusables.snippets.filterLiteral}`;
  override readonly filterType = code`${this.reusables.snippets.LiteralFilter}`;
  override readonly fromRdfResourceValuesFunction =
    code`${this.reusables.snippets.literalFromRdfResourceValues}`;
  override readonly jsTypes = [
    { instanceof: "Object", typeof: "object" },
  ] as const;
  override readonly kind = "Literal";
  override readonly schemaType = code`${this.reusables.snippets.LiteralSchema}`;
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
    return code`${this.reusables.imports.Either}.of<Error, ${this.expression}>(${this.reusables.imports.dataFactory}.literal(${variables.value}["@value"], ${variables.value}["@language"] !== undefined ? ${variables.value}["@language"] : (${variables.value}["@type"] !== undefined ? ${this.reusables.imports.dataFactory}.namedNode(${variables.value}["@type"]!) : undefined)))`;
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

    return code`${this.reusables.imports.z}.object({ "@language": ${this.reusables.imports.z}.string().optional()${discriminantProperty}, "@type": ${this.reusables.imports.z}.string().optional(), "@value": ${this.reusables.imports.z}.string() })`;
  }

  override jsonType(
    parameters?: Parameters<AbstractLiteralType["jsonType"]>[0],
  ): AbstractLiteralType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "Literal"`
      : "";
    return new AbstractLiteralType.JsonType(
      code`{ readonly "@language"?: string${discriminantProperty}, readonly "@type"?: string, readonly "@value": string }`,
    );
  }

  override literalValueExpression(literal: Literal): Code {
    return this.rdfjsTermExpression(literal);
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return code`{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined${includeDiscriminantProperty ? `, "termType": "Literal" as const` : ""}, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
