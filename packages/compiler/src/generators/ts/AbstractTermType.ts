import type { BlankNode, Literal, NamedNode } from "@rdfjs/types";
import { NodeKind } from "@shaclmate/shacl-ast";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

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
> extends AbstractType {
  readonly equalsFunction = code`${this.reusables.snippets.booleanEquals}`;
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly hasValues: readonly ConstantTermT[];
  override readonly hashFunction = code`${this.reusables.snippets.hashTerm}`;
  readonly in_: readonly ConstantTermT[];
  override readonly mutable: boolean = false;
  abstract readonly nodeKinds: ReadonlySet<NodeKind>;
  override readonly recursive = false;
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

  get referencesNamedType(): boolean {
    return this.name.isJust();
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

  protected override get schemaInitializers() {
    let initializers = super.schemaInitializers;
    if (this.hasValues.length > 0) {
      initializers = initializers.concat(
        code`hasValues: ${arrayOf(...this.hasValues.map((hasValue) => this.rdfjsTermExpression(hasValue)))}`,
      );
    }
    return initializers;
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
   * An expression that converts a compile-time RDF/JS term into a runtime TypeScript value.
   *
   * For example, a string would be converted to "thestring".
   */
  valueExpression(term: ConstantTermT): Code {
    return this.rdfjsTermExpression(term);
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
