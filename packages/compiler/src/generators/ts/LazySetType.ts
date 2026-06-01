import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractLazyType } from "./AbstractLazyType.js";
import type { SetType } from "./SetType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class LazySetType extends AbstractLazyType<
  SetType<AbstractLazyType.ItemTypeConstraint>,
  SetType<AbstractLazyType.ItemTypeConstraint>
> {
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.of({
    limit: {
      type: code`${this.reusables.imports.GraphQLInt}`,
    },
    offset: {
      type: code`${this.reusables.imports.GraphQLInt}`,
    },
  });
  override readonly kind = "LazySet";

  @Memoize()
  override get conversionFunction(): Maybe<AbstractLazyType.ConversionFunction> {
    invariant(this.jsTypes.length === 1);
    invariant(this.resolveType.jsTypes.length === 1);

    return Maybe.of({
      code: code`${this.reusables.snippets.convertToLazySet}<${this.partialType.itemType.expression}, ${this.resolveType.itemType.expression}>(${this.resolveToPartialFunction({ partialType: this.partialType.itemType, resolveType: this.resolveType.itemType })})`,
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
          expression: code`undefined`,
          jsType: { typeof: "undefined" },
        },
      ],
    });
  }

  @Memoize()
  protected override get runtimeClass() {
    return {
      name: code`${this.reusables.snippets.LazySet}<${this.partialType.itemType.expression}, ${this.resolveType.itemType.expression}>`,
      partialPropertyName: "partials",
      rawName: code`${this.reusables.snippets.LazySet}`,
    };
  }

  override fromJsonExpression(
    parameters: Parameters<Super["fromJsonExpression"]>[0],
  ): Code {
    return code`${this.partialType.fromJsonExpression(parameters)}.map(partials => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: partials, resolver: () => Promise.resolve(${this.reusables.imports.Left}(new Error("unable to resolve partials deserialized from JSON"))) }))`;
  }

  override fromRdfResourceValuesExpression(
    parameters: Parameters<Super["fromRdfResourceValuesExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.partialType.fromRdfResourceValuesExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (partials, options) => ${variables.objectSet}.${this.resolveType.itemType.objectSetMethodNames.objects}({ identifiers: partials.map(partial => partial.${this.configuration.syntheticNamePrefix}identifier()), ...options }) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`(${variables.value}.resolve({ limit: ${variables.args}.limit, offset: ${variables.args}.offset })).then(either => either.unsafeCoerce())`;
  }
}

type Super = AbstractLazyType<
  SetType<AbstractLazyType.ItemTypeConstraint>,
  SetType<AbstractLazyType.ItemTypeConstraint>
>;
