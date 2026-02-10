import { Maybe } from "purify-ts";
import { type Code, code, conditionalOutput } from "ts-poet";
import { Memoize } from "typescript-memoize";

import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { ObjectType } from "./ObjectType.js";
import type { ObjectUnionType } from "./ObjectUnionType.js";
import type { SetType } from "./SetType.js";
import { sharedImports } from "./sharedImports.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export class LazyObjectSetType extends AbstractLazyObjectType<
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>,
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>
> {
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.of({
    limit: {
      type: code`${sharedImports.GraphQLInt}`,
    },
    offset: {
      type: code`${sharedImports.GraphQLInt}`,
    },
  });
  override readonly kind = "LazyObjectSetType";

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
        name: code`${localSnippets.LazyObjectSet}<${resolvedType.itemType.identifierTypeAlias}, ${partialType.itemType.name}, ${resolvedType.itemType.name}>`,
        partialPropertyName: "partials",
        rawName: code`${localSnippets.LazyObjectSet}`,
      },
    });
  }

  @Memoize()
  override get conversions(): readonly AbstractLazyObjectType.Conversion[] {
    const conversions = super.conversions.concat();

    if (this.partialType.itemType.kind === "ObjectType") {
      conversions.push({
        conversionExpression: (value) =>
          code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(object => ${(this.partialType.itemType as ObjectType).newExpression({ parameters: "object" })}), resolver: async () => ${sharedImports.Either}.of(${value} as readonly ${this.resolvedType.itemType.name}[]) })`,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: code`readonly ${this.resolvedType.itemType.name}[]`,
        sourceTypeof: "object",
      });
    } else if (
      this.resolvedType.itemType.kind === "ObjectUnionType" &&
      this.partialType.itemType.kind === "ObjectUnionType" &&
      this.resolvedType.itemType.memberTypes.length ===
        this.partialType.itemType.memberTypes.length
    ) {
      conversions.push({
        conversionExpression: (value) =>
          code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(object => { ${this.resolvedObjectUnionTypeToPartialObjectUnionTypeConversion({ resolvedObjectUnionType: this.resolvedType.itemType as ObjectUnionType, partialObjectUnionType: this.partialType.itemType as ObjectUnionType, variables: { resolvedObjectUnion: "object" } })} }), resolver: async () => ${sharedImports.Either}.of(${value} as readonly ${this.resolvedType.itemType.name}[]) })`,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: code`readonly ${this.resolvedType.itemType.name}[]`,
        sourceTypeof: "object",
      });
    }

    conversions.push({
      conversionExpression: () =>
        code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: [], resolver: async () => { throw new Error("should never be called"); } })`,
      sourceTypeCheckExpression: (value) =>
        code`typeof ${value} === "undefined"`,
      sourceTypeName: code`undefined`,
      sourceTypeof: "object",
    });

    return conversions;
  }

  override fromJsonExpression(
    parameters: Parameters<Super["fromJsonExpression"]>[0],
  ): Code {
    return code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${this.partialType.fromJsonExpression(parameters)}, resolver: () => Promise.resolve(purify.Left(new Error("unable to resolve identifiers deserialized from JSON"))) })`;
  }

  override fromRdfExpression(
    parameters: Parameters<Super["fromRdfExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.partialType.fromRdfExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifiers) => ${variables.objectSet}.${this.resolvedType.itemType.objectSetMethodNames.objects}({ filter: { ${syntheticNamePrefix}identifier: { in: identifiers } } }) })))`;
  }

  override graphqlResolveExpression({
    variables,
  }: Parameters<Super["graphqlResolveExpression"]>[0]): Code {
    return code`(${variables.value}.resolve({ limit: ${variables.args}.limit, offset: ${variables.args}.offset })).then(either => either.unsafeCoerce())`;
  }
}

type Super = AbstractLazyObjectType<
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>,
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>
>;

namespace localSnippets {
  export const LazyObjectSet = conditionalOutput(
    `${syntheticNamePrefix}LazyObjectSet`,
    code`\
/**
 * Type of lazy properties that return a set of objects. This is a class instead of an interface so it can be instanceof'd elsewhere.
 */
export class ${syntheticNamePrefix}LazyObjectSet<ObjectIdentifierT extends ${sharedImports.BlankNode} | ${sharedImports.NamedNode}, PartialObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }, ResolvedObjectT extends { ${syntheticNamePrefix}identifier: ObjectIdentifierT }> {
  readonly partials: readonly PartialObjectT[];
  private readonly resolver: (identifiers: readonly ObjectIdentifierT[]) => Promise<${sharedImports.Either}<Error, readonly ResolvedObjectT[]>>;

  constructor({ partials, resolver }: {
    partials: readonly PartialObjectT[]
    resolver: (identifiers: readonly ObjectIdentifierT[]) => Promise<${sharedImports.Either}<Error, readonly ResolvedObjectT[]>>,
  }) {
    this.partials = partials;
    this.resolver = resolver;
  }

  get length(): number {
    return this.partials.length;
  }

  async resolve(options?: { limit?: number; offset?: number }): Promise<${sharedImports.Either}<Error, readonly ResolvedObjectT[]>> {
    if (this.partials.length === 0) {
      return ${sharedImports.Either}.of([]);
    }

    const limit = options?.limit ?? Number.MAX_SAFE_INTEGER;
    if (limit <= 0) {
      return ${sharedImports.Either}.of([]);
    }

    let offset = options?.offset ?? 0;
    if (offset < 0) {
      offset = 0;
    }

    return await this.resolver(this.partials.slice(offset, offset + limit).map(partial => partial.${syntheticNamePrefix}identifier));
  }
}`,
  );
}
