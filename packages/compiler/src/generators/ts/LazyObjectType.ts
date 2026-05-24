import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class LazyObjectType extends AbstractLazyObjectType<
  AbstractLazyObjectType.ObjectTypeConstraint,
  AbstractLazyObjectType.ObjectTypeConstraint
> {
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.empty();
  override readonly kind = "LazyObject";

  @Memoize()
  override get conversionFunction(): Maybe<AbstractLazyObjectType.ConversionFunction> {
    return Maybe.of({
      code: code`${this.reusables.snippets.convertToLazyObject}<${this.resolveType.identifierTypeAlias}, ${this.partialType.name}, ${this.resolveType.name}>(${this.resolveToPartialFunction({ partialType: this.partialType, resolveType: this.resolveType })})`,
      sourceTypes: [
        {
          name: this.name,
          typeof: "object",
        },
        {
          name: this.resolveType.name,
          typeof: "object",
        },
      ],
    });
  }

  @Memoize()
  protected override get runtimeClass() {
    return {
      name: code`${this.reusables.snippets.LazyObject}<${this.resolveType.identifierTypeAlias}, ${this.partialType.name}, ${this.resolveType.name}>`,
      partialPropertyName: "partial",
      rawName: code`${this.reusables.snippets.LazyObject}`,
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
    return code`${this.partialType.fromRdfResourceValuesExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifier, options) => ${variables.objectSet}.${this.resolveType.objectSetMethodNames.object}(identifier, options) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`${variables.value}.resolve().then(either => either.unsafeCoerce())`;
  }
}

type Super = AbstractLazyObjectType<
  AbstractLazyObjectType.ObjectTypeConstraint,
  AbstractLazyObjectType.ObjectTypeConstraint
>;
