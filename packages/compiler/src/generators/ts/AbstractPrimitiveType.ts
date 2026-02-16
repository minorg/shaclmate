import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { snippets } from "./snippets.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export abstract class AbstractPrimitiveType<
  ValueT extends boolean | Date | string | number,
> extends AbstractLiteralType {
  override readonly equalsFunction = code`${snippets.strictEquals}`;
  abstract override readonly kind:
    | "BooleanType"
    | "DateTimeType"
    | "DateType"
    | "FloatType"
    | "IntType"
    | "NumberType"
    | "StringType";
  readonly primitiveIn: readonly ValueT[];

  constructor({
    primitiveIn,
    ...superParameters
  }: {
    primitiveIn: readonly ValueT[];
  } & ConstructorParameters<typeof AbstractLiteralType>[0]) {
    super(superParameters);
    this.primitiveIn = primitiveIn;
  }

  @Memoize()
  override get conversions(): readonly AbstractPrimitiveType.Conversion[] {
    return [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "${this.typeofs[0]}"`,
        sourceTypeName: this.name,
        sourceTypeof: this.typeofs[0],
      },
    ];
  }

  override get discriminantProperty(): Maybe<AbstractLiteralType.DiscriminantProperty> {
    return Maybe.empty();
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): Code {
    return variables.value;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0]): Code {
    return variables.value;
  }

  override hashStatements({
    variables,
  }: Parameters<AbstractLiteralType["hashStatements"]>[0]): readonly Code[] {
    return [code`${variables.hasher}.update(${variables.value}.toString());`];
  }

  @Memoize()
  override jsonType(): AbstractLiteralType.JsonType {
    return new AbstractLiteralType.JsonType(this.name);
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): Code {
    return variables.value;
  }
}

export namespace AbstractPrimitiveType {
  export type Conversion = AbstractLiteralType.Conversion;
  export type DiscriminantProperty = AbstractLiteralType.DiscriminantProperty;
  export const GraphqlType = AbstractLiteralType.GraphqlType;
  export type GraphqlType = AbstractLiteralType.GraphqlType;
  export const JsonType = AbstractLiteralType.JsonType;
  export type JsonType = AbstractLiteralType.JsonType;
}
