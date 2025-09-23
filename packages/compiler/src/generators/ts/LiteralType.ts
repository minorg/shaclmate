import type { Literal } from "@rdfjs/types";
import { xsd } from "@tpluscode/rdf-ns-builders";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { TermType } from "./TermType.js";
import { Type } from "./Type.js";

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
  override get jsonName(): Type.JsonName {
    return new Type.JsonName(
      '{ readonly "@language"?: string, readonly "@type"?: string, readonly "@value": string }',
    );
  }

  override fromJsonExpression({
    variables,
  }: Parameters<TermType<Literal, Literal>["fromJsonExpression"]>[0]): string {
    return `dataFactory.literal(${variables.value}["@value"], typeof ${variables.value}["@language"] !== "undefined" ? ${variables.value}["@language"] : (typeof ${variables.value}["@type"] !== "undefined" ? dataFactory.namedNode(${variables.value}["@type"]) : undefined))`;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): {
    defaultValue?: string;
    hasValues?: string;
    languageIn?: string;
    valueTo?: string;
  } {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: `chain(values => {
      const literalValuesEither = values.chainMap(value => value.toLiteral());
      if (literalValuesEither.isLeft()) {
        return literalValuesEither;
      }
      const literalValues = literalValuesEither.unsafeCoerce();

      const nonUniqueLanguageIn = ${variables.languageIn} ?? ${JSON.stringify(this.languageIn)};
      if (nonUniqueLanguageIn.length === 0) {
        return purify.Either.of<Error, rdfjsResource.Resource.Values<rdfjs.Literal>>(literalValues);
      }

      let uniqueLanguageIn: string[];
      if (nonUniqueLanguageIn.length === 1) {
        uniqueLanguageIn = [nonUniqueLanguageIn[0]];
      } else {
        uniqueLanguageIn = [];
        for (const languageIn of nonUniqueLanguageIn) {
          if (uniqueLanguageIn.indexOf(languageIn) === -1) {
            uniqueLanguageIn.push(languageIn);
          }
        }
      }

      // Return all literals for the first languageIn, then all literals for the second languageIn, etc.
      // Within a languageIn the literals may be in any order.
      let filteredLiteralValues: rdfjsResource.Resource.Values<rdfjs.Literal> | undefined;
      for (const languageIn of uniqueLanguageIn) {
        if (!filteredLiteralValues) {
          filteredLiteralValues = literalValues.filter(value => value.language === languageIn);
        } else {
          filteredLiteralValues = filteredLiteralValues.concat(...literalValues.filter(value => value.language === languageIn).toArray());
        }
      }

      return purify.Either.of<Error, rdfjsResource.Resource.Values<rdfjs.Literal>>(filteredLiteralValues!);
    })`,
      valueTo: undefined,
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
    variables,
  }: Parameters<TermType<Literal, Literal>["jsonZodSchema"]>[0]): ReturnType<
    TermType<Literal, Literal>["jsonZodSchema"]
  > {
    return `${variables.zod}.object({ "@language": ${variables.zod}.string().optional(), "@type": ${variables.zod}.string().optional(), "@value": ${variables.zod}.string() })`;
  }

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0] & {
      ignoreLanguageIn?: boolean;
    },
  ): readonly string[] {
    const { context, ignoreLanguageIn, variables } = parameters;

    const superPatterns = super.sparqlWherePatterns(parameters);
    if (ignoreLanguageIn || context === "subject") {
      return superPatterns;
    }

    invariant(this.name.indexOf("rdfjs.Literal") !== -1, this.name);

    return superPatterns.concat(
      `...[(${variables.languageIn} && ${variables.languageIn}.length > 0) ? ${variables.languageIn} : ${JSON.stringify(this.languageIn)}]
        .filter(languagesIn => languagesIn.length > 0)
        .map(languagesIn =>
          languagesIn.map(languageIn => 
            ({
              type: "operation" as const,
              operator: "=",
              args: [
                { type: "operation" as const, operator: "lang", args: [${variables.object}] },
                dataFactory.literal(languageIn)
              ]
            })
          )
        )
        .map(langEqualsExpressions => 
          ({
            type: "filter" as const,
            expression:
              langEqualsExpressions.length === 1
                ? langEqualsExpressions[0]
                :
                  {
                    type: "operation" as const,
                    operator: "||",
                    args: langEqualsExpressions
                  },
          })
        )`,
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<TermType<Literal, Literal>["toJsonExpression"]>[0]): string {
    return `{ "@language": ${variables.value}.language.length > 0 ? ${variables.value}.language : undefined, "@type": ${variables.value}.datatype.value !== "${xsd.string.value}" ? ${variables.value}.datatype.value : undefined, "@value": ${variables.value}.value }`;
  }
}
