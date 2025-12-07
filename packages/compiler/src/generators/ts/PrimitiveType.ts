import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import { LiteralType } from "./LiteralType.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export abstract class PrimitiveType<
  ValueT extends boolean | Date | string | number,
> extends LiteralType {
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
  } & ConstructorParameters<typeof LiteralType>[0]) {
    super(superParameters);
    this.primitiveDefaultValue = primitiveDefaultValue;
    this.primitiveIn = primitiveIn;
  }

  override get discriminatorProperty(): Maybe<AbstractType.DiscriminatorProperty> {
    return Maybe.empty();
  }

  @Memoize()
  override jsonName(): AbstractType.JsonName {
    return new AbstractType.JsonName(this.name);
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): string {
    return variables.value;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<AbstractType["graphqlResolveExpression"]>[0]): string {
    return variables.value;
  }

  override hashStatements({
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly string[] {
    return [`${variables.hasher}.update(${variables.value}.toString());`];
  }

  override snippetDeclarations({
    features,
  }: Parameters<AbstractType["snippetDeclarations"]>[0]): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.strictEquals);
    }
    return snippetDeclarations;
  }

  override sparqlWherePatterns(
    parameters: Parameters<LiteralType["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    return super.sparqlWherePatterns({
      ...parameters,
      ignoreLiteralLanguage: parameters.ignoreLiteralLanguage ?? true,
    });
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): string {
    return variables.value;
  }
}
