import { Maybe } from "purify-ts";
import { type Code, code, conditionalOutput } from "ts-poet";

import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { sharedImports } from "./sharedImports.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class LazyObjectType extends AbstractLazyObjectType<
  AbstractLazyObjectType.ObjectTypeConstraint,
  AbstractLazyObjectType.ObjectTypeConstraint
> {
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.empty();
  override readonly kind = "LazyObjectType";

  constructor({
    partialType,
    resolvedType,
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
      resolvedType,
      runtimeClass: {
        name: code`${localSnippets.LazyObject}<${resolvedType.identifierTypeAlias}, ${partialType.name}, ${resolvedType.name}>`,
        partialPropertyName: "partial",
        rawName: code`${localSnippets.LazyObject}`,
      },
    });
  }

  override get conversions(): readonly AbstractLazyObjectType.Conversion[] {
    const conversions = super.conversions.concat();

    if (this.partialType.kind === "ObjectType") {
      conversions.push({
        conversionExpression: (value) =>
          code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${(this.partialType as ObjectType).newExpression({ parameters: value })}, resolver: async () => ${sharedImports.Either}.of(${value} as ${this.resolvedType.name}) })`,
        // Don't check instanceof value since the ObjectType may be an interface
        // Rely on the fact that this will be the last type check on an object
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: this.resolvedType.name,
        sourceTypeof: "object",
      });
    } else if (
      this.resolvedType.kind === "ObjectUnionType" &&
      this.partialType.kind === "ObjectUnionType" &&
      this.resolvedType.memberTypes.length ===
        this.partialType.memberTypes.length
    ) {
      conversions.push({
        conversionExpression: (value) =>
          code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ((object: ${this.resolvedType.name}) => { ${this.resolvedObjectUnionTypeToPartialObjectUnionTypeConversion({ resolvedObjectUnionType: this.resolvedType as ObjectUnionType, partialObjectUnionType: this.partialType as ObjectUnionType, variables: { resolvedObjectUnion: "object" } })} })(${value}), resolver: async () => ${sharedImports.Either}.of(${value} as ${this.resolvedType.name}) })`,
        // Don't check instanceof value since the ObjectUnionType may be an interface
        // Rely on the fact that this will be the last type check on an object
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: this.resolvedType.name,
        sourceTypeof: "object",
      });
    }

    return conversions;
  }

  override fromJsonExpression(
    parameters: Parameters<Super["fromJsonExpression"]>[0],
  ): Code {
    return code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${this.partialType.fromJsonExpression(parameters)}, resolver: (identifier) => Promise.resolve(purify.Left(new Error(\`unable to resolve identifier \${rdfjsResource.Resource.Identifier.toString(identifier)} deserialized from JSON\`))) })`;
  }

  override fromRdfExpression(
    parameters: Parameters<Super["fromRdfExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.partialType.fromRdfExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifier) => ${variables.objectSet}.${this.resolvedType.objectSetMethodNames.object}(identifier) })))`;
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

namespace localSnippets {
  export const LazyObject = conditionalOutput(
    `${syntheticNamePrefix}LazyObject`,
    code`\
/**
 * Type of lazy properties that return a single required object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObject<ObjectIdentifierT extends ${sharedImports.BlankNode} | ${sharedImports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  readonly partial: PartialObjectT;
  private readonly resolver: (identifier: ObjectIdentifierT) => Promise<${sharedImports.Either}<Error, ResolvedObjectT>>;

  constructor({ partial, resolver }: {
    partial: PartialObjectT
    resolver: (identifier: ObjectIdentifierT) => Promise<${sharedImports.Either}<Error, ResolvedObjectT>>,
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  resolve(): Promise<${sharedImports.Either}<Error, ResolvedObjectT>> {
    return this.resolver(this.partial.${syntheticNamePrefix}identifier);
  }
}`,
  );
}
