import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";

import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { type Code, code, joinCode } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import { imports } from "./imports.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import { snippets } from "./snippets.js";
import type { Type } from "./Type.js";

/**
 * Abstract base class for IdentifierType and LiteralType.
 *
 * ConstantTermT is the type of sh:hasValue and sh:in.
 * RuntimeTermT is the type of values at runtime.
 *
 * The two are differentiated because identifiers can have BlankNode or NamedNode values at runtime but only NamedNode values for sh:hasValue and sh:in.
 */
export abstract class AbstractTermType<
  ConstantTermT extends Literal | NamedNode = Literal | NamedNode,
  RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractType {
  readonly equalsFunction = code`${snippets.booleanEquals}`;
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly hasValues: readonly ConstantTermT[];
  readonly in_: readonly ConstantTermT[];
  override readonly mutable: boolean = false;
  readonly nodeKinds: ReadonlySet<RuntimeTermT["termType"]>;
  override readonly typeofs: AbstractType["typeofs"] = NonEmptyList([
    "object" as const,
  ]);

  constructor({
    hasValues,
    in_,
    nodeKinds,
    ...superParameters
  }: {
    hasValues: readonly ConstantTermT[];
    in_: readonly ConstantTermT[];
    nodeKinds: ReadonlySet<RuntimeTermT["termType"]>;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.hasValues = hasValues;
    this.in_ = in_;
    this.nodeKinds = nodeKinds;
    invariant(this.nodeKinds.size > 0, "empty nodeKinds");
  }

  get constrained(): boolean {
    return this.hasValues.length > 0 || this.in_.length > 0;
  }

  @Memoize()
  override get schema(): Code {
    return code`${this.schemaObject}`;
  }

  @Memoize()
  get conversions(): readonly AbstractType.Conversion[] {
    const conversions: AbstractType.Conversion[] = [];

    if (this.nodeKinds.has("Literal")) {
      conversions.push(
        {
          conversionExpression: (value) =>
            code`${snippets.toLiteral}(${value})`,
          sourceTypeCheckExpression: (value) =>
            code`typeof ${value} === "boolean"`,
          sourceTypeName: code`boolean`,
          sourceTypeof: "boolean",
        },
        {
          conversionExpression: (value) =>
            code`${snippets.toLiteral}(${value})`,
          sourceTypeCheckExpression: (value) =>
            code`typeof ${value} === "object" && ${value} instanceof Date`,
          sourceTypeName: code`Date`,
          sourceTypeof: "object",
        },
        {
          conversionExpression: (value) =>
            code`${snippets.toLiteral}(${value})`,
          sourceTypeCheckExpression: (value) =>
            code`typeof ${value} === "number"`,
          sourceTypeName: code`number`,
          sourceTypeof: "number",
        },
        {
          conversionExpression: (value) =>
            code`${snippets.toLiteral}(${value})`,
          sourceTypeCheckExpression: (value) =>
            code`typeof ${value} === "string"`,
          sourceTypeName: code`string`,
          sourceTypeof: "string",
        },
      );
    }

    conversions.push({
      conversionExpression: (value) => value,
      sourceTypeCheckExpression: (value) => code`typeof ${value} === "object"`,
      sourceTypeName: this.name,
      sourceTypeof: "object",
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

  override fromRdfExpression(
    parameters: Parameters<AbstractType["fromRdfExpression"]>[0],
  ): Code {
    // invariant(
    //   this.nodeKinds.has("Literal") &&
    //     (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
    //   "IdentifierType and LiteralType should override",
    // );

    const chain = this.fromRdfExpressionChain(parameters);
    const { variables } = parameters;
    return joinCode(
      [
        variables.resourceValues,
        chain.hasValues,
        chain.languageIn,
        chain.preferredLanguages,
        chain.valueTo,
      ].filter((_) => typeof _ !== "undefined"),
      { on: "." },
    );
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  override hashStatements({
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly Code[] {
    return [
      code`${variables.hasher}.update(${variables.value}.termType);`,
      code`${variables.hasher}.update(${variables.value}.value);`,
    ];
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  override sparqlConstructTriples(): Maybe<Code> {
    return Maybe.empty();
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): Code {
    return code`[${variables.value}]`;
  }

  /**
   * The fromRdfExpression for a term type can be decomposed into multiple sub-expressions with different purposes:
   *
   * hasValues: test whether the values sequence has sh:hasValue values
   * languageIn: filter the values sequence to literals with the right sh:languageIn (or runtime languageIn)
   * valueTo: convert values in the values sequence to the appropriate term type/sub-type (literal, string, etc.)
   *
   * Considering the sub-expressions as a record instead of an array allows them to be selectively overridden by subclasses.
   */
  protected fromRdfExpressionChain({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): {
    hasValues?: Code;
    languageIn?: Code;
    preferredLanguages?: Code;
    valueTo: Code;
  } {
    let valueToExpression = code`${imports.Either}.of<Error, ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode}>(value.toTerm())`;
    if (this.nodeKinds.size < 3) {
      const eitherTypeParameters = `<Error, ${this.name}>`;
      valueToExpression = code`${valueToExpression}.chain(term => {
  switch (term.termType) {
  ${[...this.nodeKinds].map((nodeKind) => `case "${nodeKind}":`).join("\n")} return ${imports.Either}.of${eitherTypeParameters}(term);
  default: return ${imports.Left}${eitherTypeParameters}(new ${imports.Resource}.MistypedTermValueError(${{ actualValue: "term", expectedValueType: this.name, focusResource: variables.resource, predicate: variables.predicate }}));         
}})`;
    }

    return {
      hasValues:
        this.hasValues.length > 0
          ? code`\
chain(values => ${imports.Either}.sequence([${this.hasValues.map(rdfjsTermExpression).join(", ")}].map(hasValue => values.find(value => value.toTerm().equals(hasValue)))).map(() => values))`
          : undefined,
      valueTo: code`chain(values => values.chainMap(value => ${valueToExpression}))`,
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
