import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractLazyType } from "./AbstractLazyType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class LazyType extends AbstractLazyType<
  AbstractLazyType.ItemTypeConstraint,
  AbstractLazyType.ItemTypeConstraint
> {
  protected readonly partialItemType = this.partialType;
  protected readonly resolveItemType = this.resolveType;

  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.empty();
  override readonly kind = "Lazy";

  @Memoize()
  override get conversionFunction(): Maybe<AbstractLazyType.ConversionFunction> {
    invariant(this.jsTypes.length === 1);
    invariant(this.resolveType.jsTypes.length === 1);

    return Maybe.of({
      code: code`\
${this.reusables.snippets.convertToLazy}<
  ${this.partialType.expression},
  ${this.resolveType.expression}
>(
  ${this.resolveToPartialFunction({ partialType: this.partialType, resolveType: this.resolveType })}
)`,
      sourceTypes: [
        {
          expression: this.expression,
          jsType: this.jsTypes[0],
        },
        {
          expression: this.resolveType.expression,
          jsType: this.resolveType.jsTypes[0],
        },
      ],
    });
  }

  @Memoize()
  protected override get runtimeClass() {
    return {
      name: code`${this.reusables.snippets.Lazy}<${this.partialType.expression}, ${this.resolveType.expression}>`,
      partialPropertyName: "partial",
      rawName: code`${this.reusables.snippets.Lazy}`,
    };
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`${variables.value}.resolve().then(either => either.unsafeCoerce())`;
  }

  protected override objectSetResolverFunctionExpressions({
    variables,
  }: {
    variables: { objectSet: Code };
  }): Code {
    return code`(partial, options) => ${variables.objectSet}.${this.resolveItemType.objectSetMethodNames.object}(partial.${this.partialItemType.identifierProperty.unsafeCoerce().name}(), options)`;
  }
}

type Super = AbstractLazyType<
  AbstractLazyType.ItemTypeConstraint,
  AbstractLazyType.ItemTypeConstraint
>;
