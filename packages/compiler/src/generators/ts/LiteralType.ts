import { xsd } from "@tpluscode/rdf-ns-builders";
import { Memoize } from "typescript-memoize";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import type { Sparql } from "./Sparql.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class LiteralType extends AbstractLiteralType {
  override readonly filterFunction = `${syntheticNamePrefix}filterLiteral`;
  override readonly filterType = `${syntheticNamePrefix}LiteralFilter`;

  get graphqlType(): AbstractLiteralType.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  override get schema(): string {
    return "{}";
  }

  protected override filterSparqlWherePatterns({
    variables,
  }: Parameters<
    AbstractLiteralType["filterSparqlWherePatterns"]
  >[0]): readonly Sparql.Pattern[] {
    return [
      ...this.preferredLanguagesSparqlWherePatterns({ variables }),
      {
        patterns: `${syntheticNamePrefix}LiteralFilter.${syntheticNamePrefix}sparqlWherePatterns(${variables.filter}, ${variables.valueVariable})`,
        type: "opaque-block" as const,
      },
    ];
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
  ): Readonly<Record<string, string>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),
      parameters.features.has("sparql") && this.languageIn.length > 0
        ? singleEntryRecord(
            `${syntheticNamePrefix}arrayIntersection`,
            `\
function ${syntheticNamePrefix}arrayIntersection<T>(left: readonly T[], right: readonly T[]): readonly T[] {
  if (left.length === 0) {
    return right;
  }
  if (right.length === 0) {
    return left;
  }

  const intersection = new Set<T>();
  if (left.length <= right.length) {
    const rightSet = new Set(right);
    for (const leftElement of left) {
      if (rightSet.has(leftElement)) {
        intersection.add(leftElement);
      }
    }
  } else {
    const leftSet = new Set(left);
    for (const rightElement of right) {
      if (leftSet.has(rightElement)) {
        intersection.add(rightElement);
      }  
    }
  }
  return [...intersection];
}`,
          )
        : {},
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
            `${syntheticNamePrefix}LiteralFilter.sparqlWherePatterns`,
            `\
namespace ${syntheticNamePrefix}LiteralFilter {
  export function ${syntheticNamePrefix}sparqlWherePatterns(filter: ${syntheticNamePrefix}LiteralFilter | undefined, value: rdfjs.Variable): readonly sparqljs.FilterPattern[] {
    return ${syntheticNamePrefix}TermFilter.${syntheticNamePrefix}sparqlWherePatterns(filter, value);
  }
}`,
          )
        : {},
      sharedSnippetDeclarations.TermFilter,
      parameters.features.has("sparql")
        ? sharedSnippetDeclarations.TermFilter_sparqlWherePatterns
        : {},
    );
  }

  override toJsonExpression({
    includeDiscriminantProperty,
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): string {
    return `{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined${includeDiscriminantProperty ? `, "termType": "Literal" as const` : ""}, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
