import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { TsFeature } from "../../enums/TsFeature.js";
import { AbstractType } from "./AbstractType.js";
import { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";
import type { Sparql } from "./Sparql.js";
import type { Type } from "./Type.js";

export abstract class AbstractLazyObjectType<
  PartialTypeT extends AbstractLazyObjectType.PartialTypeConstraint,
  ResolvedTypeT extends AbstractLazyObjectType.ResolvedTypeConstraint,
> extends AbstractType {
  protected readonly partialType: PartialTypeT;
  protected readonly resolvedType: ResolvedTypeT;
  protected readonly runtimeClass: {
    readonly name: string;
    readonly partialPropertyName: string;
    readonly rawName: string;
    readonly snippetDeclarations: Readonly<Record<string, string>>;
  };
  override readonly discriminantProperty: Type["discriminantProperty"] =
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

  override get conversions(): readonly Type.Conversion[] {
    return [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) =>
          `typeof ${value} === "object" && ${value} instanceof ${this.runtimeClass.rawName}`,
        sourceTypeName: this.name,
      } satisfies Type.Conversion,
    ];
  }

  @Memoize()
  override get equalsFunction(): string {
    return `((left, right) => ${this.partialType.equalsFunction}(left.${this.runtimeClass.partialPropertyName}, right.${this.runtimeClass.partialPropertyName}))`;
  }

  @Memoize()
  get filterFunction(): string {
    return `((filter: ${this.filterType.name}, value: ${this.name}) => ${this.partialType.filterFunction}(filter, value.${this.runtimeClass.partialPropertyName}))`;
  }

  get filterType():
    | Type.CompositeFilterType
    | Type.CompositeFilterTypeReference {
    return this.partialType.filterType;
  }

  override get graphqlType(): Type.GraphqlType {
    return this.resolvedType.graphqlType;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    return this.partialType.hashStatements({
      depth: depth + 1,
      variables: {
        ...variables,
        value: `${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
  }

  override jsonType(
    parameters?: Parameters<Type["jsonType"]>[0],
  ): Type.JsonType {
    return this.partialType.jsonType(parameters);
  }

  override jsonUiSchemaElement(
    parameters: Parameters<Type["jsonUiSchemaElement"]>[0],
  ): Maybe<string> {
    return this.partialType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<Type["jsonZodSchema"]>[0],
  ): string {
    return this.partialType.jsonZodSchema(parameters);
  }

  override get name(): string {
    return this.runtimeClass.name;
  }

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>> {
    return mergeSnippetDeclarations(
      this.partialType.snippetDeclarations(parameters),
      this.resolvedType.snippetDeclarations(parameters),
      this.runtimeClass.snippetDeclarations,
    );
  }

  override sparqlConstructTriples(
    parameters: Parameters<Type["sparqlConstructTriples"]>[0],
  ): readonly string[] {
    return this.partialType.sparqlConstructTriples(parameters);
  }

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0],
  ): readonly Sparql.Pattern[] {
    return this.partialType.sparqlWherePatterns(parameters);
  }

  protected resolvedObjectUnionTypeToPartialObjectUnionTypeConversion({
    resolvedObjectUnionType,
    partialObjectUnionType,
    variables,
  }: {
    resolvedObjectUnionType: ObjectUnionType;
    partialObjectUnionType: ObjectUnionType;
    variables: { resolvedObjectUnion: string };
  }) {
    invariant(
      resolvedObjectUnionType.memberTypes.length ===
        partialObjectUnionType.memberTypes.length,
    );

    const caseBlocks = resolvedObjectUnionType.memberTypes.map(
      (resolvedObjectType, objectTypeI) => {
        return `${resolvedObjectType.discriminantPropertyValues.map((discriminantPropertyValue) => `case "${discriminantPropertyValue}":`).join("\n")} return ${partialObjectUnionType.memberTypes[objectTypeI].newExpression({ parameters: variables.resolvedObjectUnion })};`;
      },
    );
    caseBlocks.push(
      `default: ${variables.resolvedObjectUnion} satisfies never; throw new Error("unrecognized type");`,
    );
    return `switch (${variables.resolvedObjectUnion}.${resolvedObjectUnionType.discriminantProperty.unsafeCoerce().name}) { ${caseBlocks.join("\n")} }`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    return this.partialType.toJsonExpression({
      variables: {
        value: `${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
  }

  override toRdfExpression({
    variables,
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    return this.partialType.toRdfExpression({
      variables: {
        ...variables,
        value: `${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
  }

  override useImports(parameters: {
    features: ReadonlySet<TsFeature>;
  }): readonly Import[] {
    return this.resolvedType.useImports(parameters).concat(Import.PURIFY);
  }
}

export namespace AbstractLazyObjectType {
  export type ObjectTypeConstraint = ObjectType | ObjectUnionType;
  export type PartialTypeConstraint =
    | ObjectTypeConstraint
    | OptionType<ObjectTypeConstraint>
    | SetType<ObjectTypeConstraint>;
  export type ResolvedTypeConstraint = PartialTypeConstraint;
}
