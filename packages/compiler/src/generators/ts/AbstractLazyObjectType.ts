import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export abstract class AbstractLazyObjectType<
  PartialTypeT extends AbstractLazyObjectType.PartialTypeConstraint,
  ResolveTypeT extends AbstractLazyObjectType.ResolveTypeConstraint,
> extends AbstractType {
  protected readonly partialType: PartialTypeT;
  protected readonly resolveType: ResolveTypeT;
  protected abstract readonly runtimeClass: {
    readonly name: Code;
    readonly partialPropertyName: string;
    readonly rawName: Code;
  };

  override readonly declaration: Maybe<Code> = Maybe.empty();
  override readonly discriminantProperty: AbstractType["discriminantProperty"] =
    Maybe.empty();
  override readonly mutable = false;
  override readonly typeofs = ["object" as const];
  override readonly validationFunction: Maybe<Code> = Maybe.empty();

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
  override get equalsFunction(): Code {
    return code`((left, right) => ${this.partialType.equalsFunction}(left.${this.runtimeClass.partialPropertyName}, right.${this.runtimeClass.partialPropertyName}))`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`((filter: ${this.filterType}, value: ${this.name}) => ${this.partialType.filterFunction}(filter, value.${this.runtimeClass.partialPropertyName}))`;
  }

  get filterType(): Code {
    return this.partialType.filterType;
  }

  override get graphqlType(): AbstractType.GraphqlType {
    return this.resolveType.graphqlType;
  }

  @Memoize()
  override get hashFunction(): Code {
    return code`((hasher, value) => ${this.partialType.hashFunction}(hasher, value.${this.runtimeClass.partialPropertyName}))`;
  }

  override get name(): Code {
    return this.runtimeClass.name;
  }

  get recursive(): boolean {
    return this.partialType.recursive;
  }

  @Memoize()
  get schema(): Code {
    return code`{ ${joinCode(
      [
        code`kind: ${super.schemaObject.kind}`,
        code`get partialType() { return ${this.partialType.schema}; }`,
      ],
      { on: ", " },
    )} }`;
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
  override get valueSparqlConstructTriplesFunction(): Code {
    return code`(({ schema, ...otherParameters }) => ${this.partialType.valueSparqlConstructTriplesFunction}({ ...otherParameters, schema: schema.partialType }))`;
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return code`(({ schema, ...otherParameters }) => ${this.partialType.valueSparqlWherePatternsFunction}({ ...otherParameters, schema: schema.partialType }))`;
  }

  // protected override get schemaObject() {
  //   throw new Error("don't call");
  //   return {
  //     ...super.schemaObject,
  //     partial: code`() => (${this.partialType.schema})`,
  //   };
  // }
  override jsonSchema(
    parameters: Parameters<AbstractType["jsonSchema"]>[0],
  ): Code {
    return this.partialType.jsonSchema(parameters);
  }

  override jsonType(
    parameters?: Parameters<AbstractType["jsonType"]>[0],
  ): AbstractType.JsonType {
    return this.partialType.jsonType(parameters);
  }

  override jsonUiSchemaElement(
    parameters: Parameters<AbstractType["jsonUiSchemaElement"]>[0],
  ): Maybe<Code> {
    return this.partialType.jsonUiSchemaElement(parameters);
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return this.partialType.toJsonExpression({
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
    ObjectTypeT extends AbstractLazyObjectType.ObjectTypeConstraint,
  >({
    partialType,
    resolveType,
  }: {
    partialType: ObjectTypeT;
    resolveType: ObjectTypeT;
  }): Code {
    if (partialType.kind === "NamedObjectType") {
      return code`${partialType.name}.createUnsafe`;
    }

    invariant(partialType.kind === "NamedObjectUnion");
    invariant(resolveType.kind === "NamedObjectUnion");

    invariant(partialType.members.length === resolveType.members.length);

    const caseBlocks = resolveType.members.map(
      ({ discriminantValues }, memberI) => {
        return code`${discriminantValues.map((discriminantPropertyValue) => `case "${discriminantPropertyValue}":`).join("\n")} return ${partialType.members[memberI].type.name}.createUnsafe(resolved);`;
      },
    );

    caseBlocks.push(
      code`default: resolved satisfies never; throw new Error("unrecognized type");`,
    );

    return code`((resolved: ${resolveType.name}) => { switch (resolved.${resolveType.discriminantProperty.unsafeCoerce().name}) { ${joinCode(caseBlocks)} } })`;
  }

  protected resolvedNamedObjectUnionTypeToPartialNamedObjectUnionTypeConversion({
    resolvedNamedObjectUnionType,
    partialNamedObjectUnionType,
    variables,
  }: {
    resolvedNamedObjectUnionType: NamedObjectUnionType;
    partialNamedObjectUnionType: NamedObjectUnionType;
    variables: { resolvedObjectUnion: Code };
  }) {
    invariant(
      resolvedNamedObjectUnionType.members.length ===
        partialNamedObjectUnionType.members.length,
    );

    const caseBlocks = resolvedNamedObjectUnionType.members.map(
      ({ discriminantValues }, memberI) => {
        return code`${discriminantValues.map((discriminantPropertyValue) => `case "${discriminantPropertyValue}":`).join("\n")} return ${partialNamedObjectUnionType.members[memberI].type.name}.create(${variables.resolvedObjectUnion});`;
      },
    );
    caseBlocks.push(
      code`default: ${variables.resolvedObjectUnion} satisfies never; throw new Error("unrecognized type");`,
    );
    return code`switch (${variables.resolvedObjectUnion}.${resolvedNamedObjectUnionType.discriminantProperty.unsafeCoerce().name}) { ${joinCode(caseBlocks)} }`;
  }
}

export namespace AbstractLazyObjectType {
  export type ObjectTypeConstraint = NamedObjectType | NamedObjectUnionType;
  export type PartialTypeConstraint =
    | ObjectTypeConstraint
    | OptionType<ObjectTypeConstraint>
    | SetType<ObjectTypeConstraint>;
  export type ResolveTypeConstraint = PartialTypeConstraint;

  export type ConversionFunction = AbstractType.ConversionFunction;
  export type DiscriminantProperty = AbstractType.DiscriminantProperty;
  export const GraphqlType = AbstractType.GraphqlType;
  export type GraphqlType = AbstractType.GraphqlType;
  export const JsonType = AbstractType.JsonType;
  export type JsonType = AbstractType.JsonType;
}
