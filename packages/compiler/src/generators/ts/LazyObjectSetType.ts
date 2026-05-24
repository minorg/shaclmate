import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { SetType } from "./SetType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class LazyObjectSetType extends AbstractLazyObjectType<
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>,
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>
> {
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.of({
    limit: {
      type: code`${this.reusables.imports.GraphQLInt}`,
    },
    offset: {
      type: code`${this.reusables.imports.GraphQLInt}`,
    },
  });
  override readonly kind = "LazyObjectSet";

  @Memoize()
  override get conversionFunction(): Maybe<AbstractLazyObjectType.ConversionFunction> {
    return Maybe.of({
      code: code`${this.reusables.snippets.convertToLazyObjectSet}<${this.resolveType.itemType.identifierTypeAlias}, ${this.partialType.itemType.name}, ${this.resolveType.itemType.name}>(${this.resolveToPartialFunction({ partialType: this.partialType.itemType, resolveType: this.resolveType.itemType })})`,
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
          name: "undefined",
          typeof: "undefined",
        },
      ],
    });
  }

  protected override get runtimeClass() {
    return {
      name: code`${this.reusables.snippets.LazyObjectSet}<${this.resolveType.itemType.identifierTypeAlias}, ${this.partialType.itemType.name}, ${this.resolveType.itemType.name}>`,
      partialPropertyName: "partials",
      rawName: code`${this.reusables.snippets.LazyObjectSet}`,
    };
  }

  override fromJsonExpression(
    parameters: Parameters<Super["fromJsonExpression"]>[0],
  ): Code {
    return code`${this.partialType.fromJsonExpression(parameters)}.map(partial => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: partial, resolver: () => Promise.resolve(${this.reusables.imports.Left}(new Error("unable to resolve identifiers deserialized from JSON"))) }))`;
  }

  override fromRdfResourceValuesExpression(
    parameters: Parameters<Super["fromRdfResourceValuesExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.partialType.fromRdfResourceValuesExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifiers, options) => ${variables.objectSet}.${this.resolveType.itemType.objectSetMethodNames.objects}({ identifiers, ...options }) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`(${variables.value}.resolve({ limit: ${variables.args}.limit, offset: ${variables.args}.offset })).then(either => either.unsafeCoerce())`;
  }
}

type Super = AbstractLazyObjectType<
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>,
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>
>;
