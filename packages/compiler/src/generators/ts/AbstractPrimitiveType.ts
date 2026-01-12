import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractLiteralType } from "./AbstractLiteralType.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { sharedSnippetDeclarations } from "./sharedSnippetDeclarations.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { Type } from "./Type.js";

export abstract class AbstractPrimitiveType<
  ValueT extends boolean | Date | string | number,
> extends AbstractLiteralType {
  override readonly equalsFunction: string =
    `${syntheticNamePrefix}strictEquals`;
  readonly primitiveDefaultValue: Maybe<ValueT>;
  readonly primitiveIn: readonly ValueT[];

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

  override get discriminantProperty(): Maybe<Type.DiscriminantProperty> {
    return Maybe.empty();
  }

  @Memoize()
  override jsonType(): Type.JsonType {
    return new Type.JsonType(this.name);
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    return variables.value;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Type["graphqlResolveExpression"]>[0]): string {
    return variables.value;
  }

  override hashStatements({
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value}.toString());`];
  }

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>> {
    return mergeSnippetDeclarations(
      super.snippetDeclarations(parameters),
      parameters.features.has("equals")
        ? sharedSnippetDeclarations.strictEquals
        : {},
    );
  }

  override sparqlWherePropertyPatterns(
    parameters: Parameters<
      AbstractLiteralType["sparqlWherePropertyPatterns"]
    >[0],
  ): readonly string[] {
    return super.sparqlWherePropertyPatterns({
      ...parameters,
      ignoreLiteralLanguage: parameters.ignoreLiteralLanguage ?? true,
    });
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    return variables.value;
  }
}
