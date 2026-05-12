import { xsd } from "@tpluscode/rdf-ns-builders";

import { AbstractLiteralType } from "./AbstractLiteralType.js";

import { type Code, code } from "./ts-poet-wrapper.js";

export class LiteralType extends AbstractLiteralType {
  override readonly filterFunction = code`${this.snippets.filterLiteral}`;
  override readonly filterType = code`${this.snippets.LiteralFilter}`;
  override readonly kind = "LiteralType";
  override readonly name = code`${this.imports.Literal}`;
  override readonly schemaType = code`${this.snippets.LiteralSchema}`;
  override readonly valueSparqlWherePatternsFunction =
    code`${this.snippets.literalSparqlWherePatterns}`;

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`${this.imports.dataFactory}.literal(${variables.value}["@value"], ${variables.value}["@language"] !== undefined ? ${variables.value}["@language"] : (${variables.value}["@type"] !== undefined ? ${this.imports.dataFactory}.namedNode(${variables.value}["@type"]!) : undefined))`;
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractLiteralType["hashStatements"]>[0]): readonly Code[] {
    return [
      ...super.hashStatements({ depth, variables }),
      code`${variables.hasher}.update(${variables.value}.datatype.value);`,
      code`${variables.hasher}.update(${variables.value}.language);`,
    ];
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

  override jsonSchema({
    includeDiscriminantProperty,
  }: Parameters<AbstractLiteralType["jsonSchema"]>[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${this.imports.z}.literal("Literal")`
      : "";

    return code`${this.imports.z}.object({ "@language": ${this.imports.z}.string().optional()${discriminantProperty}, "@type": ${this.imports.z}.string().optional(), "@value": ${this.imports.z}.string() })`;
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return code`{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined${includeDiscriminantProperty ? `, "termType": "Literal" as const` : ""}, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
