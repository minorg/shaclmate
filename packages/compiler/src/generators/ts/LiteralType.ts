import { xsd } from "@tpluscode/rdf-ns-builders";
import { Memoize } from "typescript-memoize";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { Type } from "./Type.js";

export class LiteralType extends AbstractLiteralType {
  @Memoize()
  override jsonName(
    parameters?: Parameters<Type["jsonName"]>[0],
  ): Type.JsonName {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "Literal"`
      : "";
    return new Type.JsonName(
      `{ readonly "@language"?: string${discriminantProperty}, readonly "@type"?: string, readonly "@value": string }`,
    );
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): string {
    return `dataFactory.literal(${variables.value}["@value"], typeof ${variables.value}["@language"] !== "undefined" ? ${variables.value}["@language"] : (typeof ${variables.value}["@type"] !== "undefined" ? dataFactory.namedNode(${variables.value}["@type"]) : undefined))`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractLiteralType["hashStatements"]>[0]): readonly string[] {
    return [
      `${variables.hasher}.update(${variables.value}.datatype.value);`,
      `${variables.hasher}.update(${variables.value}.language);`,
    ].concat(super.hashStatements({ depth, variables }));
  }

  override jsonZodSchema({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["jsonZodSchema"]>[0]): ReturnType<
    AbstractLiteralType["jsonZodSchema"]
  > {
    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.zod}.literal("Literal")`
      : "";

    return `${variables.zod}.object({ "@language": ${variables.zod}.string().optional()${discriminantProperty}, "@type": ${variables.zod}.string().optional(), "@value": ${variables.zod}.string() })`;
  }

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): readonly string[] {
    let snippetDeclarations = super.snippetDeclarations(parameters);
    const { features } = parameters;
    if (features.has("sparql") && this.languageIn.length > 0) {
      snippetDeclarations = snippetDeclarations.concat(
        SnippetDeclarations.arrayIntersection,
      );
    }
    return snippetDeclarations;
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): string {
    return `{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined${includeDiscriminantProperty ? `, "termType": "Literal" as const` : ""}, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
