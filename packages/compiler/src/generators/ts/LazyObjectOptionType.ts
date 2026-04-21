import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import { imports } from "./imports.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import type { OptionType } from "./OptionType.js";
import { snippets } from "./snippets.js";
import { type Code, code } from "./ts-poet-wrapper.js";

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
    resolveType,
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
      resolveType,
      runtimeClass: {
        name: code`${snippets.LazyObjectOption}<${resolveType.itemType.identifierTypeAlias}, ${partialType.itemType.name}, ${resolveType.itemType.name}>`,
        partialPropertyName: "partial",
        rawName: code`${snippets.LazyObjectOption}`,
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
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(object => ${(this.partialType.itemType as ObjectType).newExpression({ parameters: code`object` })}), resolver: async () => ${imports.Right}((${value} as ${imports.Maybe}<${this.resolveType.itemType.name}>).unsafeCoerce()) })`,
          sourceTypeCheckExpression: (value) =>
            code`${imports.Maybe}.isMaybe(${value})`,
          sourceTypeName: code`${imports.Maybe}<${this.resolveType.itemType.name}>`,
          sourceTypeof: "object",
        },
        {
          conversionExpression: (value) =>
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${imports.Maybe}.of(${(this.partialType.itemType as ObjectType).newExpression({ parameters: value })}), resolver: async () => ${imports.Right}(${value} as ${this.resolveType.itemType.name}) })`,
          // Don't check instanceof value since the NamedObjectUnionType may be an interface
          // Rely on the fact that this will be the last type check on an object
          sourceTypeCheckExpression: (value) =>
            code`typeof ${value} === "object"`,
          sourceTypeName: this.resolveType.itemType.name,
          sourceTypeof: "object",
        },
      );
    } else if (
      this.resolveType.itemType.kind === "NamedObjectUnionType" &&
      this.partialType.itemType.kind === "NamedObjectUnionType" &&
      this.resolveType.itemType.memberTypes.length ===
        this.partialType.itemType.memberTypes.length
    ) {
      const maybeMap = code`.map(object => { ${this.resolvedNamedObjectUnionTypeToPartialNamedObjectUnionTypeConversion({ resolvedNamedObjectUnionType: this.resolveType.itemType as NamedObjectUnionType, partialNamedObjectUnionType: this.partialType.itemType as NamedObjectUnionType, variables: { resolvedObjectUnion: code`object` } })} })`;

      conversions.push(
        {
          conversionExpression: (value) =>
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}${maybeMap}, resolver: async () => ${imports.Right}((${value} as ${imports.Maybe}<${this.resolveType.itemType.name}>).unsafeCoerce()) })`,
          sourceTypeCheckExpression: (value) =>
            code`${imports.Maybe}.isMaybe(${value})`,
          sourceTypeName: code`${imports.Maybe}<${this.resolveType.itemType.name}>`,
          sourceTypeof: "object",
        },
        {
          conversionExpression: (value) =>
            code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${imports.Maybe}.of(${value})${maybeMap}, resolver: async () => ${imports.Right}(${value} as ${this.resolveType.itemType.name}) })`,
          // Don't check instanceof value since the NamedObjectUnionType may be an interface
          // Rely on the fact that this will be the last type check on an object
          sourceTypeCheckExpression: (value) =>
            code`typeof ${value} === "object"`,
          sourceTypeName: this.resolveType.itemType.name,
          sourceTypeof: "object",
        },
      );
    }

    conversions.push({
      conversionExpression: () =>
        code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${imports.Maybe}.empty(), resolver: async () => { throw new Error("should never be called"); } })`,
      sourceTypeCheckExpression: (value) => code`${value} === undefined`,
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

  override fromRdfResourceValuesExpression(
    parameters: Parameters<Super["fromRdfResourceValuesExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.partialType.fromRdfResourceValuesExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifier, options) => ${variables.objectSet}.${this.resolveType.itemType.objectSetMethodNames.object}(identifier, options) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`${variables.value}.resolve().then(either => either.unsafeCoerce().extractNullable())`;
  }
}
