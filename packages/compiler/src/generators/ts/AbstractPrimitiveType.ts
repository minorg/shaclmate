import type { Literal, NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { arrayOf, type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractPrimitiveType<
  ValueT extends bigint | boolean | Date | string | number,
> extends AbstractLiteralType {
  protected readonly datatype: NamedNode;

  override readonly conversionFunction: Maybe<AbstractLiteralType.ConversionFunction> =
    Maybe.empty();
  override readonly equalsFunction =
    code`${this.reusables.snippets.strictEquals}`;
  abstract override readonly kind:
    | "BigInt"
    | "Boolean"
    | "DateTime"
    | "Date"
    | "Float"
    | "Int"
    | "NumberType"
    | "String";
  readonly primitiveIn: readonly ValueT[];

  constructor({
    datatype,
    primitiveIn,
    ...superParameters
  }: {
    datatype: NamedNode;
    primitiveIn: readonly ValueT[];
  } & ConstructorParameters<typeof AbstractLiteralType>[0]) {
    super(superParameters);
    this.datatype = datatype;
    this.primitiveIn = primitiveIn;
  }

  override get discriminantProperty(): Maybe<AbstractLiteralType.DiscriminantProperty> {
    return Maybe.empty();
  }

  protected override get schemaInitializers() {
    let initializers = super.schemaInitializers;
    if (this.primitiveIn.length > 0) {
      initializers = initializers.concat(
        code`in: ${arrayOf(...this.primitiveIn.map((in_) => this.literalExpression(in_)))}`,
      );
    }
    return initializers;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return code`${this.reusables.imports.Either}.of<Error, ${this.name}>(${variables.value})`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0]): Code {
    return variables.value;
  }

  @Memoize()
  override jsonType(): AbstractLiteralType.JsonType {
    return new AbstractLiteralType.JsonType(this.name);
  }

  abstract override literalExpression(literal: Literal | ValueT): Code;

  override toJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return variables.value;
  }
}

export namespace AbstractPrimitiveType {
  export type ConversionFunction = AbstractLiteralType.ConversionFunction;
  export type DiscriminantProperty = AbstractLiteralType.DiscriminantProperty;
  export const GraphqlType = AbstractLiteralType.GraphqlType;
  export type GraphqlType = AbstractLiteralType.GraphqlType;
  export const JsonType = AbstractLiteralType.JsonType;
  export type JsonType = AbstractLiteralType.JsonType;
}
