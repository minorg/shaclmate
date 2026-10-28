import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractLazyType } from "./AbstractLazyType.js";
import type { Callable } from "./Callable.js";
import { InlineCallable } from "./InlineCallable.js";
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

  override get fromCompactedJsonFunction(): AbstractLazyType<
    AbstractLazyType.ItemTypeConstraint,
    AbstractLazyType.ItemTypeConstraint
  >["fromCompactedJsonFunction"] {
    return new InlineCallable(
      code`(compactedJson, { ...otherOptions, objectSet, schema: schema.partialType }) => ${this.partialType.fromCompactedJsonFunction.annotatedUsage}(compactedJson, { ...otherOptions, objectSet, schema: schema.partialType })
        .map(partial => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: partial, resolver: (partial, options) => objectSet.${this.resolveType.objectSetMethodNames.object}(partial.${this.partialType.identifierProperty.unsafeCoerce().name}(), options) }))`,
      {
        type: code`${this.reusables.snippets.FromCompactedJsonFunction}<${this.compactedJsonType.expression}, ${this.expression}, ${this.schema}>`,
      },
    );
  }

  override get fromExpandedJsonFunction(): AbstractLazyType<
    AbstractLazyType.ItemTypeConstraint,
    AbstractLazyType.ItemTypeConstraint
  >["fromExpandedJsonFunction"] {
    return new InlineCallable(
      code`(expandedJson, { ...otherOptions, objectSet, schema: schema.partialType }) => ${this.partialType.fromExpandedJsonFunction.annotatedUsage}(expandedJson, { ...otherOptions, objectSet, schema: schema.partialType })
        .map(partial => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: partial, resolver: (partial, options) => objectSet.${this.resolveType.objectSetMethodNames.object}(partial.${this.partialType.identifierProperty.unsafeCoerce().name}(), options) }))`,
      {
        type: code`${this.reusables.snippets.FromExpandedJsonFunction}<${this.expandedJsonType.expression}, ${this.expression}, ${this.schema}>`,
      },
    );
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Callable {
    return new InlineCallable(
      code`\
(values, { objectSet, schema, ...otherOptions }) =>
  ${this.partialType.fromRdfResourceValuesFunction.annotatedUsage}(values, { ...otherOptions, objectSet, schema: schema.partialType })
    .map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (partial, options) => objectSet.${this.resolveType.objectSetMethodNames.object}(partial.${this.partialType.identifierProperty.unsafeCoerce().name}(), options) })))`,
      {
        type: code`${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}>`,
      },
    );
  }

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
