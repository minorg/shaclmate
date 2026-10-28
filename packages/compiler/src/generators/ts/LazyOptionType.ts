import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractLazyType } from "./AbstractLazyType.js";
import type { OptionType } from "./OptionType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class LazyOptionType extends AbstractLazyType<
  OptionType<AbstractLazyType.ItemTypeConstraint>,
  OptionType<AbstractLazyType.ItemTypeConstraint>
> {
  protected readonly partialItemType = this.partialType.itemType;
  protected readonly resolveItemType = this.resolveType.itemType;

  override readonly graphqlArgs: AbstractLazyType<
    OptionType<AbstractLazyType.ItemTypeConstraint>,
    OptionType<AbstractLazyType.ItemTypeConstraint>
  >["graphqlArgs"] = Maybe.empty();
  override readonly kind = "LazyOption";

  @Memoize()
  override get conversionFunction(): Maybe<AbstractLazyType.ConversionFunction> {
    invariant(this.jsTypes.length === 1);
    invariant(this.resolveType.jsTypes.length === 1);
    invariant(this.resolveType.itemType.jsTypes.length === 1);

    return Maybe.of({
      code: code`\
${this.reusables.snippets.convertToLazyOption}<
  ${this.partialType.itemType.expression},
  ${this.resolveType.itemType.expression},
>(
  ${this.resolveToPartialFunction({ partialType: this.partialType.itemType, resolveType: this.resolveType.itemType })}
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
        {
          expression: this.resolveType.itemType.expression,
          jsType: this.resolveType.itemType.jsTypes[0],
        },
        {
          expression: code`undefined`,
          jsType: { typeof: "undefined" },
        },
      ],
    });
  }

  @Memoize()
  protected override get runtimeClass() {
    return {
      name: code`${this.reusables.snippets.LazyOption}<${this.partialType.itemType.expression}, ${this.resolveType.itemType.expression}>`,
      partialPropertyName: "partial",
      rawName: code`${this.reusables.snippets.LazyOption}`,
    };
  }

  protected override objectSetResolverFunctionExpressions({
    variables,
  }: {
    variables: { objectSet: Code };
  }): Code {
    return code`(partial, options) => ${variables.objectSet}.${this.resolveItemType.objectSetMethodNames.object}(partial.${this.partialItemType.identifierProperty.unsafeCoerce().name}(), options)`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<
    AbstractLazyType<
      OptionType<AbstractLazyType.ItemTypeConstraint>,
      OptionType<AbstractLazyType.ItemTypeConstraint>
    >["graphqlResolveExpression"]
  >[0]): Code {
    return code`${variables.value}.resolve().then(either => either.unsafeCoerce().extractNullable())`;
  }
}
