import { Maybe } from "purify-ts";
import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import { imports } from "./imports.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import type { ObjectType } from "./ObjectType.js";
import { snippets } from "./snippets.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class LazyObjectType extends AbstractLazyObjectType<
  AbstractLazyObjectType.ObjectTypeConstraint,
  AbstractLazyObjectType.ObjectTypeConstraint
> {
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.empty();
  override readonly kind = "LazyObjectType";

  constructor({
    partialType,
    resolveType,
    ...superParameters
  }: Omit<
    ConstructorParameters<
      typeof AbstractLazyObjectType<
        AbstractLazyObjectType.ObjectTypeConstraint,
        AbstractLazyObjectType.ObjectTypeConstraint
      >
    >[0],
    "runtimeClass"
  >) {
    super({
      ...superParameters,
      partialType,
      resolveType,
      runtimeClass: {
        name: code`${snippets.LazyObject}<${resolveType.identifierTypeAlias}, ${partialType.name}, ${resolveType.name}>`,
        partialPropertyName: "partial",
        rawName: code`${snippets.LazyObject}`,
      },
    });
  }

  override get conversions(): readonly AbstractLazyObjectType.Conversion[] {
    const conversions = super.conversions.concat();

    if (this.partialType.kind === "ObjectType") {
      conversions.push({
        conversionExpression: (value) =>
          code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${(this.partialType as ObjectType).newExpression({ parameters: value })}, resolver: async () => ${imports.Right}(${value} as ${this.resolveType.name}) })`,
        // Don't check instanceof value since the ObjectType may be an interface
        // Rely on the fact that this will be the last type check on an object
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: this.resolveType.name,
        sourceTypeof: "object",
      });
    } else if (
      this.resolveType.kind === "NamedObjectUnionType" &&
      this.partialType.kind === "NamedObjectUnionType" &&
      this.resolveType.memberTypes.length ===
        this.partialType.memberTypes.length
    ) {
      conversions.push({
        conversionExpression: (value) =>
          code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ((object: ${this.resolveType.name}) => { ${this.resolvedNamedObjectUnionTypeToPartialNamedObjectUnionTypeConversion({ resolvedNamedObjectUnionType: this.resolveType as NamedObjectUnionType, partialNamedObjectUnionType: this.partialType as NamedObjectUnionType, variables: { resolvedObjectUnion: code`object` } })} })(${value}), resolver: async () => ${imports.Right}(${value} as ${this.resolveType.name}) })`,
        // Don't check instanceof value since the NamedObjectUnionType may be an interface
        // Rely on the fact that this will be the last type check on an object
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: this.resolveType.name,
        sourceTypeof: "object",
      });
    }

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
    return code`${this.partialType.fromRdfExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifier, options) => ${variables.objectSet}.${this.resolveType.objectSetMethodNames.object}(identifier, options) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`${variables.value}.resolve().then(either => either.unsafeCoerce())`;
  }
}

type Super = AbstractLazyObjectType<
  AbstractLazyObjectType.ObjectTypeConstraint,
  AbstractLazyObjectType.ObjectTypeConstraint
>;
