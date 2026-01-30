import type { Literal } from "@rdfjs/types";

import { camelCase } from "change-case";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractTermType } from "./AbstractTermType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

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

  override get constrained(): boolean {
    return super.constrained || this.languageIn.length > 0;
  }

  @Memoize()
  override get schema(): string {
    invariant(this.kind.endsWith("Type"));
    return this.constrained
      ? objectInitializer(this.schemaObject)
      : `${syntheticNamePrefix}${camelCase(this.kind.substring(0, this.kind.length - "Type".length))}Schema`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      languageIn:
        this.languageIn.length > 0
          ? this.languageIn.map((_) => JSON.stringify(_))
          : undefined,
    };
  }

  @Memoize()
  override get schemaType(): string {
    invariant(this.kind.endsWith("Type"));
    return `${this.kind.substring(0, this.kind.length - "Type".length)}Schema`;
  }

  protected override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      "languageIn?": "readonly string[]",
    };
  }

  override snippetDeclarations(
    parameters: Parameters<
      AbstractTermType<Literal, Literal>["snippetDeclarations"]
    >[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),

      !this.constrained
        ? singleEntryRecord(
            this.schema,
            `const ${this.schema} = ${objectInitializer(this.schemaObject)};`,
          )
        : {},

      singleEntryRecord(
        this.schemaType,
        `type ${this.schemaType} = Readonly<${objectInitializer(this.schemaTypeObject)}>;`,
      ),

      parameters.features.has("rdf")
        ? singleEntryRecord(
            `${syntheticNamePrefix}fromRdfPreferredLanguages`,
            `\
function ${syntheticNamePrefix}fromRdfPreferredLanguages(
  { focusResource, predicate, preferredLanguages, values }: {
    focusResource: rdfjsResource.Resource;
    predicate: rdfjs.NamedNode;
    preferredLanguages?: readonly string[];
    values: rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>
  }): purify.Either<Error, rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>> {
  if (!preferredLanguages || preferredLanguages.length === 0) {
    return purify.Either.of<Error, rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>>(values);
  }

  return values.chainMap(value => value.toLiteral()).map(literalValues => {
    // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
    // Within a preferredLanguage the literals may be in any order.
    let filteredLiteralValues: rdfjsResource.Resource.Values<rdfjs.Literal> | undefined;
    for (const preferredLanguage of preferredLanguages) {
      if (!filteredLiteralValues) {
        filteredLiteralValues = literalValues.filter(value => value.language === preferredLanguage);
      } else {
        filteredLiteralValues = filteredLiteralValues.concat(...literalValues.filter(value => value.language === preferredLanguage).toArray());
      }
    }

    return filteredLiteralValues!.map(literalValue => new rdfjsResource.Resource.TermValue({ focusResource, predicate, term: literalValue }));
  });
}`,
          )
        : {},
    );
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
      preferredLanguages: `chain(values => ${syntheticNamePrefix}fromRdfPreferredLanguages({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, preferredLanguages: ${variables.preferredLanguages}, values }))`,
      valueTo: "chain(values => values.chainMap(value => value.toLiteral()))",
    };
  }
}

export namespace AbstractLiteralType {
  export type Conversion = AbstractTermType.Conversion;
  export type DiscriminantProperty = AbstractTermType.DiscriminantProperty;
  export const GraphqlType = AbstractTermType.GraphqlType;
  export type GraphqlType = AbstractTermType.GraphqlType;
  export const JsonType = AbstractTermType.JsonType;
  export type JsonType = AbstractTermType.JsonType;
}
