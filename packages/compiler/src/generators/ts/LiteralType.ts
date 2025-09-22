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

  override propertyFromRdfResourceValueExpression({
    variables,
  }: Parameters<
    TermType<Literal, Literal>["propertyFromRdfResourceValueExpression"]
  >[0]): string {
    return `${variables.resourceValue}.toLiteral()`;
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
      `...[(${variables.languageIn} ?? ${JSON.stringify(this.languageIn)})]
        .filter(languagesIn => languagesIn.length > 0)
        .map(languagesIn =>
          ({
            type: "filter" as const,
            expression: {
              type: "operation" as const,
              operator: "||",
              args: languagesIn.map(
                languageIn => ({
                  type: "operation" as const,
                  operator: "=",
                  args: [
                    { type: "functionCall" as const, function: "lang", args: [${variables.object}] },
                    dataFactory.literal(languageIn)
                  ]
                })
              )
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

  protected override propertyFilterRdfResourceValuesExpression({
    variables,
  }: Parameters<
    TermType<Literal, Literal>["propertyFilterRdfResourceValuesExpression"]
  >[0]): string {
    return `${variables.resourceValues}.filter(_value => {
  const _languageInOrDefault = ${variables.languageIn} ?? ${JSON.stringify(this.languageIn)};
  if (_languageInOrDefault.length === 0) {
    return true;
  }
  const _valueLiteral = _value.toLiteral().toMaybe().extract();
  if (typeof _valueLiteral === "undefined") {
    return false;
  }
  return _languageInOrDefault.some(_languageIn => _languageIn === _valueLiteral.language);
})`;
  }
}
