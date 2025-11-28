import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import { SnippetDeclarations } from "./SnippetDeclarations.js";
import type { Type } from "./Type.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class LazyObjectOptionType<
  PartialTypeT extends OptionType<ObjectType | ObjectUnionType>,
  ResolvedTypeT extends OptionType<ObjectType | ObjectUnionType>,
> extends AbstractLazyObjectType<PartialTypeT, ResolvedTypeT> {
  override readonly graphqlArgs: Type["graphqlArgs"] = Maybe.empty();

  constructor({
    partialType,
    resolvedType,
  }: Omit<
    ConstructorParameters<
      typeof AbstractLazyObjectType<PartialTypeT, ResolvedTypeT>
    >[0],
    "runtimeClass"
  >) {
    super({
      partialType,
      resolvedType,
      runtimeClass: {
        name: `${syntheticNamePrefix}LazyObjectOption<${resolvedType.itemType.identifierTypeAlias}, ${partialType.itemType.name}, ${resolvedType.itemType.name}>`,
        partialPropertyName: "partial",
        rawName: `${syntheticNamePrefix}LazyObjectOption`,
        snippetDeclaration: SnippetDeclarations.LazyObjectOption,
      },
    });
  }

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    const conversions = super.conversions.concat();

    if (this.partialType.itemType.kind === "ObjectType") {
      conversions.push(
        {
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(object => ${(this.partialType.itemType as ObjectType).newExpression({ parameters: "object" })}), resolver: async () => purify.Either.of((${value} as purify.Maybe<${this.resolvedType.itemType.name}>).unsafeCoerce()) })`,
          sourceTypeCheckExpression: (value) =>
            `purify.Maybe.isMaybe(${value})`,
          sourceTypeName: `purify.Maybe<${this.resolvedType.itemType.name}>`,
        },
        {
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: purify.Maybe.of(${(this.partialType.itemType as ObjectType).newExpression({ parameters: value })}), resolver: async () => purify.Either.of(${value} as ${this.resolvedType.itemType.name}) })`,
          // Don't check instanceof value since the ObjectUnionType may be an interface
          // Rely on the fact that this will be the last type check on an object
          sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
          sourceTypeName: this.resolvedType.itemType.name,
        },
      );
    } else if (
      this.resolvedType.itemType.kind === "ObjectUnionType" &&
      this.partialType.itemType.kind === "ObjectUnionType" &&
      this.resolvedType.itemType.memberTypes.length ===
        this.partialType.itemType.memberTypes.length
    ) {
      const maybeMap = `.map(object => { ${this.resolvedObjectUnionTypeToPartialObjectUnionTypeConversion({ resolvedObjectUnionType: this.resolvedType.itemType as ObjectUnionType, partialObjectUnionType: this.partialType.itemType as ObjectUnionType, variables: { resolvedObjectUnion: "object" } })} })`;

      conversions.push(
        {
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}${maybeMap}, resolver: async () => purify.Either.of((${value} as purify.Maybe<${this.resolvedType.itemType.name}>).unsafeCoerce()) })`,
          sourceTypeCheckExpression: (value) =>
            `purify.Maybe.isMaybe(${value})`,
          sourceTypeName: `purify.Maybe<${this.resolvedType.itemType.name}>`,
        },
        {
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: purify.Maybe.of(${value})${maybeMap}, resolver: async () => purify.Either.of(${value} as ${this.resolvedType.itemType.name}) })`,
          // Don't check instanceof value since the ObjectUnionType may be an interface
          // Rely on the fact that this will be the last type check on an object
          sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
          sourceTypeName: this.resolvedType.itemType.name,
        },
      );
    }

    conversions.push({
      conversionExpression: () =>
        `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: purify.Maybe.empty(), resolver: async () => { throw new Error("should never be called"); } })`,
      sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
      sourceTypeName: "undefined",
    });

    return conversions;
  }

  override fromJsonExpression(
    parameters: Parameters<Type["fromJsonExpression"]>[0],
  ): string {
    return `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${this.partialType.fromJsonExpression(parameters)}, resolver: (identifier) => Promise.resolve(purify.Left(new Error(\`unable to resolve identifier \${rdfjsResource.Resource.Identifier.toString(identifier)} deserialized from JSON\`))) })`;
  }

  override fromRdfExpression(
    parameters: Parameters<Type["fromRdfExpression"]>[0],
  ): string {
    const { variables } = parameters;
    return `${this.partialType.fromRdfExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifier) => ${variables.objectSet}.${this.resolvedType.itemType.objectSetMethodNames.object}(identifier) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Type["graphqlResolveExpression"]>[0]): string {
    return `(await ${variables.value}.resolve()).unsafeCoerce().extractNullable()`;
  }
}
