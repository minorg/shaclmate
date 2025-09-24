import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { LiteralType } from "./LiteralType.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { Type } from "./Type.js";
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

  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.empty();
  }

  @Memoize()
  override get jsonName(): Type.JsonName {
    return new Type.JsonName(this.name);
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    return variables.value;
  }

  protected override fromRdfExpressionChain({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): {
    defaultValue?: string;
    hasValues?: string;
    languageIn?: string;
    valueTo?: string;
  } {
    return {
      ...super.fromRdfExpressionChain({ variables }),
      languageIn: undefined,
      valueTo: `chain(values => values.chainMap(value => ${this.fromRdfResourceValueExpression(
        {
          variables: {
            predicate: variables.predicate,
            resource: variables.resource,
            resourceValue: "value",
          },
        },
      )}))`,
    };
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

  override snippetDeclarations({
    features,
  }: Parameters<Type["snippetDeclarations"]>[0]): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.strictEquals);
    }
    return snippetDeclarations;
  }

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    return super.sparqlWherePatterns({ ...parameters, ignoreLanguageIn: true });
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    return variables.value;
  }

  /**
   * Convert an rdfjsResource.Resource.Value to a value of this type.
   * @param variables
   * @protected
   */
  protected abstract fromRdfResourceValueExpression({
    variables,
  }: {
    variables: { predicate: string; resource: string; resourceValue: string };
  }): string;
}
