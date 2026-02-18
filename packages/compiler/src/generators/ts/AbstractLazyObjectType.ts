import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export abstract class AbstractLazyObjectType<
  PartialTypeT extends AbstractLazyObjectType.PartialTypeConstraint,
  ResolvedTypeT extends AbstractLazyObjectType.ResolvedTypeConstraint,
> extends AbstractType {
  protected readonly partialType: PartialTypeT;
  protected readonly resolvedType: ResolvedTypeT;
  protected readonly runtimeClass: {
    readonly name: Code;
    readonly partialPropertyName: string;
    readonly rawName: Code;
  };

  override readonly discriminantProperty: AbstractType["discriminantProperty"] =
    Maybe.empty();
  override readonly mutable = false;
  override readonly typeofs = NonEmptyList(["object" as const]);

  constructor({
    partialType,
    resolvedType,
    runtimeClass,
    ...superParameters
  }: {
    partialType: PartialTypeT;
    resolvedType: ResolvedTypeT;
    runtimeClass: AbstractLazyObjectType<
      ResolvedTypeT,
      PartialTypeT
    >["runtimeClass"];
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.partialType = partialType;
    this.resolvedType = resolvedType;
    this.runtimeClass = runtimeClass;
  }

  override get conversions(): readonly AbstractType.Conversion[] {
    return [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object" && ${value} instanceof ${this.runtimeClass.rawName}`,
        sourceTypeName: this.name,
        sourceTypeof: "object",
      } satisfies AbstractType.Conversion,
    ];
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
    return this.resolvedType.graphqlType;
  }

  override get name(): Code {
    return this.runtimeClass.name;
  }

  @Memoize()
  override get schema(): Code {
    return code`${this.schemaObject}`;
  }

  @Memoize()
  override get schemaType(): Code {
    return code`${{
      kind: this.kind,
      partialType: this.partialType.schemaType,
      resolvedType: this.resolvedType.schemaType,
    }}`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`(({ schema, ...otherParameters }) => ${this.partialType.sparqlWherePatternsFunction}({ schema: schema.partial(), ...otherParameters }))`;
  }

  protected override get schemaObject() {
    return {
      ...super.schemaObject,
      partial: code`() => (${this.partialType.schema})`,
      resolved: code`() => (${this.resolvedType.schema})`,
    };
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly Code[] {
    return this.partialType.hashStatements({
      depth: depth + 1,
      variables: {
        ...variables,
        value: code`${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
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

  override jsonZodSchema(
    parameters: Parameters<AbstractType["jsonZodSchema"]>[0],
  ): Code {
    return this.partialType.jsonZodSchema(parameters);
  }

  override sparqlConstructTriples(
    parameters: Parameters<AbstractType["sparqlConstructTriples"]>[0],
  ): Maybe<Code> {
    return this.partialType.sparqlConstructTriples(parameters);
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

  override toRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): Code {
    return this.partialType.toRdfExpression({
      variables: {
        ...variables,
        value: code`${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
  }

  protected resolvedObjectUnionTypeToPartialObjectUnionTypeConversion({
    resolvedObjectUnionType,
    partialObjectUnionType,
    variables,
  }: {
    resolvedObjectUnionType: ObjectUnionType;
    partialObjectUnionType: ObjectUnionType;
    variables: { resolvedObjectUnion: Code };
  }) {
    invariant(
      resolvedObjectUnionType.memberTypes.length ===
        partialObjectUnionType.memberTypes.length,
    );

    const caseBlocks = resolvedObjectUnionType.memberTypes.map(
      (resolvedObjectType, objectTypeI) => {
        return code`${resolvedObjectType.discriminantPropertyValues.map((discriminantPropertyValue) => `case "${discriminantPropertyValue}":`).join("\n")} return ${partialObjectUnionType.memberTypes[objectTypeI].newExpression({ parameters: variables.resolvedObjectUnion })};`;
      },
    );
    caseBlocks.push(
      code`default: ${variables.resolvedObjectUnion} satisfies never; throw new Error("unrecognized type");`,
    );
    return code`switch (${variables.resolvedObjectUnion}.${resolvedObjectUnionType.discriminantProperty.unsafeCoerce().name}) { ${joinCode(caseBlocks)} }`;
  }
}

export namespace AbstractLazyObjectType {
  export type ObjectTypeConstraint = ObjectType | ObjectUnionType;
  export type PartialTypeConstraint =
    | ObjectTypeConstraint
    | OptionType<ObjectTypeConstraint>
    | SetType<ObjectTypeConstraint>;
  export type ResolvedTypeConstraint = PartialTypeConstraint;

  export type Conversion = AbstractType.Conversion;
  export type DiscriminantProperty = AbstractType.DiscriminantProperty;
  export const GraphqlType = AbstractType.GraphqlType;
  export type GraphqlType = AbstractType.GraphqlType;
  export const JsonType = AbstractType.JsonType;
  export type JsonType = AbstractType.JsonType;
}
