import { xsd } from "@tpluscode/rdf-ns-builders";

import { type Code, code, conditionalOutput } from "ts-poet";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class LiteralType extends AbstractLiteralType {
  override readonly filterFunction = code`${localSnippets.filterLiteral}`;
  override readonly filterType = code`${localSnippets.LiteralFilter}`;
  override readonly kind = "LiteralType";
  override readonly name = code`${imports.Literal}`;
  override readonly schemaType = code`${localSnippets.LiteralSchema}`;
  override readonly sparqlWherePatternsFunction =
    code`${localSnippets.literalSparqlWherePatterns}`;

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`${imports.dataFactory}.literal(${variables.value}["@value"], typeof ${variables.value}["@language"] !== "undefined" ? ${variables.value}["@language"] : (typeof ${variables.value}["@type"] !== "undefined" ? ${imports.dataFactory}.namedNode(${variables.value}["@type"]) : undefined))`;
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
      ? `, termType: ${imports.z}.literal("Literal")`
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

namespace localSnippets {
  export const LiteralFilter = conditionalOutput(
    `${syntheticNamePrefix}LiteralFilter`,
    code`\
interface ${syntheticNamePrefix}LiteralFilter extends Omit<${snippets.TermFilter}, "in" | "type"> {
  readonly in?: readonly ${imports.Literal}[];
}`,
  );

  export const LiteralSchema = conditionalOutput(
    `${syntheticNamePrefix}LiteralSchema`,
    code`\
interface ${syntheticNamePrefix}LiteralSchema {
  readonly kind: "LiteralType";
  readonly in?: readonly ${imports.Literal}[];
  readonly languageIn?: readonly string[];
}`,
  );

  export const filterLiteral = conditionalOutput(
    `${syntheticNamePrefix}filterLiteral`,
    code`\
function ${syntheticNamePrefix}filterLiteral(filter: ${localSnippets.LiteralFilter}, value: ${imports.Literal}): boolean {
  return ${snippets.filterTerm}(filter, value);
}`,
  );

  export const literalSparqlWherePatterns = conditionalOutput(
    `${syntheticNamePrefix}literalSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}literalSparqlWherePatterns: ${snippets.SparqlWherePatternsFunction}<${LiteralFilter}, ${LiteralSchema}> =
  (parameters) => ${syntheticNamePrefix}literalSchemaSparqlWherePatterns({ filterPatterns: ${snippets.termFilterSparqlPatterns}(parameters), ...parameters });`,
  );
}
