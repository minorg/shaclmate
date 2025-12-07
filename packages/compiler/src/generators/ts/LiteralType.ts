import type { Literal } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { TermType } from "./TermType.js";
import { objectInitializer } from "./objectInitializer.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class LiteralType extends TermType<Literal, Literal> {
  private readonly languageIn: readonly string[];

  constructor({
    languageIn,
    ...superParameters
  }: { languageIn: readonly string[] } & Omit<
    ConstructorParameters<typeof TermType<Literal, Literal>>[0],
    "nodeKinds"
  >) {
    super({
      ...superParameters,
      nodeKinds: new Set<"Literal">(["Literal"]),
    });
    this.languageIn = languageIn;
  }

  @Memoize()
  override jsonName(
    parameters?: Parameters<AbstractType["jsonName"]>[0],
  ): AbstractType.JsonName {
    const discriminatorProperty = parameters?.includeDiscriminatorProperty
      ? `, readonly termType: "Literal"`
      : "";
    return new AbstractType.JsonName(
      `{ readonly "@language"?: string${discriminatorProperty}, readonly "@type"?: string, readonly "@value": string }`,
    );
  }

  override fromJsonExpression({
    variables,
  }: Parameters<TermType<Literal, Literal>["fromJsonExpression"]>[0]): string {
    return `dataFactory.literal(${variables.value}["@value"], typeof ${variables.value}["@language"] !== "undefined" ? ${variables.value}["@language"] : (typeof ${variables.value}["@type"] !== "undefined" ? dataFactory.namedNode(${variables.value}["@type"]) : undefined))`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<TermType<Literal>["fromRdfExpressionChain"]>[0]): ReturnType<
    TermType<Literal>["fromRdfExpressionChain"]
  > {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn:
        this.languageIn.length > 0
          ? `chain(values => values.chainMap(value => value.toLiteral().chain(literalValue => { switch (literalValue.language) { ${this.languageIn.map((languageIn) => `case "${languageIn}":`).join(" ")} return purify.Either.of(value); default: return purify.Left(new rdfjsResource.Resource.MistypedTermValueError(${objectInitializer({ actualValue: "literalValue", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })})); } })))`
          : undefined,
      preferredLanguages: `chain(values => {
        if (!${variables.preferredLanguages} || ${variables.preferredLanguages}.length === 0) {
          return purify.Either.of<Error, rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>>(values);
        }

        const literalValuesEither = values.chainMap(value => value.toLiteral());
        if (literalValuesEither.isLeft()) {
          return literalValuesEither;
        }
        const literalValues = literalValuesEither.unsafeCoerce();

        // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
        // Within a preferredLanguage the literals may be in any order.
        let filteredLiteralValues: rdfjsResource.Resource.Values<rdfjs.Literal> | undefined;
        for (const preferredLanguage of ${variables.preferredLanguages}) {
          if (!filteredLiteralValues) {
            filteredLiteralValues = literalValues.filter(value => value.language === preferredLanguage);
          } else {
            filteredLiteralValues = filteredLiteralValues.concat(...literalValues.filter(value => value.language === preferredLanguage).toArray());
          }
        }

        return purify.Either.of<Error, rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>>(filteredLiteralValues!.map(literalValue => new rdfjsResource.Resource.TermValue({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, term: literalValue })));
      })`,
      valueTo: "chain(values => values.chainMap(value => value.toLiteral()))",
    };
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<
    TermType<Literal, Literal>["hashStatements"]
  >[0]): readonly string[] {
    return [
      `${variables.hasher}.update(${variables.value}.datatype.value);`,
      `${variables.hasher}.update(${variables.value}.language);`,
    ].concat(super.hashStatements({ depth, variables }));
  }

  override jsonZodSchema({
    includeDiscriminatorProperty,
    variables,
  }: Parameters<TermType<Literal, Literal>["jsonZodSchema"]>[0]): ReturnType<
    TermType<Literal, Literal>["jsonZodSchema"]
  > {
    const discriminatorProperty = includeDiscriminatorProperty
      ? `, termType: ${variables.zod}.literal("Literal")`
      : "";

    return `${variables.zod}.object({ "@language": ${variables.zod}.string().optional()${discriminatorProperty}, "@type": ${variables.zod}.string().optional(), "@value": ${variables.zod}.string() })`;
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractType["snippetDeclarations"]>[0],
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

  override sparqlWherePatterns(
    parameters: Parameters<AbstractType["sparqlWherePatterns"]>[0] & {
      ignoreLiteralLanguage?: boolean;
    },
  ): readonly string[] {
    const { context, ignoreLiteralLanguage, variables } = parameters;

    const superPatterns = super.sparqlWherePatterns(parameters);
    if (ignoreLiteralLanguage || context === "subject") {
      return superPatterns;
    }

    return superPatterns.concat(
      `...[${
        this.languageIn.length > 0
          ? `[...${syntheticNamePrefix}arrayIntersection(${JSON.stringify(this.languageIn)}, ${variables.preferredLanguages} ?? [])]`
          : `(${variables.preferredLanguages} ?? [])`
      }]
        .filter(languages => languages.length > 0)
        .map(languages =>
          languages.map(language => 
            ({
              type: "operation" as const,
              operator: "=",
              args: [
                { type: "operation" as const, operator: "lang", args: [${variables.object}] },
                dataFactory.literal(language)
              ]
            })
          )
        )
        .map(langEqualsExpressions => 
          ({
            type: "filter" as const,
            expression: langEqualsExpressions.reduce((reducedExpression, langEqualsExpression) => {
              if (reducedExpression === null) {
                return langEqualsExpression;
              }
              return {
                type: "operation" as const,
                operator: "||",
                args: [reducedExpression, langEqualsExpression]
              };
            }, null as sparqljs.Expression | null) as sparqljs.Expression
          })
        )`,
    );
  }

  override toJsonExpression({
    includeDiscriminatorProperty,
    variables,
  }: Parameters<TermType<Literal, Literal>["toJsonExpression"]>[0]): string {
    return `{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined${includeDiscriminatorProperty ? `, "termType": "Literal" as const` : ""}, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
