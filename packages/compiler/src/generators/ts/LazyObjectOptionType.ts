import { Maybe } from "purify-ts";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";
import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import { imports } from "./imports.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

namespace localSnippets {
  export const LazyObjectOption = conditionalOutput(
    `${syntheticNamePrefix}LazyObjectOption`,
    code`\
/**
 * Type of lazy properties that return a single optional object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObjectOption<ObjectIdentifierT extends ${imports.BlankNode} | ${imports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  readonly partial: ${imports.Maybe}<PartialObjectT>;
  private readonly resolver: (identifier: ObjectIdentifierT) => Promise<${imports.Either}<Error, ResolvedObjectT>>;

  constructor({ partial, resolver }: {
    partial: ${imports.Maybe}<PartialObjectT>
    resolver: (identifier: ObjectIdentifierT) => Promise<${imports.Either}<Error, ResolvedObjectT>>,
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  async resolve(): Promise<${imports.Either}<Error, ${imports.Maybe}<ResolvedObjectT>>> {
    if (this.partial.isNothing()) {
      return ${imports.Either}.of(${imports.Maybe}.empty());
    }
    return (await this.resolver(this.partial.unsafeCoerce().${syntheticNamePrefix}identifier)).map(${imports.Maybe}.of);
  }
}`,
  );
}

type Super = AbstractLazyObjectType<
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>,
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>
>;
const Super = AbstractLazyObjectType<
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>,
  OptionType<AbstractLazyObjectType.ObjectTypeConstraint>
>;

export class LazyObjectOptionType extends Super {
  override readonly kind = "LazyObjectOptionType";
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.empty();

  constructor({
    partialType,
    resolvedType,
    ...superParameters
  }: Omit<
    ConstructorParameters<
      typeof AbstractLazyObjectType<
        OptionType<AbstractLazyObjectType.ObjectTypeConstraint>,
        OptionType<AbstractLazyObjectType.ObjectTypeConstraint>
      >
    >[0],
    "runtimeClass"
  >) {
    super({
      ...superParameters,
      partialType,
      resolvedType,
      runtimeClass: {
        name: code`${localSnippets.LazyObjectOption}<${resolvedType.itemType.identifierTypeAlias}, ${partialType.itemType.name}, ${resolvedType.itemType.name}>`,
        partialPropertyName: "partial",
        rawName: code`${localSnippets.LazyObjectOption}`,
      },
    });
  }

  @Memoize()
  override get conversions(): readonly AbstractLazyObjectType.Conversion[] {
    const conversions = super.conversions.concat();

    if (this.partialType.itemType.kind === "ObjectType") {
      conversions.push(
        {
          conversionExpression: (value) =>
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(object => ${(this.partialType.itemType as ObjectType).newExpression({ parameters: code`object` })}), resolver: async () => ${imports.Either}.of((${value} as ${imports.Maybe}<${this.resolvedType.itemType.name}>).unsafeCoerce()) })`,
          sourceTypeCheckExpression: (value) =>
            code`${imports.Maybe}.isMaybe(${value})`,
          sourceTypeName: code`${imports.Maybe}<${this.resolvedType.itemType.name}>`,
          sourceTypeof: "object",
        },
        {
          conversionExpression: (value) =>
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${imports.Maybe}.of(${(this.partialType.itemType as ObjectType).newExpression({ parameters: value })}), resolver: async () => ${imports.Either}.of(${value} as ${this.resolvedType.itemType.name}) })`,
          // Don't check instanceof value since the ObjectUnionType may be an interface
          // Rely on the fact that this will be the last type check on an object
          sourceTypeCheckExpression: (value) =>
            code`typeof ${value} === "object"`,
          sourceTypeName: this.resolvedType.itemType.name,
          sourceTypeof: "object",
        },
      );
    } else if (
      this.resolvedType.itemType.kind === "ObjectUnionType" &&
      this.partialType.itemType.kind === "ObjectUnionType" &&
      this.resolvedType.itemType.memberTypes.length ===
        this.partialType.itemType.memberTypes.length
    ) {
      const maybeMap = `.map(object => { ${this.resolvedObjectUnionTypeToPartialObjectUnionTypeConversion({ resolvedObjectUnionType: this.resolvedType.itemType as ObjectUnionType, partialObjectUnionType: this.partialType.itemType as ObjectUnionType, variables: { resolvedObjectUnion: code`object` } })} })`;

      conversions.push(
        {
          conversionExpression: (value) =>
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}${maybeMap}, resolver: async () => ${imports.Either}.of((${value} as ${imports.Maybe}<${this.resolvedType.itemType.name}>).unsafeCoerce()) })`,
          sourceTypeCheckExpression: (value) =>
            code`${imports.Maybe}.isMaybe(${value})`,
          sourceTypeName: code`${imports.Maybe}<${this.resolvedType.itemType.name}>`,
          sourceTypeof: "object",
        },
        {
          conversionExpression: (value) =>
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${imports.Maybe}.of(${value})${maybeMap}, resolver: async () => ${imports.Either}.of(${value} as ${this.resolvedType.itemType.name}) })`,
          // Don't check instanceof value since the ObjectUnionType may be an interface
          // Rely on the fact that this will be the last type check on an object
          sourceTypeCheckExpression: (value) =>
            code`typeof ${value} === "object"`,
          sourceTypeName: this.resolvedType.itemType.name,
          sourceTypeof: "object",
        },
      );
    }

    conversions.push({
      conversionExpression: () =>
        code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${imports.Maybe}.empty(), resolver: async () => { throw new Error("should never be called"); } })`,
      sourceTypeCheckExpression: (value) =>
        code`typeof ${value} === "undefined"`,
      sourceTypeName: code`undefined`,
      sourceTypeof: "undefined",
    });

    return conversions;
  }

  override fromJsonExpression(
    parameters: Parameters<Super["fromJsonExpression"]>[0],
  ): Code {
    return code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${this.partialType.fromJsonExpression(parameters)}, resolver: (identifier) => Promise.resolve(${imports.Left}(new Error(\`unable to resolve identifier \${${imports.Resource}.Identifier.toString(identifier)} deserialized from JSON\`))) })`;
  }

  override fromRdfExpression(
    parameters: Parameters<Super["fromRdfExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.partialType.fromRdfExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifier) => ${variables.objectSet}.${this.resolvedType.itemType.objectSetMethodNames.object}(identifier) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`${variables.value}.resolve().then(either => either.unsafeCoerce().extractNullable())`;
  }
}
