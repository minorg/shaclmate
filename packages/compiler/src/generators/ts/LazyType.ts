import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractLazyType } from "./AbstractLazyType.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class LazyType extends AbstractLazyType<
  AbstractLazyType.ItemTypeConstraint,
  AbstractLazyType.ItemTypeConstraint
> {
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.empty();
  override readonly kind = "Lazy";

  @Memoize()
  override get conversionFunction(): Maybe<AbstractLazyType.ConversionFunction> {
    invariant(this.jsTypes.length === 1);
    invariant(this.resolveType.jsTypes.length === 1);

    return Maybe.of({
      code: code`${this.reusables.snippets.convertToLazy}<${this.partialType.expression}, ${this.resolveType.expression}>(${this.resolveToPartialFunction({ partialType: this.partialType, resolveType: this.resolveType })})`,
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

  override fromJsonExpression(
    parameters: Parameters<Super["fromJsonExpression"]>[0],
  ): Code {
    return code`${this.partialType.fromJsonExpression(parameters)}.map(partial => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: partial, resolver: (partial) => Promise.resolve(${this.reusables.imports.Left}(new Error(\`unable to resolve \${partial} deserialized from JSON\`))) }))`;
  }

  // override fromRdfResourceValuesExpression(
  //   parameters: Parameters<Super["fromRdfResourceValuesExpression"]>[0],
  // ): Code {
  //   const { variables } = parameters;
  //   return code`${this.partialType.fromRdfResourceValuesExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (partial, options) => ${variables.objectSet}.${this.resolveType.objectSetMethodNames.object}(partial.${this.configuration.syntheticNamePrefix}identifier(), options) })))`;
  // }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`${variables.value}.resolve().then(either => either.unsafeCoerce())`;
  }
}

type Super = AbstractLazyType<
  AbstractLazyType.ItemTypeConstraint,
  AbstractLazyType.ItemTypeConstraint
>;
