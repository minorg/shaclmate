import type { Literal } from "@rdfjs/types";
import { AbstractTermType } from "./AbstractTermType.js";
import { objectInitializer } from "./objectInitializer.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";

export abstract class AbstractLiteralType extends AbstractTermType<
  Literal,
  Literal
> {
  protected readonly languageIn: readonly string[];

  constructor({
    languageIn,
    ...superParameters
  }: { languageIn: readonly string[] } & Omit<
    ConstructorParameters<typeof AbstractTermType<Literal, Literal>>[0],
    "nodeKinds"
  >) {
    super({
      ...superParameters,
      nodeKinds: new Set<"Literal">(["Literal"]),
    });
    this.languageIn = languageIn;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<
    AbstractTermType<Literal, Literal>["fromRdfExpressionChain"]
  >[0]): ReturnType<
    AbstractTermType<Literal, Literal>["fromRdfExpressionChain"]
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

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0] & {
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
}
