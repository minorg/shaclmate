import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractBuiltinType } from "./AbstractBuiltinType.js";
import { BuiltinCallable } from "./BuiltinCallable.js";
import type { Callable } from "./Callable.js";
import { InlineCallable } from "./InlineCallable.js";
import { SchemaObject } from "./SchemaObject.js";
import { arrayOf, type Code, code, literalOf } from "./ts-poet-wrapper.js";

/**
 * Abstract base class for all types that are terms in RDF (i.e., identifiers, literals).
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
> extends AbstractBuiltinType {
  readonly equalsFunction = new BuiltinCallable(
    this.reusables.snippets.booleanEquals,
  );
  override readonly graphqlArgs: AbstractBuiltinType["graphqlArgs"] =
    Maybe.empty();
  readonly hasValues: readonly ConstantTermT[];
  override readonly hashFunction = new BuiltinCallable(
    this.reusables.snippets.hashTerm,
  );
  readonly in_: readonly ConstantTermT[];
  override readonly mutable: boolean = false;
  abstract readonly nodeKinds: ReadonlySet<NodeKind>;
  override readonly recursive = false;
  override readonly validationFunction: AbstractBuiltinType["validationFunction"] =
    Maybe.empty();

  constructor({
    hasValues,
    in_,
    ...superParameters
  }: {
    hasValues: readonly ConstantTermT[];
    in_: readonly ConstantTermT[];
  } & ConstructorParameters<typeof AbstractBuiltinType>[0]) {
    super(superParameters);
    this.hasValues = hasValues;
    this.in_ = in_;
  }

  get referencesNamedType(): boolean {
    return this.name.isJust();
  }

  @Memoize()
  get termTypes(): ReadonlySet<"BlankNode" | "Literal" | "NamedNode"> {
    return new Set([...this.nodeKinds].map(NodeKind.toTermType));
  }

  @Memoize()
  override get toRdfResourceValueTypes() {
    return this.termTypes;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Callable {
    return new InlineCallable(code`((_: object) => [])`);
  }

  @Memoize()
  override get schema(): SchemaObject<SchemaObject.BuiltinType> {
    const properties: Code[] = [code`kind: ${literalOf(this.kind)} as const`];

    if (this.hasValues.length > 0) {
      properties.push(
        code`hasValues: ${arrayOf(...this.hasValues.map((hasValue) => this.rdfjsTermExpression(hasValue)))}`,
      );
    }

    if (this.in_.length > 0) {
      properties.push(
        code`in: ${arrayOf(...this.in_.map((in_) => this.valueExpression(in_)))} as const`,
      );
    }

    return new SchemaObject({
      properties,
      type: new SchemaObject.BuiltinType(
        code`${this.reusables.snippets.TermSchema}<${this.expression}>`,
      ),
      variable: Maybe.empty(),
    });
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<
    AbstractBuiltinType["toRdfResourceValuesExpression"]
  >[0]): Code {
    return code`[${variables.value}]`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractBuiltinType["toStringExpression"]>[0]): Code {
    return code`${variables.value}.toString()`;
  }

  /**
   * An expression that converts a compile-time RDF/JS term into a runtime TypeScript value.
   *
   * For example, a string would be converted to "thestring".
   */
  valueExpression(term: ConstantTermT): Code {
    return this.rdfjsTermExpression(term);
  }
}

export namespace AbstractTermType {
  export type ConversionFunction = AbstractBuiltinType.ConversionFunction;
  export type DiscriminatedType = AbstractBuiltinType.DiscriminatedType;
  export const GraphqlType = AbstractBuiltinType.GraphqlType;
  export type GraphqlType = AbstractBuiltinType.GraphqlType;
  export type JsType = AbstractBuiltinType.JsType;
  export type JsonType = AbstractBuiltinType.JsonType;
}
