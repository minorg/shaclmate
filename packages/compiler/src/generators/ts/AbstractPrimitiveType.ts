import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import type { SnippetDeclaration } from "./SnippetDeclaration.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export abstract class AbstractPrimitiveType<
  ValueT extends boolean | Date | string | number,
> extends AbstractLiteralType {
  override readonly equalsFunction: string =
    `${syntheticNamePrefix}strictEquals`;
  readonly primitiveDefaultValue: Maybe<ValueT>;
  readonly primitiveIn: readonly ValueT[];
  abstract override readonly kind:
    | "BooleanType"
    | "DateTimeType"
    | "DateType"
    | "FloatType"
    | "IntType"
    | "NumberType"
    | "StringType";

  constructor({
    primitiveDefaultValue,
    primitiveIn,
    ...superParameters
  }: {
    primitiveDefaultValue: Maybe<ValueT>;
    primitiveIn: readonly ValueT[];
  } & ConstructorParameters<typeof AbstractLiteralType>[0]) {
    super(superParameters);
    this.primitiveDefaultValue = primitiveDefaultValue;
    this.primitiveIn = primitiveIn;
  }

  override get discriminantProperty(): Maybe<AbstractLiteralType.DiscriminantProperty> {
    return Maybe.empty();
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      defaultValue: this.primitiveDefaultValue.map(JSON.stringify).extract(),
      in:
        this.primitiveIn.length > 0
          ? this.primitiveIn.map((_) => JSON.stringify(_)).concat()
          : undefined,
    };
  }

  protected override get schemaTypeObject() {
    return {
      ...super.schemaTypeObject,
      "defaultValue?": this.typeofs[0] as string,
      "in?": `readonly ${this.typeofs[0]}[]`,
    };
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["fromJsonExpression"]>[0]): string {
    return variables.value;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<AbstractLiteralType["graphqlResolveExpression"]>[0]): string {
    return variables.value;
  }

  override hashStatements({
    variables,
  }: Parameters<AbstractLiteralType["hashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value}.toString());`];
  }

  @Memoize()
  override jsonType(): AbstractLiteralType.JsonType {
    return new AbstractLiteralType.JsonType(this.name);
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractLiteralType["snippetDeclarations"]>[0],
  ): Readonly<Record<string, SnippetDeclaration>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),
      parameters.features.has("equals")
        ? sharedSnippetDeclarations.strictEquals
        : {},
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractLiteralType["toJsonExpression"]>[0]): string {
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
