import { Maybe } from "purify-ts";
import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";

export class LazyObjectType extends AbstractLazyObjectType<
  AbstractLazyObjectType.ObjectTypeConstraint,
  AbstractLazyObjectType.ObjectTypeConstraint
> {
  override readonly graphqlArgs: Type["graphqlArgs"] = Maybe.empty();

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
        name: `${syntheticNamePrefix}LazyObject<${resolvedType.identifierTypeAlias}, ${partialType.name}, ${resolvedType.name}>`,
        partialPropertyName: "partial",
        rawName: `${syntheticNamePrefix}LazyObject`,
        snippetDeclarations: singleEntryRecord(
          `${syntheticNamePrefix}LazyObject`,
          `\
/**
 * Type of lazy properties that return a single required object. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObject<ObjectIdentifierT extends rdfjs.BlankNode | rdfjs.NamedNode, PartialObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  readonly partial: PartialObjectT;
  private readonly resolver: (identifier: ObjectIdentifierT) => Promise<purify.Either<Error, ResolvedObjectT>>;

  constructor({ partial, resolver }: {
    partial: PartialObjectT
    resolver: (identifier: ObjectIdentifierT) => Promise<purify.Either<Error, ResolvedObjectT>>,
  }) {
    this.partial = partial;
    this.resolver = resolver;
  }

  resolve(): Promise<purify.Either<Error, ResolvedObjectT>> {
    return this.resolver(this.partial.${syntheticNamePrefix}identifier);
  }
}`,
        ),
      },
    });
  }

  override get conversions(): readonly Type.Conversion[] {
    const conversions = super.conversions.concat();

    if (this.partialType.kind === "ObjectType") {
      conversions.push({
        conversionExpression: (value) =>
          `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${(this.partialType as ObjectType).newExpression({ parameters: value })}, resolver: async () => purify.Either.of(${value} as ${this.resolvedType.name}) })`,
        // Don't check instanceof value since the ObjectType may be an interface
        // Rely on the fact that this will be the last type check on an object
        sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
        sourceTypeName: this.resolvedType.name,
      });
    } else if (
      this.resolvedType.kind === "ObjectUnionType" &&
      this.partialType.kind === "ObjectUnionType" &&
      this.resolvedType.memberTypes.length ===
        this.partialType.memberTypes.length
    ) {
      conversions.push({
        conversionExpression: (value) =>
          `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ((object: ${this.resolvedType.name}) => { ${this.resolvedObjectUnionTypeToPartialObjectUnionTypeConversion({ resolvedObjectUnionType: this.resolvedType as ObjectUnionType, partialObjectUnionType: this.partialType as ObjectUnionType, variables: { resolvedObjectUnion: "object" } })} })(${value}), resolver: async () => purify.Either.of(${value} as ${this.resolvedType.name}) })`,
        // Don't check instanceof value since the ObjectUnionType may be an interface
        // Rely on the fact that this will be the last type check on an object
        sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
        sourceTypeName: this.resolvedType.name,
      });
    }

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
    return `${this.partialType.fromRdfExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifier) => ${variables.objectSet}.${this.resolvedType.objectSetMethodNames.object}(identifier) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Type["graphqlResolveExpression"]>[0]): string {
    return `${variables.value}.resolve().then(either => either.unsafeCoerce())`;
  }
}
