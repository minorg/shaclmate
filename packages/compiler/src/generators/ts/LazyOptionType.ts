import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractLazyType } from "./AbstractLazyType.js";
import type { OptionType } from "./OptionType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

type Super = AbstractLazyType<
  OptionType<AbstractLazyType.ItemTypeConstraint>,
  OptionType<AbstractLazyType.ItemTypeConstraint>
>;

const Super = AbstractLazyType<
  OptionType<AbstractLazyType.ItemTypeConstraint>,
  OptionType<AbstractLazyType.ItemTypeConstraint>
>;

export class LazyOptionType extends Super {
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.empty();
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
  ${this.partialType.itemType.typeGuardFunction.unsafeCoerce()},
  ${this.resolveToPartialFunction({ partialType: this.partialType.itemType, resolveType: this.resolveType.itemType })}
)`,
      sourceTypes: [
        {
          expression: this.expression,
          jsType: this.jsTypes[0],
        },
        {
          expression: this.partialType.expression,
          jsType: this.partialType.jsTypes[0],
        },
        {
          expression: this.resolveType.expression,
          jsType: this.resolveType.jsTypes[0],
        },
        {
          expression: this.partialType.itemType.expression,
          jsType: this.resolveType.itemType.jsTypes[0],
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

  override fromJsonExpression(
    parameters: Parameters<Super["fromJsonExpression"]>[0],
  ): Code {
    return code`${this.partialType.fromJsonExpression(parameters)}.map(partial => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: partial, resolver: (partial) => Promise.resolve(${this.reusables.imports.Left}(new Error(\`unable to resolve \${partial} deserialized from JSON\`))) }))`;
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return code`\
(
    (
      (values, { objectSet, schema, ...otherOptions }) =>
        ${this.partialType.fromRdfResourceValuesFunction}(values, { ...otherOptions, objectSet, schema: schema.partialType })
          .map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (partial, options) => objectSet.${this.resolveType.itemType.objectSetMethodNames.object}(partial.${this.configuration.syntheticNamePrefix}identifier(), options) })))
    ) satisfies ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}>
)`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`${variables.value}.resolve().then(either => either.unsafeCoerce().extractNullable())`;
  }
}
