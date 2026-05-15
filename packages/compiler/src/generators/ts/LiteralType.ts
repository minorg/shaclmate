import { xsd } from "@tpluscode/rdf-ns-builders";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class LiteralType extends AbstractLiteralType {
  override readonly filterFunction =
    code`${this.reusables.snippets.filterLiteral}`;
  override readonly filterType = code`${this.reusables.snippets.LiteralFilter}`;
  override readonly kind = "LiteralType";
  override readonly name = code`${this.reusables.imports.Literal}`;
  override readonly schemaType = code`${this.reusables.snippets.LiteralSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.reusables.snippets.literalSparqlWherePatterns}`;

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`${this.reusables.imports.dataFactory}.literal(${variables.value}["@value"], ${variables.value}["@language"] !== undefined ? ${variables.value}["@language"] : (${variables.value}["@type"] !== undefined ? ${this.reusables.imports.dataFactory}.namedNode(${variables.value}["@type"]!) : undefined))`;
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

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return code`{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined${includeDiscriminantProperty ? `, "termType": "Literal" as const` : ""}, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
