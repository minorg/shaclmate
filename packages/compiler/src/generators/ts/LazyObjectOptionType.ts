import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { OptionType } from "./OptionType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

type Super = AbstractLazyObjectType<
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>,
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>
>;

const Super = AbstractLazyObjectType<
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>,
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>
>;

export class LazyObjectOptionType extends Super {
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.empty();
  override readonly kind = "LazyObjectOption";

  @Memoize()
  override get conversionFunction(): Maybe<AbstractLazyObjectType.ConversionFunction> {
    return Maybe.of({
      code: code`${this.reusables.snippets.convertToLazyObjectOption}<${this.resolveType.itemType.identifierTypeAlias}, ${this.partialType.itemType.expression}, ${this.resolveType.itemType.expression}>(${this.resolveToPartialFunction({ partialType: this.partialType.itemType, resolveType: this.resolveType.itemType })})`,
      sourceTypes: [
        {
          expression: this.expression,
          typeof: "object",
        },
        {
          expression: this.resolveType.expression,
          typeof: "object",
        },
        {
          expression: this.resolveType.itemType.expression,
          typeof: "object",
        },
        {
          expression: code`undefined`,
          typeof: "undefined",
        },
      ],
    });
  }

  @Memoize()
  protected override get runtimeClass() {
    return {
      name: code`${this.reusables.snippets.LazyObjectOption}<${this.resolveType.itemType.identifierTypeAlias}, ${this.partialType.itemType.expression}, ${this.resolveType.itemType.expression}>`,
      partialPropertyName: "partial",
      rawName: code`${this.reusables.snippets.LazyObjectOption}`,
    };
  }

  override fromJsonExpression(
    parameters: Parameters<Super["fromJsonExpression"]>[0],
  ): Code {
    return code`${this.partialType.fromJsonExpression(parameters)}.map(partial => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: partial, resolver: (identifier) => Promise.resolve(${this.reusables.imports.Left}(new Error(\`unable to resolve identifier \${identifier} deserialized from JSON\`))) }))`;
  }

  override fromRdfResourceValuesExpression(
    parameters: Parameters<Super["fromRdfResourceValuesExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.partialType.fromRdfResourceValuesExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifier, options) => ${variables.objectSet}.${this.resolveType.itemType.objectSetMethodNames.object}(identifier, options) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`${variables.value}.resolve().then(either => either.unsafeCoerce().extractNullable())`;
  }
}
