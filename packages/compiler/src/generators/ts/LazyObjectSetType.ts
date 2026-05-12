import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { AbstractLazyObjectType } from "./AbstractLazyObjectType.js";
import type { NamedObjectType } from "./NamedObjectType.js";
import type { NamedObjectUnionType } from "./NamedObjectUnionType.js";
import type { SetType } from "./SetType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import { type Code, code } from "./ts-poet-wrapper.js";

export class LazyObjectSetType extends AbstractLazyObjectType<
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>,
  SetType<AbstractLazyObjectType.ObjectTypeConstraint>
> {
  override readonly graphqlArgs: Super["graphqlArgs"] = Maybe.of({
    limit: {
      type: code`${this.imports.GraphQLInt}`,
    },
    offset: {
      type: code`${this.imports.GraphQLInt}`,
    },
  });
  override readonly kind = "LazyObjectSetType";

  @Memoize()
  override get conversions(): readonly AbstractLazyObjectType.Conversion[] {
    const conversions = super.conversions.concat();

    if (this.partialType.itemType.kind === "NamedObjectType") {
      conversions.push({
        conversionExpression: (value) =>
          code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(${(this.partialType.itemType as NamedObjectType).name}.${syntheticNamePrefix}create), resolver: async () => ${this.imports.Right}(${value} as readonly ${this.resolveType.itemType.name}[]) })`,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: code`readonly ${this.resolveType.itemType.name}[]`,
        sourceTypeof: "object",
      });
    } else if (
      this.resolveType.itemType.kind === "NamedObjectUnionType" &&
      this.partialType.itemType.kind === "NamedObjectUnionType" &&
      this.resolveType.itemType.members.length ===
        this.partialType.itemType.members.length
    ) {
      conversions.push({
        conversionExpression: (value) =>
          code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(object => { ${this.resolvedNamedObjectUnionTypeToPartialNamedObjectUnionTypeConversion({ resolvedNamedObjectUnionType: this.resolveType.itemType as NamedObjectUnionType, partialNamedObjectUnionType: this.partialType.itemType as NamedObjectUnionType, variables: { resolvedObjectUnion: code`object` } })} }), resolver: async () => ${this.imports.Right}(${value} as readonly ${this.resolveType.itemType.name}[]) })`,
        sourceTypeCheckExpression: (value) =>
          code`typeof ${value} === "object"`,
        sourceTypeName: code`readonly ${this.resolveType.itemType.name}[]`,
        sourceTypeof: "object",
      });
    }

    conversions.push({
      conversionExpression: () =>
        code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: [], resolver: async () => { throw new Error("should never be called"); } })`,
      sourceTypeCheckExpression: (value) => code`${value} === undefined`,
      sourceTypeName: code`undefined`,
      sourceTypeof: "undefined",
    });

    return conversions;
  }

  protected override get runtimeClass() {
    return {
      name: code`${this.snippets.LazyObjectSet}<${this.resolveType.itemType.identifierTypeAlias}, ${this.partialType.itemType.name}, ${this.resolveType.itemType.name}>`,
      partialPropertyName: "partials",
      rawName: code`${this.snippets.LazyObjectSet}`,
    };
  }

  override fromJsonExpression(
    parameters: Parameters<Super["fromJsonExpression"]>[0],
  ): Code {
    return code`new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${this.partialType.fromJsonExpression(parameters)}, resolver: () => Promise.resolve(${this.imports.Left}(new Error("unable to resolve identifiers deserialized from JSON"))) })`;
  }

  override fromRdfResourceValuesExpression(
    parameters: Parameters<Super["fromRdfResourceValuesExpression"]>[0],
  ): Code {
    const { variables } = parameters;
    return code`${this.partialType.fromRdfResourceValuesExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifiers, options) => ${variables.objectSet}.${this.resolveType.itemType.objectSetMethodNames.objects}({ identifiers, ...options }) })))`;
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
