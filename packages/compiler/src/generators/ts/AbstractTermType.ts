import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import type { TsFeature } from "enums/TsFeature.js";
import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { objectInitializer } from "./objectInitializer.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { Sparql } from "./Sparql.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";

/**
 * Abstract base class for IdentifierType and LiteralType.
 *
 * ConstantTermT is the type of sh:defaultValue, sh:hasValue, and sh:in.
 * RuntimeTermT is the type of values at runtime.
 *
 * The two are differentiated because identifiers can have BlankNode or NamedNode values at runtime but only NamedNode values for sh:defaultValue et al.
 */
export abstract class AbstractTermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractType {
  readonly defaultValue: Maybe<ConstantTermT>;
  readonly equalsFunction: string = `${syntheticNamePrefix}booleanEquals`;
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly hasValues: readonly ConstantTermT[];
  readonly in_: readonly ConstantTermT[];
  override readonly mutable: boolean = false;
  readonly nodeKinds: ReadonlySet<RuntimeTermT["termType"]>;
  override readonly typeofs: AbstractType["typeofs"] = NonEmptyList([
    "object" as const,
  ]);

  constructor({
    defaultValue,
    hasValues,
    in_,
    nodeKinds,
    ...superParameters
  }: {
    defaultValue: Maybe<ConstantTermT>;
    hasValues: readonly ConstantTermT[];
    in_: readonly ConstantTermT[];
    nodeKinds: ReadonlySet<RuntimeTermT["termType"]>;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.defaultValue = defaultValue;
    this.hasValues = hasValues;
    this.in_ = in_;
    this.nodeKinds = nodeKinds;
    invariant(this.nodeKinds.size > 0, "empty nodeKinds");
  }

  get constrained(): boolean {
    return (
      this.defaultValue.isJust() ||
      this.hasValues.length > 0 ||
      this.in_.length > 0
    );
  }

  @Memoize()
  get conversions(): readonly AbstractType.Conversion[] {
    const conversions: AbstractType.Conversion[] = [];

    if (this.nodeKinds.has("Literal")) {
      conversions.push(
        {
          conversionExpression: (value) =>
            `${syntheticNamePrefix}toLiteral(${value})`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "boolean"`,
          sourceTypeName: "boolean",
        },
        {
          conversionExpression: (value) =>
            `${syntheticNamePrefix}toLiteral(${value})`,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "object" && ${value} instanceof Date`,
          sourceTypeName: "Date",
        },
        {
          conversionExpression: (value) =>
            `${syntheticNamePrefix}toLiteral(${value})`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "number"`,
          sourceTypeName: "number",
        },
        {
          conversionExpression: (value) =>
            `${syntheticNamePrefix}toLiteral(${value})`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "string"`,
          sourceTypeName: "string",
        },
      );
    }

    this.defaultValue.ifJust((defaultValue) => {
      conversions.push({
        conversionExpression: () => rdfjsTermExpression(defaultValue),
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });
    });

    conversions.push({
      conversionExpression: (value) => value,
      sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
      sourceTypeName: this.name,
    });

    return conversions;
  }

  @Memoize()
  override get discriminantProperty(): Maybe<AbstractType.DiscriminantProperty> {
    return Maybe.of({
      name: "termType",
      ownValues: [...this.nodeKinds],
      descendantValues: [],
      type: "string" as const,
    });
  }

  @Memoize()
  override get name(): string {
    return `(${[...this.nodeKinds]
      .map((nodeKind) => `rdfjs.${nodeKind}`)
      .join(" | ")})`;
  }

  protected get schemaObject() {
    return {
      kind: `${JSON.stringify(this.kind)} as const`,
    };
  }

  override fromRdfExpression(
    parameters: Parameters<AbstractType["fromRdfExpression"]>[0],
  ): string {
    // invariant(
    //   this.nodeKinds.has("Literal") &&
    //     (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
    //   "IdentifierType and LiteralType should override",
    // );

    const chain = this.fromRdfExpressionChain(parameters);
    const { variables } = parameters;
    return [
      variables.resourceValues,
      chain.defaultValue,
      chain.hasValues,
      chain.languageIn,
      chain.preferredLanguages,
      chain.valueTo,
    ]
      .filter((_) => typeof _ !== "undefined")
      .join(".");
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractType["graphqlResolveExpression"]>[0],
  ): string {
    throw new Error("not implemented");
  }

  override hashStatements({
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly string[] {
    return [
      `${variables.hasher}.update(${variables.value}.termType);`,
      `${variables.hasher}.update(${variables.value}.value);`,
    ];
  }

  override jsonUiSchemaElement(): Maybe<string> {
    return Maybe.empty();
  }

  override snippetDeclarations({
    features,
  }: Parameters<AbstractType["snippetDeclarations"]>[0]): Readonly<
    Record<string, string>
  > {
    return mergeSnippetDeclarations(
      features.has("equals")
        ? singleEntryRecord(
            `${syntheticNamePrefix}booleanEquals`,
            `\
  /**
   * Compare two objects with equals(other: T): boolean methods and return an ${syntheticNamePrefix}EqualsResult.
   */
  function ${syntheticNamePrefix}booleanEquals<T extends { equals: (other: T) => boolean }>(
    left: T,
    right: T,
  ): ${syntheticNamePrefix}EqualsResult {
    return ${syntheticNamePrefix}EqualsResult.fromBooleanEqualsResult(
      left,
      right,
      left.equals(right),
    );
  }`,
          )
        : {},
      sharedSnippetDeclarations.toLiteral,
    );
  }

  override sparqlConstructTriples(): readonly (Sparql.Triple | string)[] {
    return [];
  }

  override sparqlWherePatterns({
    propertyPatterns,
    variables,
  }: Parameters<
    AbstractType["sparqlWherePatterns"]
  >[0]): readonly Sparql.Pattern[] {
    const requiredPatterns: Sparql.Pattern[] = [
      ...propertyPatterns,
      ...variables.filter
        .map((filterVariable) =>
          this.filterSparqlWherePatterns({
            variables: {
              preferredLanguages: variables.preferredLanguages,
              filter: filterVariable,
              valueVariable: variables.valueVariable,
            },
          }),
        )
        .orDefault([]),
    ];

    return this.defaultValue
      .map(
        () =>
          [
            { patterns: requiredPatterns, type: "optional" },
          ] as Sparql.Pattern[],
      )
      .orDefault(requiredPatterns);
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): string {
    return this.defaultValue
      .map(
        (defaultValue) =>
          `(!${variables.value}.equals(${rdfjsTermExpression(defaultValue)}) ? [${variables.value}] : [])`,
      )
      .orDefault(`[${variables.value}]`);
  }

  override useImports(_object: {
    features: ReadonlySet<TsFeature>;
  }): readonly Import[] {
    return [Import.RDFJS_TYPES];
  }

  /**
   * An array of SPARQL.js WHERE patterns for filtering values of this type.
   *
   * Parameters:
   *   variables: (at runtime)
   *     - filter: an instance of filterType
   *     - preferredLanguages: array of preferred language code (strings)
   *     - valueVariable: rdfjs.Variable of the value of this type
   *     - variablePrefix: prefix to use for new variables
   */
  protected abstract filterSparqlWherePatterns(parameters: {
    variables: {
      preferredLanguages: string;
      filter: string;
      valueVariable: string;
    };
  }): readonly Sparql.Pattern[];

  /**
   * The fromRdfExpression for a term type can be decomposed into multiple sub-expressions with different purposes:
   *
   * defaultValues: add the default value to the values sequence if the latter doesn't contain values already
   * hasValues: test whether the values sequence has sh:hasValue values
   * languageIn: filter the values sequence to literals with the right sh:languageIn (or runtime languageIn)
   * valueTo: convert values in the values sequence to the appropriate term type/sub-type (literal, string, etc.)
   *
   * Considering the sub-expressions as a record instead of an array allows them to be selectively overridden by subclasses.
   */
  protected fromRdfExpressionChain({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): {
    defaultValue?: string;
    hasValues?: string;
    languageIn?: string;
    preferredLanguages?: string;
    valueTo: string;
  } {
    let valueToExpression =
      "purify.Either.of<Error, rdfjs.BlankNode | rdfjs.Literal | rdfjs.NamedNode>(value.toTerm())";
    if (this.nodeKinds.size < 3) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      valueToExpression = `${valueToExpression}.chain(term => {
  switch (term.termType) {
  ${[...this.nodeKinds].map((nodeKind) => `case "${nodeKind}":`).join("\n")} return purify.Either.of${eitherTypeParameters}(term);
  default: return purify.Left${eitherTypeParameters}(new rdfjsResource.Resource.MistypedTermValueError(${objectInitializer({ actualValue: "term", expectedValueType: JSON.stringify(this.name), focusResource: variables.resource, predicate: variables.predicate })}));         
}})`;
    }

    return {
      defaultValue: this.defaultValue
        .map(
          (defaultValue) =>
            `map(values => values.length > 0 ? values : new rdfjsResource.Resource.TermValue(${objectInitializer({ focusResource: variables.resource, predicate: variables.predicate, term: rdfjsTermExpression(defaultValue) })}).toValues())`,
        )
        .extract(),
      hasValues:
        this.hasValues.length > 0
          ? `\
chain(values => purify.Either.sequence([${this.hasValues.map(rdfjsTermExpression).join(", ")}].map(hasValue => values.find(value => value.toTerm().equals(hasValue)))).map(() => values))`
          : undefined,
      valueTo: `chain(values => values.chainMap(value => ${valueToExpression}))`,
    };
  }
}

export namespace AbstractTermType {
  export type Conversion = AbstractType.Conversion;
  export type DiscriminantProperty = AbstractType.DiscriminantProperty;
  export const GraphqlType = AbstractType.GraphqlType;
  export type GraphqlType = AbstractType.GraphqlType;
  export const JsonType = AbstractType.JsonType;
  export type JsonType = AbstractType.JsonType;
}
