import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import { AnonymousFunction } from "./AnonymousFunction.js";
import type { FunctionLike } from "./FunctionLike.js";
import type { ObjectDiscriminatedUnionType } from "./ObjectDiscriminatedUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export abstract class AbstractLazyType<
  PartialTypeT extends AbstractLazyType.PartialTypeConstraint,
  ResolveTypeT extends AbstractLazyType.ResolveTypeConstraint,
> extends AbstractType {
  readonly partialType: PartialTypeT;
  readonly resolveType: ResolveTypeT;
  protected abstract readonly runtimeClass: {
    readonly name: Code;
    readonly partialPropertyName: string;
    readonly rawName: Code;
  };

  override readonly discriminantProperty: AbstractType["discriminantProperty"] =
    Maybe.empty();
  override readonly mutable = false;
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

  @Memoize()
  override get equalsFunction(): FunctionLike {
    return new AnonymousFunction(
      code`(left, right) => ${this.partialType.equalsFunction.usage}(left.${this.runtimeClass.partialPropertyName}, right.${this.runtimeClass.partialPropertyName})`,
      {
        type: {
          expression: code`${this.reusables.snippets.EqualsFunction}<${this.expression}>`,
        },
      },
    );
  }

  @Memoize()
  get filterFunction(): FunctionLike {
    return new AnonymousFunction(
      code`(filter, value) => ${this.partialType.filterFunction.usage}(filter, value.${this.runtimeClass.partialPropertyName})`,
      {
        type: {
          expression: code`${this.reusables.snippets.FilterFunction}<${this.filterType}, ${this.expression}>`,
        },
      },
    );
  }

  get filterType(): Code {
    return this.partialType.filterType;
  }

  override get graphqlType(): AbstractType.GraphqlType {
    return this.resolveType.graphqlType;
  }

  @Memoize()
  override get hashFunction(): FunctionLike {
    return new AnonymousFunction(
      code`(hasher, value) => ${this.partialType.hashFunction.usage}(hasher, value.${this.runtimeClass.partialPropertyName})`,
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

  get toRdfResourceValueTypes(): AbstractType["toRdfResourceValueTypes"] {
    return this.partialType.toRdfResourceValueTypes;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): FunctionLike {
    return new AnonymousFunction(
      code`(({ schema, ...otherParameters }) => ${this.partialType.valueSparqlConstructTriplesFunction.usage}({ ...otherParameters, schema: schema.partialType }))`,
      {
        type: {
          expression: code`${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}>`,
        },
      },
    );
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): FunctionLike {
    return new AnonymousFunction(
      code`(({ schema, ...otherParameters }) => ${this.partialType.valueSparqlWherePatternsFunction.usage}({ ...otherParameters, schema: schema.partialType }))`,
      {
        type: {
          expression: code`${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>`,
        },
      },
    );
  }

  protected override get schemaInitializers(): readonly Code[] {
    return super.schemaInitializers.concat(
      code`get partialType() { return ${this.partialType.schema}; }`,
    );
  }

  override jsonType(
    parameters: Parameters<AbstractType["jsonType"]>[0],
  ): AbstractType.JsonType {
    return this.partialType.jsonType(parameters);
  }

  override toJsonExpression({
    variables,
    ...parameters
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return this.partialType.toJsonExpression({
      ...parameters,
      variables: {
        value: code`${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
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
