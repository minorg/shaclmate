import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { SetType } from "./SetType.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";

export class LazyObjectSetType extends AbstractLazyObjectType<
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>,
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>
> {
  override readonly graphqlArgs: Type["graphqlArgs"] = Maybe.of({
    limit: {
      type: "graphql.GraphQLInt",
    },
    offset: {
      type: "graphql.GraphQLInt",
    },
  });

  constructor({
    partialType,
    resolvedType,
    ...superParameters
  }: Omit<
    ConstructorParameters<
      typeof AbstractLazyObjectType<
        SetType<AbstractLazyObjectType.ObjectTypeConstraint>,
        SetType<AbstractLazyObjectType.ObjectTypeConstraint>
      >
    >[0],
    "runtimeClass"
  >) {
    super({
      ...superParameters,
      partialType,
      resolvedType,
      runtimeClass: {
        name: `${syntheticNamePrefix}LazyObjectSet<${resolvedType.itemType.identifierTypeAlias}, ${partialType.itemType.name}, ${resolvedType.itemType.name}>`,
        partialPropertyName: "partials",
        rawName: `${syntheticNamePrefix}LazyObjectSet`,
        snippetDeclaration: SnippetDeclarations.LazyObjectSet,
      },
    });
  }

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions = super.conversions.concat();

    if (this.partialType.itemType.kind === "ObjectType") {
      conversions.push({
        conversionExpression: (value) =>
          `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(object => ${(this.partialType.itemType as ObjectType).newExpression({ parameters: "object" })}), resolver: async () => purify.Either.of(${value} as readonly ${this.resolvedType.itemType.name}[]) })`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
        sourceTypeName: `readonly ${this.resolvedType.itemType.name}[]`,
      });
    } else if (
      this.resolvedType.itemType.kind === "ObjectUnionType" &&
      this.partialType.itemType.kind === "ObjectUnionType" &&
      this.resolvedType.itemType.memberTypes.length ===
        this.partialType.itemType.memberTypes.length
    ) {
      conversions.push({
        conversionExpression: (value) =>
          `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(object => { ${this.resolvedObjectUnionTypeToPartialObjectUnionTypeConversion({ resolvedObjectUnionType: this.resolvedType.itemType as ObjectUnionType, partialObjectUnionType: this.partialType.itemType as ObjectUnionType, variables: { resolvedObjectUnion: "object" } })} }), resolver: async () => purify.Either.of(${value} as readonly ${this.resolvedType.itemType.name}[]) })`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
        sourceTypeName: `readonly ${this.resolvedType.itemType.name}[]`,
      });
    }

    conversions.push({
      conversionExpression: () =>
        `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: [], resolver: async () => { throw new Error("should never be called"); } })`,
      sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
      sourceTypeName: "undefined",
    });

    return conversions;
  }

  override fromJsonExpression(
    parameters: Parameters<Type["fromJsonExpression"]>[0],
  ): string {
    return `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${this.partialType.fromJsonExpression(parameters)}, resolver: () => Promise.resolve(purify.Left(new Error("unable to resolve identifiers deserialized from JSON"))) })`;
  }

  override fromRdfExpression(
    parameters: Parameters<Type["fromRdfExpression"]>[0],
  ): string {
    const { variables } = parameters;
    return `${this.partialType.fromRdfExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifiers) => ${variables.objectSet}.${this.resolvedType.itemType.objectSetMethodNames.objects}({ where: { identifiers, type: "identifiers" } }) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Type["graphqlResolveExpression"]>[0]): string {
    return `(${variables.value}.resolve({ limit: ${variables.args}.limit, offset: ${variables.args}.offset })).then(either => either.unsafeCoerce())`;
  }
}
