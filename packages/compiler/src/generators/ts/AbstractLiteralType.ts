import type { Literal } from "@rdfjs/types";

import { invariant } from "ts-invariant";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractTermType } from "./AbstractTermType.js";
import { sharedImports } from "./sharedImports.js";
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
  override get schema(): Code {
    invariant(this.kind.endsWith("Type"));
    if (this.constrained) {
      return code`${this.schemaObject}`;
    }

    return code`${conditionalOutput(`${syntheticNamePrefix}unconstrained${this.kind.substring(0, this.kind.length - "Type".length)}Schema`, code`const ${this.kind.substring(0, this.kind.length - "Type".length)}Schema = ${this.schemaObject};`)}`;
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
          ? code`chain(values => values.chainMap(value => value.toLiteral().chain(literalValue => { switch (literalValue.language) { ${this.languageIn.map((languageIn) => `case "${languageIn}":`).join(" ")} return ${sharedImports.Either}.of(value); default: return ${sharedImports.Left}(new ${sharedImports.Resource}.MistypedTermValueError(${{ actualValue: "literalValue", expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }})); } })))`
          : undefined,
      preferredLanguages: code`chain(values => ${localSnippets.fromRdfPreferredLanguages}({ focusResource: ${variables.resource}, predicate: ${variables.predicate}, preferredLanguages: ${variables.preferredLanguages}, values }))`,
      valueTo: code`chain(values => values.chainMap(value => value.toLiteral()))`,
    };
  }
}

namespace localSnippets {
  export const fromRdfPreferredLanguages = conditionalOutput(
    `${syntheticNamePrefix}fromRdfPreferredLanguages`,
    code`\
function ${syntheticNamePrefix}fromRdfPreferredLanguages(
  { focusResource, predicate, preferredLanguages, values }: {
    focusResource: ${sharedImports}Resource;
    predicate: ${sharedImports.NamedNode};
    preferredLanguages?: readonly string[];
    values: ${sharedImports.Resource}.Values<${sharedImports.Resource}.TermValue>
  }): purify.Either<Error, ${sharedImports.Resource}.Values<${sharedImports.Resource}.TermValue>> {
  if (!preferredLanguages || preferredLanguages.length === 0) {
    return purify.Either.of<Error, ${sharedImports.Resource}.Values<${sharedImports.Resource}.TermValue>>(values);
  }

  return values.chainMap(value => value.toLiteral()).map(literalValues => {
    // Return all literals for the first preferredLanguage, then all literals for the second preferredLanguage, etc.
    // Within a preferredLanguage the literals may be in any order.
    let filteredLiteralValues: ${sharedImports.Resource}.Values<${sharedImports.Literal}> | undefined;
    for (const preferredLanguage of preferredLanguages) {
      if (!filteredLiteralValues) {
        filteredLiteralValues = literalValues.filter(value => value.language === preferredLanguage);
      } else {
        filteredLiteralValues = filteredLiteralValues.concat(...literalValues.filter(value => value.language === preferredLanguage).toArray());
      }
    }

    return filteredLiteralValues!.map(literalValue => new ${sharedImports.Resource}.TermValue({ focusResource, predicate, term: literalValue }));
  });
}`,
  ),
};

export namespace AbstractLiteralType {
  export type Conversion = AbstractTermType.Conversion;
  export type DiscriminantProperty = AbstractTermType.DiscriminantProperty;
  export const GraphqlType = AbstractTermType.GraphqlType;
  export type GraphqlType = AbstractTermType.GraphqlType;
  export const JsonType = AbstractTermType.JsonType;
  export type JsonType = AbstractTermType.JsonType;
}
