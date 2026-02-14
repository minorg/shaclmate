import { Maybe } from "purify-ts";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";
import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { OptionType } from "./OptionType.js";
import { sharedImports } from "./sharedImports.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

namespace localSnippets {
  export const LazyObjectOption = conditionalOutput(
    `${syntheticNamePrefix}LazyObjectOption`,
    code`\
/**
 * Type of lazy properties that return a single optional object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObjectOption<ObjectIdentifierT extends ${sharedImports.BlankNode} | ${sharedImports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  readonly partial: ${sharedImports.Maybe}<PartialObjectT>;
  private readonly resolver: (identifier: ObjectIdentifierT) => Promise<${sharedImports.Either}<Error, ResolvedObjectT>>;

  constructor({ partial, resolver }: {
    partial: ${sharedImports.Maybe}<PartialObjectT>
    resolver: (identifier: ObjectIdentifierT) => Promise<${sharedImports.Either}<Error, ResolvedObjectT>>,
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  async resolve(): Promise<${sharedImports.Either}<Error, ${sharedImports.Maybe}<ResolvedObjectT>>> {
    if (this.partial.isNothing()) {
      return ${sharedImports.Either}.of(${sharedImports.Maybe}.empty());
    }
    return (await this.resolver(this.partial.unsafeCoerce().${syntheticNamePrefix}identifier)).map(${sharedImports.Maybe}.of);
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
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(object => ${(this.partialType.itemType as ObjectType).newExpression({ parameters: code`object` })}), resolver: async () => ${sharedImports.Either}.of((${value} as ${sharedImports.Maybe}<${this.resolvedType.itemType.name}>).unsafeCoerce()) })`,
          sourceTypeCheckExpression: (value) =>
            code`${sharedImports.Maybe}.isMaybe(${value})`,
          sourceTypeName: code`${sharedImports.Maybe}<${this.resolvedType.itemType.name}>`,
          sourceTypeof: "object",
        },
        {
          conversionExpression: (value) =>
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${sharedImports.Maybe}.of(${(this.partialType.itemType as ObjectType).newExpression({ parameters: value })}), resolver: async () => ${sharedImports.Either}.of(${value} as ${this.resolvedType.itemType.name}) })`,
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
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}${maybeMap}, resolver: async () => ${sharedImports.Either}.of((${value} as ${sharedImports.Maybe}<${this.resolvedType.itemType.name}>).unsafeCoerce()) })`,
          sourceTypeCheckExpression: (value) =>
            code`${sharedImports.Maybe}.isMaybe(${value})`,
          sourceTypeName: code`${sharedImports.Maybe}<${this.resolvedType.itemType.name}>`,
          sourceTypeof: "object",
        },
        {
          conversionExpression: (value) =>
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${sharedImports.Maybe}.of(${value})${maybeMap}, resolver: async () => ${sharedImports.Either}.of(${value} as ${this.resolvedType.itemType.name}) })`,
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
        code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${sharedImports.Maybe}.empty(), resolver: async () => { throw new Error("should never be called"); } })`,
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
    return code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${this.partialType.fromJsonExpression(parameters)}, resolver: (identifier) => Promise.resolve(${sharedImports.Left}(new Error(\`unable to resolve identifier \${${sharedImports.Resource}.Identifier.toString(identifier)} deserialized from JSON\`))) })`;
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
