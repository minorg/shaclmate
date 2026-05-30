import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

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
  _RuntimeTermT extends BlankNode | Literal | NamedNode =
    | BlankNode
    | Literal
    | NamedNode,
> extends AbstractType {
  override readonly declaration: Maybe<Code> = Maybe.empty();
  readonly equalsFunction = code`${this.reusables.snippets.booleanEquals}`;
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly hasValues: readonly ConstantTermT[];
  override readonly hashFunction = code`${this.reusables.snippets.hashTerm}`;
  readonly in_: readonly ConstantTermT[];
  override readonly mutable: boolean = false;
  abstract readonly nodeKinds: ReadonlySet<NodeKind>;
  override readonly recursive = false;
  override readonly referencesObjectType = false;
  override readonly validationFunction: Maybe<Code> = Maybe.empty();

  constructor({
    hasValues,
    in_,
    ...superParameters
  }: {
    hasValues: readonly ConstantTermT[];
    in_: readonly ConstantTermT[];
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.hasValues = hasValues;
    this.in_ = in_;
  }

  @Memoize()
  override get discriminantProperty(): Maybe<AbstractType.DiscriminantProperty> {
    return Maybe.of({
      jsonName: "termType",
      name: "termType",
      values: [...this.nodeKinds].map(NodeKind.toTermType),
    });
  }

  @Memoize()
  get termTypes(): ReadonlySet<"BlankNode" | "Literal" | "NamedNode"> {
    return new Set([...this.nodeKinds].map(NodeKind.toTermType));
  }

  @Memoize()
  override get toRdfResourceValueTypes() {
    return new Set([...this.nodeKinds].map(NodeKind.toTermType));
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`((_: object) => [])`;
  }

  override fromRdfResourceValuesExpression(
    parameters: Parameters<AbstractType["fromRdfResourceValuesExpression"]>[0],
  ): Code {
    // invariant(
    //   this.nodeKinds.has("Literal") &&
    //     (this.nodeKinds.has("BlankNode") || this.nodeKinds.has("NamedNode")),
    //   "IdentifierType and LiteralType should override",
    // );

    const chain = this.fromRdfResourceValuesExpressionChain(parameters);
    const { variables } = parameters;
    return joinCode(
      [
        variables.resourceValues,
        chain.hasValues,
        chain.languageIn,
        chain.preferredLanguages,
        chain.valueTo,
      ].filter((_) => _ !== undefined),
      { on: "." },
    );
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    return code`[${variables.value}]`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${variables.value}.toString()`;
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
  protected fromRdfResourceValuesExpressionChain({
    variables,
  }: Parameters<Type["fromRdfResourceValuesExpression"]>[0]): {
    hasValues?: Code;
    languageIn?: Code;
    preferredLanguages?: Code;
    valueTo: Code;
  } {
    let valueToExpression: Code;
    if (this.in_.length > 0) {
      valueToExpression = code`value.toTerm([${joinCode(
        this.in_.map((in_) => this.rdfjsTermExpression(in_)),
        { on: ", " },
      )}])`;
    } else if (this.nodeKinds.size < 3) {
      const eitherTypeParameters = code`<Error, ${this.expression}>`;
      valueToExpression = code`value.toTerm().chain(term => {
  switch (term.termType) {
  ${[...this.nodeKinds].map((nodeKind) => `case "${NodeKind.toTermType(nodeKind)}":`).join("\n")} return ${this.reusables.imports.Either}.of${eitherTypeParameters}(term);
  default: return ${this.reusables.imports.Left}${eitherTypeParameters}(new ${this.reusables.imports.Resource}.MistypedTermValueError(${{ actualValue: code`term`, expectedValueType: code`${this.expression}`.toCodeString([]), focusResource: variables.resource, propertyPath: variables.propertyPath }}));
  }})`;
    } else {
      valueToExpression = code`value.toTerm()`;
    }

    return {
      hasValues:
        this.hasValues.length > 0
          ? code`\
chain(values => ${this.reusables.imports.Either}.sequence([${joinCode(
              this.hasValues.map((hasValue) =>
                this.rdfjsTermExpression(hasValue),
              ),
              { on: ", " },
            )}].map(hasValue => values.find(value => value.term.equals(hasValue)))).map(() => values))`
          : undefined,
      valueTo: code`chain(values => values.chainMap(value => ${valueToExpression}))`,
    };
  }
}

export namespace AbstractTermType {
  export type ConversionFunction = AbstractType.ConversionFunction;
  export type DiscriminantProperty = AbstractType.DiscriminantProperty;
  export const GraphqlType = AbstractType.GraphqlType;
  export type GraphqlType = AbstractType.GraphqlType;
  export type JsType = AbstractType.JsType;
  export const JsonType = AbstractType.JsonType;
  export type JsonType = AbstractType.JsonType;
}
