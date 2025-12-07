import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { TsFeature } from "../../enums/TsFeature.js";
import { AbstractType } from "./AbstractType.js";
import { Import } from "./Import.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import type { SetType } from "./SetType.js";

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
    readonly snippetDeclaration: string;
  };
  override readonly discriminatorProperty: AbstractType["discriminatorProperty"] =
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

  override get graphqlName(): Type.GraphqlName {
    return this.resolvedType.graphqlName;
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly string[] {
    return this.partialType.hashStatements({
      depth: depth + 1,
      variables: {
        ...variables,
        value: `${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
  }

  override jsonName(
    parameters?: Parameters<AbstractType["jsonName"]>[0],
  ): Type.JsonName {
    return this.partialType.jsonName(parameters);
  }

  override jsonUiSchemaElement(
    parameters: Parameters<AbstractType["jsonUiSchemaElement"]>[0],
  ): Maybe<string> {
    return this.partialType.jsonUiSchemaElement(parameters);
  }

  override jsonZodSchema(
    parameters: Parameters<AbstractType["jsonZodSchema"]>[0],
  ): string {
    return this.partialType.jsonZodSchema(parameters);
  }

  override get name(): string {
    return this.runtimeClass.name;
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractType["snippetDeclarations"]>[0],
  ): readonly string[] {
    return this.partialType
      .snippetDeclarations(parameters)
      .concat(this.resolvedType.snippetDeclarations(parameters))
      .concat(this.runtimeClass.snippetDeclaration);
  }

  override sparqlConstructTemplateTriples(
    parameters: Parameters<AbstractType["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    return this.partialType.sparqlConstructTemplateTriples(parameters);
  }

  override sparqlWherePatterns(
    parameters: Parameters<AbstractType["sparqlWherePatterns"]>[0],
  ): readonly string[] {
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
        return `${resolvedObjectType.discriminatorPropertyValues.map((discriminatorPropertyValue) => `case "${discriminatorPropertyValue}":`).join("\n")} return ${partialObjectUnionType.memberTypes[objectTypeI].newExpression({ parameters: variables.resolvedObjectUnion })};`;
      },
    );
    caseBlocks.push(
      `default: ${variables.resolvedObjectUnion} satisfies never; throw new Error("unrecognized type");`,
    );
    return `switch (${variables.resolvedObjectUnion}.${resolvedObjectUnionType.discriminatorProperty.unsafeCoerce().name}) { ${caseBlocks.join("\n")} }`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): string {
    return this.partialType.toJsonExpression({
      variables: {
        value: `${variables.value}.${this.runtimeClass.partialPropertyName}`,
      },
    });
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): string {
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
