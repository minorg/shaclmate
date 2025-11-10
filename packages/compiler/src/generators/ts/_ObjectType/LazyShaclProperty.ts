import { Maybe } from "purify-ts";
import "ts-morph";
import { Memoize } from "typescript-memoize";

import { invariant } from "ts-invariant";
import type { TsFeature } from "../../../enums/TsFeature.js";
import { Import } from "../Import.js";
import type { ObjectType } from "../ObjectType.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import type { OptionType } from "../OptionType.js";
import type { SetType } from "../SetType.js";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import { Type as _Type } from "../Type.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { ShaclProperty } from "./ShaclProperty.js";

function partialObjectUnionTypeToResolvedObjectUnionTypeSwitchStatement({
  resolvedObjectUnionType,
  partialObjectUnionType,
  variables,
}: {
  resolvedObjectUnionType: ObjectUnionType;
  partialObjectUnionType: ObjectUnionType;
  variables: { value: string };
}) {
  invariant(
    resolvedObjectUnionType.memberTypes.length ===
      partialObjectUnionType.memberTypes.length,
  );

  const caseBlocks = resolvedObjectUnionType.memberTypes.map(
    (resolvedObjectType, objectTypeI) => {
      return `${resolvedObjectType.discriminatorPropertyValues.map((discriminatorPropertyValue) => `case "${discriminatorPropertyValue}":`).join("\n")} return ${partialObjectUnionType.memberTypes[objectTypeI].newExpression({ parameters: variables.value })};`;
    },
  );
  caseBlocks.push(
    `default: ${variables.value} satisfies never; throw new Error("unrecognized type");`,
  );
  return `switch (${variables.value}.${resolvedObjectUnionType.discriminatorProperty.unsafeCoerce().name}) { ${caseBlocks.join("\n")} }`;
}

export class LazyShaclProperty<
  LazyTypeT extends LazyShaclProperty.Type<ResolvedTypeT, PartialTypeT>,
  ResolvedTypeT extends LazyShaclProperty.Type.ResolvedTypeConstraint,
  PartialTypeT extends LazyShaclProperty.Type.PartialTypeConstraint,
> extends ShaclProperty<LazyTypeT> {
  override readonly mutable = false;
  override readonly recursive = false;

  @Memoize()
  override get graphqlField(): ShaclProperty<
    LazyShaclProperty.Type<PartialTypeT, ResolvedTypeT>
  >["graphqlField"] {
    const args = this.type.graphqlArgs;
    const argsVariable = args.isJust() ? "args" : "_args";
    return Maybe.of({
      args,
      description: this.comment.map(JSON.stringify),
      name: this.name,
      resolve: `async (source, ${argsVariable}) => ${this.type.graphqlResolveExpression({ variables: { args: argsVariable, value: `source.${this.name}` } })}`,
      type: this.type.graphqlName.toString(),
    });
  }
}

export namespace LazyShaclProperty {
  export abstract class Type<
    ResolvedTypeT extends Type.ResolvedTypeConstraint,
    PartialTypeT extends Type.PartialTypeConstraint,
  > extends _Type {
    override readonly discriminatorProperty: _Type["discriminatorProperty"] =
      Maybe.empty();
    override readonly mutable = false;
    override readonly typeof = "object";

    abstract readonly graphqlArgs: Maybe<
      Record<
        string,
        {
          type: string;
        }
      >
    >;

    protected readonly partialType: PartialTypeT;
    protected readonly resolvedType: ResolvedTypeT;
    protected readonly runtimeClass: {
      readonly name: string;
      readonly rawName: string;
      readonly snippetDeclaration: string;
      readonly partialPropertyName: string;
    };

    constructor({
      partialType,
      resolvedType,
      runtimeClass,
    }: {
      partialType: PartialTypeT;
      resolvedType: ResolvedTypeT;
      runtimeClass: Type<ResolvedTypeT, PartialTypeT>["runtimeClass"];
    }) {
      super();
      this.partialType = partialType;
      this.resolvedType = resolvedType;
      this.runtimeClass = runtimeClass;
    }

    override get conversions(): readonly _Type.Conversion[] {
      return [
        {
          conversionExpression: (value) => value,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "object" && ${value} instanceof ${this.runtimeClass.rawName}`,
          sourceTypeName: this.name,
        } satisfies _Type.Conversion,
      ];
    }

    @Memoize()
    override get equalsFunction(): string {
      return `((left, right) => ${this.partialType.equalsFunction}(left.${this.runtimeClass.partialPropertyName}, right.${this.runtimeClass.partialPropertyName}))`;
    }

    override get graphqlName(): _Type.GraphqlName {
      return this.resolvedType.graphqlName;
    }

    override hashStatements({
      depth,
      variables,
    }: Parameters<_Type["hashStatements"]>[0]): readonly string[] {
      return this.partialType.hashStatements({
        depth: depth + 1,
        variables: {
          ...variables,
          value: `${variables.value}.${this.runtimeClass.partialPropertyName}`,
        },
      });
    }

    override get jsonName(): _Type.JsonName {
      return this.partialType.jsonName;
    }

    override jsonUiSchemaElement(
      parameters: Parameters<_Type["jsonUiSchemaElement"]>[0],
    ): Maybe<string> {
      return this.partialType.jsonUiSchemaElement(parameters);
    }

    override jsonZodSchema(
      parameters: Parameters<_Type["jsonZodSchema"]>[0],
    ): string {
      return this.partialType.jsonZodSchema(parameters);
    }

    override get name(): string {
      return this.runtimeClass.name;
    }

    override snippetDeclarations(
      parameters: Parameters<_Type["snippetDeclarations"]>[0],
    ): readonly string[] {
      return this.partialType
        .snippetDeclarations(parameters)
        .concat(this.resolvedType.snippetDeclarations(parameters))
        .concat(this.runtimeClass.snippetDeclaration);
    }

    override sparqlConstructTemplateTriples(
      parameters: Parameters<_Type["sparqlConstructTemplateTriples"]>[0],
    ): readonly string[] {
      return this.partialType.sparqlConstructTemplateTriples(parameters);
    }

    override sparqlWherePatterns(
      parameters: Parameters<_Type["sparqlWherePatterns"]>[0],
    ): readonly string[] {
      return this.partialType.sparqlWherePatterns(parameters);
    }

    override toJsonExpression({
      variables,
    }: Parameters<_Type["toJsonExpression"]>[0]): string {
      return this.partialType.toJsonExpression({
        variables: {
          value: `${variables.value}.${this.runtimeClass.partialPropertyName}`,
        },
      });
    }

    override toRdfExpression({
      variables,
    }: Parameters<_Type["toRdfExpression"]>[0]): string {
      return this.partialType.toRdfExpression({
        variables: {
          ...variables,
          value: `${variables.value}.${this.runtimeClass.partialPropertyName}`,
        },
      });
    }

    override useImports(parameters: {
      features: Set<TsFeature>;
    }): readonly Import[] {
      return this.resolvedType.useImports(parameters).concat(Import.PURIFY);
    }
  }

  export namespace Type {
    export type ResolvedTypeConstraint =
      | ObjectType
      | ObjectUnionType
      | OptionType<ObjectType | ObjectUnionType>
      | SetType<ObjectType | ObjectUnionType>;
    export type PartialTypeConstraint = ResolvedTypeConstraint;
  }

  export class ObjectSetType<
    ResolvedTypeT extends SetType<ObjectType | ObjectUnionType>,
    PartialTypeT extends SetType<ObjectType | ObjectUnionType>,
  > extends Type<ResolvedTypeT, PartialTypeT> {
    constructor({
      resolvedType,
      partialType,
    }: { resolvedType: ResolvedTypeT; partialType: PartialTypeT }) {
      super({
        resolvedType,
        runtimeClass: {
          name: `${syntheticNamePrefix}LazyObjectSet<${resolvedType.itemType.identifierTypeAlias}, ${resolvedType.itemType.name}, ${partialType.itemType.name}>`,
          rawName: `${syntheticNamePrefix}LazyObjectSet`,
          snippetDeclaration: SnippetDeclarations.LazyObjectSet,
          partialPropertyName: "partials",
        },
        partialType,
      });
    }

    @Memoize()
    override get conversions(): readonly _Type.Conversion[] {
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
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${value}.map(object => { ${partialObjectUnionTypeToResolvedObjectUnionTypeSwitchStatement({ resolvedObjectUnionType: this.resolvedType.itemType as ObjectUnionType, partialObjectUnionType: this.partialType.itemType as ObjectUnionType, variables: { value: "object" } })} }), resolver: async () => purify.Either.of(${value} as readonly ${this.resolvedType.itemType.name}[]) })`,
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
      parameters: Parameters<_Type["fromJsonExpression"]>[0],
    ): string {
      return `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${this.partialType.fromJsonExpression(parameters)}, resolver: () => Promise.resolve(purify.Left(new Error("unable to resolve identifiers deserialized from JSON"))) })`;
    }

    override fromRdfExpression(
      parameters: Parameters<_Type["fromRdfExpression"]>[0],
    ): string {
      const { variables } = parameters;
      return `${this.partialType.fromRdfExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifiers) => ${variables.objectSet}.${this.resolvedType.itemType.objectSetMethodNames.objects}({ where: { identifiers, type: "identifiers" } }) })))`;
    }

    @Memoize()
    override get graphqlArgs() {
      return Maybe.of({
        limit: {
          type: "graphql.GraphQLInt",
        },
        offset: {
          type: "graphql.GraphQLInt",
        },
      });
    }

    override graphqlResolveExpression({
      variables,
    }: Parameters<_Type["graphqlResolveExpression"]>[0]): string {
      return `(await ${variables.value}.resolve({ limit: ${variables.args}.limit, offset: ${variables.args}.offset })).unsafeCoerce()`;
    }
  }

  abstract class SingleObjectType<
    ResolvedTypeT extends Exclude<
      Type.ResolvedTypeConstraint,
      SetType<ObjectType | ObjectUnionType>
    >,
    PartialTypeT extends Exclude<
      Type.PartialTypeConstraint,
      SetType<ObjectType | ObjectUnionType>
    >,
  > extends Type<ResolvedTypeT, PartialTypeT> {
    override fromJsonExpression(
      parameters: Parameters<_Type["fromJsonExpression"]>[0],
    ): string {
      return `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ${this.partialType.fromJsonExpression(parameters)}, resolver: (identifier) => Promise.resolve(purify.Left(new Error(\`unable to resolve identifier \${rdfjsResource.Resource.Identifier.toString(identifier)} deserialized from JSON\`))) })`;
    }

    override get graphqlArgs(): Type<
      ResolvedTypeT,
      ObjectUnionType
    >["graphqlArgs"] {
      return Maybe.empty();
    }

    override graphqlResolveExpression({
      variables,
    }: Parameters<_Type["graphqlResolveExpression"]>[0]): string {
      return `(await ${variables.value}.resolve()).unsafeCoerce()`;
    }
  }

  export class OptionalObjectType<
    ResolvedTypeT extends OptionType<ObjectType | ObjectUnionType>,
    PartialTypeT extends OptionType<ObjectType | ObjectUnionType>,
  > extends SingleObjectType<ResolvedTypeT, PartialTypeT> {
    constructor({
      resolvedType,
      partialType,
    }: { resolvedType: ResolvedTypeT; partialType: PartialTypeT }) {
      super({
        resolvedType,
        runtimeClass: {
          name: `${syntheticNamePrefix}LazyOptionalObject<${resolvedType.itemType.identifierTypeAlias}, ${resolvedType.itemType.name}, ${partialType.itemType.name}>`,
          rawName: `${syntheticNamePrefix}LazyOptionalObject`,
          snippetDeclaration: SnippetDeclarations.LazyOptionalObject,
          partialPropertyName: "partial",
        },
        partialType,
      });
    }

    @Memoize()
    override get conversions(): readonly _Type.Conversion[] {
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
            sourceTypeCheckExpression: (value) =>
              `typeof ${value} === "object"`,
            sourceTypeName: this.resolvedType.itemType.name,
          },
        );
      } else if (
        this.resolvedType.itemType.kind === "ObjectUnionType" &&
        this.partialType.itemType.kind === "ObjectUnionType" &&
        this.resolvedType.itemType.memberTypes.length ===
          this.partialType.itemType.memberTypes.length
      ) {
        const maybeMap = `.map(object => { ${partialObjectUnionTypeToResolvedObjectUnionTypeSwitchStatement({ resolvedObjectUnionType: this.resolvedType.itemType as ObjectUnionType, partialObjectUnionType: this.partialType.itemType as ObjectUnionType, variables: { value: "object" } })} })`;

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
            sourceTypeCheckExpression: (value) =>
              `typeof ${value} === "object"`,
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

    override fromRdfExpression(
      parameters: Parameters<_Type["fromRdfExpression"]>[0],
    ): string {
      const { variables } = parameters;
      return `${this.partialType.fromRdfExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifier) => ${variables.objectSet}.${this.resolvedType.itemType.objectSetMethodNames.object}(identifier) })))`;
    }

    override graphqlResolveExpression(
      parameters: Parameters<_Type["graphqlResolveExpression"]>[0],
    ): string {
      return `${super.graphqlResolveExpression(parameters)}.extractNullable()`;
    }
  }

  export class RequiredObjectType<
    ResolvedTypeT extends ObjectType | ObjectUnionType,
    PartialTypeT extends ObjectType | ObjectUnionType,
  > extends SingleObjectType<ResolvedTypeT, PartialTypeT> {
    constructor({
      resolvedType,
      partialType,
    }: { resolvedType: ResolvedTypeT; partialType: PartialTypeT }) {
      super({
        resolvedType,
        runtimeClass: {
          name: `${syntheticNamePrefix}LazyRequiredObject<${resolvedType.identifierTypeAlias}, ${resolvedType.name}, ${partialType.name}>`,
          rawName: `${syntheticNamePrefix}LazyRequiredObject`,
          snippetDeclaration: SnippetDeclarations.LazyRequiredObject,
          partialPropertyName: "partial",
        },
        partialType,
      });
    }

    override get conversions(): readonly _Type.Conversion[] {
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
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}: ((object: ${this.resolvedType.name}) => { ${partialObjectUnionTypeToResolvedObjectUnionTypeSwitchStatement({ resolvedObjectUnionType: this.resolvedType as ObjectUnionType, partialObjectUnionType: this.partialType as ObjectUnionType, variables: { value: "object" } })} })(${value}), resolver: async () => purify.Either.of(${value} as ${this.resolvedType.name}) })`,
          // Don't check instanceof value since the ObjectUnionType may be an interface
          // Rely on the fact that this will be the last type check on an object
          sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
          sourceTypeName: this.resolvedType.name,
        });
      }

      return conversions;
    }

    override fromRdfExpression(
      parameters: Parameters<_Type["fromRdfExpression"]>[0],
    ): string {
      const { variables } = parameters;
      return `${this.partialType.fromRdfExpression(parameters)}.map(values => values.map(${this.runtimeClass.partialPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.partialPropertyName}, resolver: (identifier) => ${variables.objectSet}.${this.resolvedType.objectSetMethodNames.object}(identifier) })))`;
    }
  }
}
