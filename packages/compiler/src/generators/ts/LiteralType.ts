import { xsd } from "@tpluscode/rdf-ns-builders";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class LiteralType extends AbstractLiteralType {
  override readonly filterFunction = code`${snippets.filterLiteral}`;
  override readonly filterType = code`${snippets.LiteralFilter}`;
  override readonly kind = "LiteralType";
  override readonly name = code`${imports.Literal}`;
  override readonly schemaType = code`${snippets.LiteralSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${snippets.literalSparqlWherePatterns}`;

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`${imports.dataFactory}.literal(${variables.value}["@value"], ${variables.value}["@language"] !== undefined ? ${variables.value}["@language"] : (${variables.value}["@type"] !== undefined ? ${imports.dataFactory}.namedNode(${variables.value}["@type"]) : undefined))`;
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

  override jsonZodSchema({
    includeDiscriminantProperty,
  }: Parameters<AbstractLiteralType["jsonZodSchema"]>[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? code`, termType: ${imports.z}.literal("Literal")`
      : "";

    return code`${imports.z}.object({ "@language": ${imports.z}.string().optional()${discriminantProperty}, "@type": ${imports.z}.string().optional(), "@value": ${imports.z}.string() })`;
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return code`{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined${includeDiscriminantProperty ? `, "termType": "Literal" as const` : ""}, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
