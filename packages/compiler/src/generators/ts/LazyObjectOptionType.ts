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
  override readonly kind = "LazyObjectOptionType";

  @Memoize()
  override get conversionFunction(): Maybe<AbstractLazyObjectType.ConversionFunction> {
    return Maybe.of({
      code: code`${this.reusables.snippets.convertToLazyObjectOption}<${this.resolveType.itemType.identifierTypeAlias}, ${this.partialType.itemType.name}, ${this.resolveType.itemType.name}>(${this.resolveToPartialFunction({ partialType: this.partialType.itemType, resolveType: this.resolveType.itemType })})`,
      sourceTypes: [
        {
          name: this.name,
          typeof: "object",
        },
        {
          name: this.resolveType.name,
          typeof: "object",
        },
        {
          name: this.resolveType.itemType.name,
          typeof: "object",
        },
        {
          name: "undefined",
          typeof: "undefined",
        },
      ],
    });
  }

  @Memoize()
  protected override get runtimeClass() {
    return {
      name: code`${this.reusables.snippets.LazyObjectOption}<${this.resolveType.itemType.identifierTypeAlias}, ${this.partialType.itemType.name}, ${this.resolveType.itemType.name}>`,
      partialPropertyName: "partial",
      rawName: code`${this.reusables.snippets.LazyObjectOption}`,
    };
  }

  override fromJsonExpression(
    parameters: Parameters<Super["fromJsonExpression"]>[0],
  ): Code {
    return code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${this.partialType.fromJsonExpression(parameters)}, resolver: (identifier) => Promise.resolve(${this.reusables.imports.Left}(new Error(\`unable to resolve identifier \${identifier} deserialized from JSON\`))) })`;
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
