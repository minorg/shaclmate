import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { Callable } from "./Callable.js";
import { InlineCallable } from "./InlineCallable.js";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export abstract class AbstractLazyType<
  PartialTypeT extends AbstractLazyType.PartialTypeConstraint,
  ResolveTypeT extends AbstractLazyType.ResolveTypeConstraint,
> extends AbstractType {
  protected abstract readonly partialItemType: AbstractLazyType.ItemTypeConstraint;
  protected abstract readonly resolveItemType: AbstractLazyType.ItemTypeConstraint;
  protected abstract readonly runtimeClass: {
    readonly name: Code;
    readonly partialPropertyName: string;
    readonly rawName: Code;
  };

  override readonly discriminantProperty: AbstractType["discriminantProperty"] =
    Maybe.empty();
  abstract override readonly kind: "Lazy" | "LazyOption" | "LazySet";
  override readonly mutable = false;
  readonly partialType: PartialTypeT;
  readonly resolveType: ResolveTypeT;
  override readonly validationFunction: AbstractType["validationFunction"] =
    Maybe.empty();

  constructor({
    partialType,
    resolveType,
    ...superParameters
  }: {
    partialType: PartialTypeT;
    resolveType: ResolveTypeT;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.partialType = partialType;
    this.resolveType = resolveType;
  }

  get jsonValueType(): AbstractType["jsonValueType"] {
    return this.partialType.jsonValueType;
  }

  @Memoize()
  override get equalsFunction(): Callable {
    return new InlineCallable(
      code`(left, right) => ${this.partialType.equalsFunction.annotatedUsage}(left.${this.runtimeClass.partialPropertyName}, right.${this.runtimeClass.partialPropertyName})`,
      {
        type: code`${this.reusables.snippets.EqualsFunction}<${this.expression}>`,
      },
    );
  }

  get jsonObjectType(): AbstractType["jsonObjectType"] {
    return this.partialType.jsonObjectType;
  }

  @Memoize()
  get filterFunction(): Callable {
    return new InlineCallable(
      code`(filter, value) => ${this.partialType.filterFunction.annotatedUsage}(filter, value.${this.runtimeClass.partialPropertyName})`,
      {
        type: code`${this.reusables.snippets.FilterFunction}<${this.filterType}, ${this.expression}>`,
      },
    );
  }

  get filterType(): Code {
    return this.partialType.filterType;
  }

  override get fromJsonValueFunction(): AbstractType["fromJsonValueFunction"] {
    return new InlineCallable(
      code`(jsonValue, { ...otherOptions, objectSet, schema }) => ${this.partialType.fromJsonValueFunction.annotatedUsage}(jsonValue, { ...otherOptions, objectSet, schema: schema.partialType })
        .map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: ${this.objectSetResolverFunctionExpressions({ variables: { objectSet: code`objectSet` } })} }))`,
      {
        type: code`${this.reusables.snippets.FromJsonValueFunction}<${this.jsonValueType.expression}, ${this.expression}, ${this.schema}>`,
      },
    );
  }

  override get fromJsonObjectFunction(): AbstractType["fromJsonObjectFunction"] {
    return new InlineCallable(
      code`(jsonObject, { ...otherOptions, objectSet, schema }) => ${this.partialType.fromJsonObjectFunction.annotatedUsage}(jsonObject, { ...otherOptions, objectSet, schema: schema.partialType })
        .map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: ${this.objectSetResolverFunctionExpressions({ variables: { objectSet: code`objectSet` } })} }))`,
      {
        type: code`${this.reusables.snippets.FromJsonObjectFunction}<${this.jsonObjectType.expression}, ${this.expression}, ${this.schema}>`,
      },
    );
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Callable {
    return new InlineCallable(
      code`\
  (values, { objectSet, schema, ...otherOptions }) =>
    ${this.partialType.fromRdfResourceValuesFunction.annotatedUsage}(values, { ...otherOptions, objectSet, schema: schema.partialType })
      .map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: ${this.objectSetResolverFunctionExpressions({ variables: { objectSet: code`objectSet` } })} })))`,
      {
        type: code`${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}>`,
      },
    );
  }

  override get graphqlType(): AbstractType.GraphqlType {
    return this.resolveType.graphqlType;
  }

  @Memoize()
  override get hashFunction(): Callable {
    return new InlineCallable(
      code`(hasher, value) => ${this.partialType.hashFunction.annotatedUsage}(hasher, value.${this.runtimeClass.partialPropertyName})`,
    );
  }

  override get inlineExpression(): Code {
    return this.runtimeClass.name;
  }

  @Memoize()
  override get jsTypes(): readonly AbstractType.JsType[] {
    return [
      {
        className: this.runtimeClass.rawName,
        instanceof: "class",
        typeof: "object",
      },
    ];
  }

  get recursive(): boolean {
    return this.partialType.recursive;
  }

  get referencesNamedType(): boolean {
    return this.partialType.referencesNamedType;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${{
      kind: this.kind,
      partialType: this.partialType.schemaType,
    }}`;
  }

  override get toJsonValueFunction(): AbstractType["toJsonValueFunction"] {
    return new InlineCallable(
      code`(value) => ${this.partialType.toJsonValueFunction.unannotatedUsage}(value.${this.runtimeClass.partialPropertyName})`,
      {
        type: code`${this.reusables.snippets.ToJsonValueFunction}<${this.expression}, ${this.jsonValueType.expression}>`,
      },
    );
  }

  override get toJsonObjectFunction(): AbstractType["toJsonObjectFunction"] {
    return new InlineCallable(
      code`(value) => ${this.partialType.toJsonObjectFunction.unannotatedUsage}(value.${this.runtimeClass.partialPropertyName})`,
      {
        type: code`${this.reusables.snippets.ToJsonObjectFunction}<${this.expression}, ${this.jsonValueType.expression}>`,
      },
    );
  }

  get toRdfResourceValueTypes(): AbstractType["toRdfResourceValueTypes"] {
    return this.partialType.toRdfResourceValueTypes;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Callable {
    return new InlineCallable(
      code`(({ schema, ...otherParameters }) => ${this.partialType.valueSparqlConstructTriplesFunction.annotatedUsage}({ ...otherParameters, schema: schema.partialType }))`,
      {
        type: code`${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}>`,
      },
    );
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Callable {
    return new InlineCallable(
      code`(({ schema, ...otherParameters }) => ${this.partialType.valueSparqlWherePatternsFunction.annotatedUsage}({ ...otherParameters, schema: schema.partialType }))`,
      {
        type: code`${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>`,
      },
    );
  }

  protected override get schemaInitializers(): readonly Code[] {
    return super.schemaInitializers.concat(
      code`get partialType() { return ${this.partialType.schema}; }`,
    );
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractType["toLoggableExpression"]>[0]): Code {
    return this.partialType.toLoggableExpression({
      variables: {
        value: code`${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    return this.partialType.toRdfResourceValuesExpression({
      variables: {
        ...variables,
        value: code`${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return this.partialType.toStringExpression({
      variables: {
        value: code`${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
  }

  protected abstract objectSetResolverFunctionExpressions(parameters: {
    variables: { objectSet: Code };
  }): Code;

  protected resolveToPartialFunction<
    ObjectTypeT extends AbstractLazyType.ItemTypeConstraint,
  >({
    partialType,
    resolveType,
  }: {
    partialType: ObjectTypeT;
    resolveType: ObjectTypeT;
  }): Code {
    if (partialType.kind === "Object") {
      return code`${partialType.name.unsafeCoerce()}.createUnsafe`;
    }

    invariant(partialType.kind === "ObjectDiscriminatedUnion");
    invariant(resolveType.kind === "ObjectDiscriminatedUnion");

    invariant(partialType.members.length === resolveType.members.length);

    const caseBlocks = resolveType.members.map(
      ({ discriminantValues }, memberI) => {
        return code`${discriminantValues.map((discriminantPropertyValue) => `case "${discriminantPropertyValue}":`).join("\n")} return ${partialType.members[memberI].type.name.unsafeCoerce()}.createUnsafe(resolved);`;
      },
    );

    caseBlocks.push(
      code`default: resolved satisfies never; throw new Error("unrecognized type");`,
    );

    return code`((resolved: ${resolveType.expression}) => { switch (resolved.${resolveType.discriminantProperty.unsafeCoerce().name}) { ${joinCode(caseBlocks)} } })`;
  }

  protected resolvedObjectDiscriminatedUnionTypeToPartialObjectDiscriminatedUnionTypeConversion({
    resolvedObjectDiscriminatedUnionType,
    partialObjectDiscriminatedUnionType,
    variables,
  }: {
    resolvedObjectDiscriminatedUnionType: ObjectDiscriminatedUnionType;
    partialObjectDiscriminatedUnionType: ObjectDiscriminatedUnionType;
    variables: { resolvedObjectDiscriminatedUnion: Code };
  }) {
    invariant(
      resolvedObjectDiscriminatedUnionType.members.length ===
        partialObjectDiscriminatedUnionType.members.length,
    );

    const caseBlocks = resolvedObjectDiscriminatedUnionType.members.map(
      ({ discriminantValues }, memberI) => {
        return code`${discriminantValues.map((discriminantPropertyValue) => `case "${discriminantPropertyValue}":`).join("\n")} return ${partialObjectDiscriminatedUnionType.members[memberI].type.name.unsafeCoerce()}.create(${variables.resolvedObjectDiscriminatedUnion});`;
      },
    );
    caseBlocks.push(
      code`default: ${variables.resolvedObjectDiscriminatedUnion} satisfies never; throw new Error("unrecognized type");`,
    );
    return code`switch (${variables.resolvedObjectDiscriminatedUnion}.${resolvedObjectDiscriminatedUnionType.discriminantProperty.unsafeCoerce().name}) { ${joinCode(caseBlocks)} }`;
  }
}

export namespace AbstractLazyType {
  export type ItemTypeConstraint = ObjectType | ObjectDiscriminatedUnionType;
  export type PartialTypeConstraint =
    | ItemTypeConstraint
    | OptionType<ItemTypeConstraint>
    | SetType<ItemTypeConstraint>;
  export type ResolveTypeConstraint = PartialTypeConstraint;

  export type ConversionFunction = AbstractType.ConversionFunction;
  export type DiscriminantProperty = AbstractType.DiscriminantProperty;
  export const GraphqlType = AbstractType.GraphqlType;
  export type GraphqlType = AbstractType.GraphqlType;
  export type JsonType = AbstractType.JsonType;
}
