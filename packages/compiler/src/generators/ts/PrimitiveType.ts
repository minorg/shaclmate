import { Maybe } from "purify-ts";
import type { TsFeature } from "../../enums/index.js";
import { LiteralType } from "./LiteralType.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import type { Type } from "./Type.js";

export abstract class PrimitiveType<
  ValueT extends boolean | Date | string | number,
> extends LiteralType {
  override readonly equalsFunction: string = "$strictEquals";
  readonly primitiveDefaultValue: Maybe<ValueT>;
  readonly primitiveIn: readonly ValueT[];

  constructor({
    primitiveDefaultValue,
    primitiveIn,
    ...superParameters
  }: {
    primitiveDefaultValue: Maybe<ValueT>;
    primitiveIn: readonly ValueT[];
  } & ConstructorParameters<typeof LiteralType>[0]) {
    super(superParameters);
    this.primitiveDefaultValue = primitiveDefaultValue;
    this.primitiveIn = primitiveIn;
  }

  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.empty();
  }

  override get jsonName(): string {
    return this.name;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    return variables.value;
  }

  override hashStatements({
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value}.toString());`];
  }

  override snippetDeclarations(features: Set<TsFeature>): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.strictEquals);
    }
    return snippetDeclarations;
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    return variables.value;
  }

  protected override propertyFilterRdfResourceValuesExpression({
    variables,
  }: Parameters<
    LiteralType["propertyFilterRdfResourceValuesExpression"]
  >[0]): string {
    return variables.resourceValues;
  }
}
