import { xsd } from "@tpluscode/rdf-ns-builders";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class LiteralType extends AbstractLiteralType {
  override readonly filterFunction = `${syntheticNamePrefix}filterLiteral`;
  override readonly filterType = `${syntheticNamePrefix}LiteralFilter`;
  override readonly kind = "LiteralType";

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
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

  override jsonType(
    parameters?: Parameters<AbstractLiteralType["jsonType"]>[0],
  ): AbstractLiteralType.JsonType {
    const discriminantProperty = parameters?.includeDiscriminantProperty
      ? `, readonly termType: "Literal"`
      : "";
    return new AbstractLiteralType.JsonType(
      `{ readonly "@language"?: string${discriminantProperty}, readonly "@type"?: string, readonly "@value": string }`,
    );
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
    parameters: Parameters<AbstractLiteralType["snippetDeclarations"]>[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),

      singleEntryRecord(
        `${syntheticNamePrefix}filterLiteral`,
        `\
function ${syntheticNamePrefix}filterLiteral(filter: ${syntheticNamePrefix}LiteralFilter, value: rdfjs.Literal): boolean {
  return ${syntheticNamePrefix}filterTerm(filter, value);
}`,
      ),
      sharedSnippetDeclarations.filterTerm,
      singleEntryRecord(
        `${syntheticNamePrefix}LiteralFilter`,
        `\
interface ${syntheticNamePrefix}LiteralFilter extends Omit<${syntheticNamePrefix}TermFilter, "in" | "type"> {
  readonly in?: readonly rdfjs.Literal[];
}`,
      ),

      parameters.features.has("sparql")
        ? singleEntryRecord(
            `${syntheticNamePrefix}literalSparqlWherePatterns`,
            {
              code: `\
const ${syntheticNamePrefix}literalSparqlWherePatterns: ${syntheticNamePrefix}SparqlWherePatternsFunction<${this.filterType}, ${this.schemaType}> =
  (parameters) => ${syntheticNamePrefix}literalSchemaSparqlWherePatterns({ filterPatterns: ${syntheticNamePrefix}termFilterSparqlPatterns(parameters), ...parameters });`,
              dependencies: {
                ...sharedSnippetDeclarations.literalSchemaSparqlWherePatterns,
                ...sharedSnippetDeclarations.termFilterSparqlPatterns,
                ...sharedSnippetDeclarations.SparqlWherePatternsFunction,
              },
            },
          )
        : {},
    );
  }

  override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      "defaultValue?": "rdfjs.Literal",
      "in?": "readonly rdfjs.Literal[]",
    };
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): string {
    return `{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined${includeDiscriminantProperty ? `, "termType": "Literal" as const` : ""}, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
