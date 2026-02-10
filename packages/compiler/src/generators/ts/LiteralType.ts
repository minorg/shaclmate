import { xsd } from "@tpluscode/rdf-ns-builders";
import { type Code, code, conditionalOutput } from "ts-poet";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { sharedImports } from "./sharedImports.js";
import { sharedSnippets } from "./sharedSnippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

const localSnippets = {
  LiteralFilter: conditionalOutput(
    `${syntheticNamePrefix}LiteralFilter`,
    code`\
interface ${syntheticNamePrefix}LiteralFilter extends Omit<${sharedSnippets.TermFilter}, "in" | "type"> {
  readonly in?: readonly ${sharedImports.Literal}[];
}`,
  ),
};

export class LiteralType extends AbstractLiteralType {
  override readonly filterFunction = code`${conditionalOutput(
    `${syntheticNamePrefix}filterLiteral`,
    code`\
function ${syntheticNamePrefix}filterLiteral(filter: ${localSnippets.LiteralFilter}, value: ${sharedImports.Literal}): boolean {
  return ${sharedSnippets.filterTerm}(filter, value);
}`,
  )}`;

  override readonly filterType = code`${localSnippets.LiteralFilter}`;

  override readonly kind = "LiteralType";

  override readonly sparqlWherePatternsFunction = code`${conditionalOutput(
    `${syntheticNamePrefix}literalSparqlWherePatterns`,
    code`\
const ${syntheticNamePrefix}literalSparqlWherePatterns: ${sharedSnippets.SparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> =
  (parameters) => ${syntheticNamePrefix}literalSchemaSparqlWherePatterns({ filterPatterns: ${sharedSnippets.termFilterSparqlPatterns}(parameters), ...parameters });`,
  )}`;

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`${sharedImports.dataFactory}.literal(${variables.value}["@value"], typeof ${variables.value}["@language"] !== "undefined" ? ${variables.value}["@language"] : (typeof ${variables.value}["@type"] !== "undefined" ? ${sharedImports.dataFactory}.namedNode(${variables.value}["@type"]) : undefined))`;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractLiteralType["hashStatements"]>[0]): Code {
    return code`\
${super.hashStatements({ depth, variables })}
${variables.hasher}.update(${variables.value}.datatype.value);
${variables.hasher}.update(${variables.value}.language);
`;
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
    variables,
  }: Parameters<AbstractLiteralType["jsonZodSchema"]>[0]): Code {
    const discriminantProperty = includeDiscriminantProperty
      ? `, termType: ${variables.zod}.literal("Literal")`
      : "";

    return code`${variables.zod}.object({ "@language": ${variables.zod}.string().optional()${discriminantProperty}, "@type": ${variables.zod}.string().optional(), "@value": ${variables.zod}.string() })`;
  }

  override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      "in?": "readonly rdfjs.Literal[]",
    };
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return code`{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined${includeDiscriminantProperty ? `, "termType": "Literal" as const` : ""}, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
