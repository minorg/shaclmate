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

function stubObjectUnionTypeToResolvedObjectUnionTypeSwitchStatement({
  resolvedObjectUnionType,
  stubObjectUnionType,
  variables,
}: {
  resolvedObjectUnionType: ObjectUnionType;
  stubObjectUnionType: ObjectUnionType;
  variables: { value: string };
}) {
  invariant(
    resolvedObjectUnionType.memberTypes.length ===
      stubObjectUnionType.memberTypes.length,
  );

  const caseBlocks = resolvedObjectUnionType.memberTypes.map(
    (resolvedObjectType, objectTypeI) => {
      return `${resolvedObjectType.discriminatorPropertyValues.map((discriminatorPropertyValue) => `case "${discriminatorPropertyValue}":`).join("\n")} return ${stubObjectUnionType.memberTypes[objectTypeI].newExpression({ parameters: variables.value })};`;
    },
  );
  caseBlocks.push(
    `default: ${variables.value} satisfies never; throw new Error("unrecognized type");`,
  );
  return `switch (${variables.value}.${resolvedObjectUnionType.discriminatorProperty.unsafeCoerce().name}) { ${caseBlocks.join("\n")} }`;
}

export class LazyShaclProperty<
  LazyTypeT extends LazyShaclProperty.Type<ResolvedTypeT, StubTypeT>,
  ResolvedTypeT extends LazyShaclProperty.Type.ResolvedTypeConstraint,
  StubTypeT extends LazyShaclProperty.Type.StubTypeConstraint,
> extends ShaclProperty<LazyTypeT> {
  override readonly mutable = false;
  override readonly recursive = false;

  override get graphqlField(): ShaclProperty<
    LazyShaclProperty.Type<StubTypeT, ResolvedTypeT>
  >["graphqlField"] {
    return Maybe.of({
      description: this.comment.map(JSON.stringify).extract(),
      name: this.name,
      resolve: `async (source) => ${this.type.graphqlResolveExpression({ variables: { value: `source.${this.name}` } })}`,
      type: this.type.graphqlName.toString(),
    });
  }
}

export namespace LazyShaclProperty {
  export abstract class Type<
    ResolvedTypeT extends Type.ResolvedTypeConstraint,
    StubTypeT extends Type.StubTypeConstraint,
  > extends _Type {
    override readonly discriminatorProperty: _Type["discriminatorProperty"] =
      Maybe.empty();
    override readonly mutable = false;
    override readonly typeof = "object";

    protected readonly resolvedType: ResolvedTypeT;
    protected readonly runtimeClass: {
      readonly name: string;
      readonly rawName: string;
      readonly snippetDeclaration: string;
      readonly stubPropertyName: string;
    };
    protected readonly stubType: StubTypeT;

    constructor({
      stubType,
      resolvedType,
      runtimeClass,
    }: {
      stubType: StubTypeT;
      resolvedType: ResolvedTypeT;
      runtimeClass: Type<ResolvedTypeT, StubTypeT>["runtimeClass"];
    }) {
      super();
      this.stubType = stubType;
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
      return `((left, right) => ${this.stubType.equalsFunction}(left.${this.runtimeClass.stubPropertyName}, right.${this.runtimeClass.stubPropertyName}))`;
    }

    override get graphqlName(): _Type.GraphqlName {
      return this.resolvedType.graphqlName;
    }

    override graphqlResolveExpression({
      variables,
    }: Parameters<_Type["graphqlResolveExpression"]>[0]): string {
      return `(await ${variables.value}.resolve()).unsafeCoerce()`;
    }

    override hashStatements({
      depth,
      variables,
    }: Parameters<_Type["hashStatements"]>[0]): readonly string[] {
      return this.stubType.hashStatements({
        depth: depth + 1,
        variables: {
          ...variables,
          value: `${variables.value}.${this.runtimeClass.stubPropertyName}`,
        },
      });
    }

    override get jsonName(): _Type.JsonName {
      return this.stubType.jsonName;
    }

    override jsonUiSchemaElement(
      parameters: Parameters<_Type["jsonUiSchemaElement"]>[0],
    ): Maybe<string> {
      return this.stubType.jsonUiSchemaElement(parameters);
    }

    override jsonZodSchema(
      parameters: Parameters<_Type["jsonZodSchema"]>[0],
    ): string {
      return this.stubType.jsonZodSchema(parameters);
    }

    override get name(): string {
      return this.runtimeClass.name;
    }

    override snippetDeclarations(
      parameters: Parameters<_Type["snippetDeclarations"]>[0],
    ): readonly string[] {
      return this.stubType
        .snippetDeclarations(parameters)
        .concat(this.resolvedType.snippetDeclarations(parameters))
        .concat(this.runtimeClass.snippetDeclaration);
    }

    override sparqlConstructTemplateTriples(
      parameters: Parameters<_Type["sparqlConstructTemplateTriples"]>[0],
    ): readonly string[] {
      return this.stubType.sparqlConstructTemplateTriples(parameters);
    }

    override sparqlWherePatterns(
      parameters: Parameters<_Type["sparqlWherePatterns"]>[0],
    ): readonly string[] {
      return this.stubType.sparqlWherePatterns(parameters);
    }

    override toJsonExpression({
      variables,
    }: Parameters<_Type["toJsonExpression"]>[0]): string {
      return this.stubType.toJsonExpression({
        variables: {
          value: `${variables.value}.${this.runtimeClass.stubPropertyName}`,
        },
      });
    }

    override toRdfExpression({
      variables,
    }: Parameters<_Type["toRdfExpression"]>[0]): string {
      return this.stubType.toRdfExpression({
        variables: {
          ...variables,
          value: `${variables.value}.${this.runtimeClass.stubPropertyName}`,
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

    export type StubTypeConstraint = ResolvedTypeConstraint;
  }

  export class ObjectSetType<
    ResolvedTypeT extends SetType<ObjectType | ObjectUnionType>,
    StubTypeT extends SetType<ObjectType | ObjectUnionType>,
  > extends Type<ResolvedTypeT, StubTypeT> {
    constructor({
      resolvedType,
      stubType,
    }: { resolvedType: ResolvedTypeT; stubType: StubTypeT }) {
      super({
        resolvedType,
        runtimeClass: {
          name: `${syntheticNamePrefix}LazyObjectSet<${resolvedType.itemType.identifierTypeAlias}, ${resolvedType.itemType.name}, ${stubType.itemType.name}>`,
          rawName: `${syntheticNamePrefix}LazyObjectSet`,
          snippetDeclaration: SnippetDeclarations.LazyObjectSet,
          stubPropertyName: "stubs",
        },
        stubType,
      });
    }

    @Memoize()
    override get conversions(): readonly _Type.Conversion[] {
      const conversions = super.conversions.concat();

      if (this.stubType.itemType.kind === "ObjectType") {
        conversions.push({
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: ${value}.map(object => ${(this.stubType.itemType as ObjectType).newExpression({ parameters: "object" })}), resolver: async () => purify.Either.of(${value} as readonly ${this.resolvedType.itemType.name}[]) })`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
          sourceTypeName: `readonly ${this.resolvedType.itemType.name}[]`,
        });
      } else if (
        this.resolvedType.itemType.kind === "ObjectUnionType" &&
        this.stubType.itemType.kind === "ObjectUnionType" &&
        this.resolvedType.itemType.memberTypes.length ===
          this.stubType.itemType.memberTypes.length
      ) {
        conversions.push({
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: ${value}.map(object => { ${stubObjectUnionTypeToResolvedObjectUnionTypeSwitchStatement({ resolvedObjectUnionType: this.resolvedType.itemType as ObjectUnionType, stubObjectUnionType: this.stubType.itemType as ObjectUnionType, variables: { value: "object" } })} }), resolver: async () => purify.Either.of(${value} as readonly ${this.resolvedType.itemType.name}[]) })`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
          sourceTypeName: `readonly ${this.resolvedType.itemType.name}[]`,
        });
      }

      conversions.push({
        conversionExpression: () =>
          `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: [], resolver: async () => { throw new Error("should never be called"); } })`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });

      return conversions;
    }

    override fromJsonExpression(
      parameters: Parameters<_Type["fromJsonExpression"]>[0],
    ): string {
      return `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: ${this.stubType.fromJsonExpression(parameters)}, resolver: () => Promise.resolve(purify.Left(new Error("unable to resolve identifiers deserialized from JSON"))) })`;
    }

    override fromRdfExpression(
      parameters: Parameters<_Type["fromRdfExpression"]>[0],
    ): string {
      const { variables } = parameters;
      return `${this.stubType.fromRdfExpression(parameters)}.map(${this.runtimeClass.stubPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}, resolver: (identifiers) => ${variables.objectSet}.${this.resolvedType.itemType.objectSetMethodNames.objects}({ where: { identifiers, type: "identifiers" }}) }))`;
    }
  }

  abstract class SingleObjectType<
    ResolvedTypeT extends Exclude<
      Type.ResolvedTypeConstraint,
      SetType<ObjectType | ObjectUnionType>
    >,
    StubTypeT extends Exclude<
      Type.StubTypeConstraint,
      SetType<ObjectType | ObjectUnionType>
    >,
  > extends Type<ResolvedTypeT, StubTypeT> {
    override fromJsonExpression(
      parameters: Parameters<_Type["fromJsonExpression"]>[0],
    ): string {
      return `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: ${this.stubType.fromJsonExpression(parameters)}, resolver: (identifier) => Promise.resolve(purify.Left(new Error(\`unable to resolve identifier \${rdfjsResource.Resource.Identifier.toString(identifier)} deserialized from JSON\`))) })`;
    }
  }

  export class OptionalObjectType<
    ResolvedTypeT extends OptionType<ObjectType | ObjectUnionType>,
    StubTypeT extends OptionType<ObjectType | ObjectUnionType>,
  > extends SingleObjectType<ResolvedTypeT, StubTypeT> {
    constructor({
      resolvedType,
      stubType,
    }: { resolvedType: ResolvedTypeT; stubType: StubTypeT }) {
      super({
        resolvedType,
        runtimeClass: {
          name: `${syntheticNamePrefix}LazyOptionalObject<${resolvedType.itemType.identifierTypeAlias}, ${resolvedType.itemType.name}, ${stubType.itemType.name}>`,
          rawName: `${syntheticNamePrefix}LazyOptionalObject`,
          snippetDeclaration: SnippetDeclarations.LazyOptionalObject,
          stubPropertyName: "stub",
        },
        stubType,
      });
    }

    @Memoize()
    override get conversions(): readonly _Type.Conversion[] {
      const conversions = super.conversions.concat();

      if (this.stubType.itemType.kind === "ObjectType") {
        conversions.push(
          {
            conversionExpression: (value) =>
              `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: ${value}.map(object => ${(this.stubType.itemType as ObjectType).newExpression({ parameters: "object" })}), resolver: async () => purify.Either.of((${value} as purify.Maybe<${this.resolvedType.itemType.name}>).unsafeCoerce()) })`,
            sourceTypeCheckExpression: (value) =>
              `purify.Maybe.isMaybe(${value})`,
            sourceTypeName: `purify.Maybe<${this.resolvedType.itemType.name}>`,
          },
          {
            conversionExpression: (value) =>
              `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: purify.Maybe.of(${(this.stubType.itemType as ObjectType).newExpression({ parameters: value })}), resolver: async () => purify.Either.of(${value} as ${this.resolvedType.itemType.name}) })`,
            sourceTypeCheckExpression: (value) =>
              `typeof ${value} === "object"`,
            sourceTypeName: this.resolvedType.itemType.name,
          },
        );
      } else if (
        this.resolvedType.itemType.kind === "ObjectUnionType" &&
        this.stubType.itemType.kind === "ObjectUnionType" &&
        this.resolvedType.itemType.memberTypes.length ===
          this.stubType.itemType.memberTypes.length
      ) {
        const maybeMap = `.map(object => { ${stubObjectUnionTypeToResolvedObjectUnionTypeSwitchStatement({ resolvedObjectUnionType: this.resolvedType.itemType as ObjectUnionType, stubObjectUnionType: this.stubType.itemType as ObjectUnionType, variables: { value: "object" } })} })`;

        conversions.push(
          {
            conversionExpression: (value) =>
              `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: ${value}${maybeMap}, resolver: async () => purify.Either.of((${value} as purify.Maybe<${this.resolvedType.itemType.name}>).unsafeCoerce()) })`,
            sourceTypeCheckExpression: (value) =>
              `purify.Maybe.isMaybe(${value})`,
            sourceTypeName: `purify.Maybe<${this.resolvedType.itemType.name}>`,
          },
          {
            conversionExpression: (value) =>
              `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: purify.Maybe.of(${value})${maybeMap}, resolver: async () => purify.Either.of(${value} as ${this.resolvedType.itemType.name}) })`,
            sourceTypeCheckExpression: (value) =>
              `typeof ${value} === "object"`,
            sourceTypeName: this.resolvedType.itemType.name,
          },
        );
      }

      conversions.push({
        conversionExpression: () =>
          `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: purify.Maybe.empty(), resolver: async () => { throw new Error("should never be called"); } })`,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "undefined"`,
        sourceTypeName: "undefined",
      });

      return conversions;
    }

    override fromRdfExpression(
      parameters: Parameters<_Type["fromRdfExpression"]>[0],
    ): string {
      const { variables } = parameters;
      return `${this.stubType.fromRdfExpression(parameters)}.map(${this.runtimeClass.stubPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}, resolver: (identifier) => ${variables.objectSet}.${this.resolvedType.itemType.objectSetMethodNames.object}(identifier) }))`;
    }

    override graphqlResolveExpression(
      parameters: Parameters<_Type["graphqlResolveExpression"]>[0],
    ): string {
      return `${super.graphqlResolveExpression(parameters)}.extractNullable()`;
    }
  }

  export class RequiredObjectType<
    ResolvedTypeT extends ObjectType | ObjectUnionType,
    StubTypeT extends ObjectType | ObjectUnionType,
  > extends SingleObjectType<ResolvedTypeT, StubTypeT> {
    constructor({
      resolvedType,
      stubType,
    }: { resolvedType: ResolvedTypeT; stubType: StubTypeT }) {
      super({
        resolvedType,
        runtimeClass: {
          name: `${syntheticNamePrefix}LazyRequiredObject<${resolvedType.identifierTypeAlias}, ${resolvedType.name}, ${stubType.name}>`,
          rawName: `${syntheticNamePrefix}LazyRequiredObject`,
          snippetDeclaration: SnippetDeclarations.LazyRequiredObject,
          stubPropertyName: "stub",
        },
        stubType,
      });
    }

    override get conversions(): readonly _Type.Conversion[] {
      const conversions = super.conversions.concat();

      if (this.stubType.kind === "ObjectType") {
        conversions.push({
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: ${(this.stubType as ObjectType).newExpression({ parameters: value })}, resolver: async () => purify.Either.of(${value} as ${this.resolvedType.name}) })`,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "object" && ${value} instanceof ${this.resolvedType.name}`,
          sourceTypeName: this.resolvedType.name,
        });
      } else if (
        this.resolvedType.kind === "ObjectUnionType" &&
        this.stubType.kind === "ObjectUnionType" &&
        this.resolvedType.memberTypes.length ===
          this.stubType.memberTypes.length
      ) {
        conversions.push({
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}: ((object: ${this.resolvedType.name}) => { ${stubObjectUnionTypeToResolvedObjectUnionTypeSwitchStatement({ resolvedObjectUnionType: this.resolvedType as ObjectUnionType, stubObjectUnionType: this.stubType as ObjectUnionType, variables: { value: "object" } })} })(${value}), resolver: async () => purify.Either.of(${value} as ${this.resolvedType.name}) })`,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "object" && ${value} instanceof ${this.resolvedType.name}`,
          sourceTypeName: this.resolvedType.name,
        });
      }

      return conversions;
    }

    override fromRdfExpression(
      parameters: Parameters<_Type["fromRdfExpression"]>[0],
    ): string {
      const { variables } = parameters;
      return `${this.stubType.fromRdfExpression(parameters)}.map(${this.runtimeClass.stubPropertyName} => new ${this.runtimeClass.name}({ ${this.runtimeClass.stubPropertyName}, resolver: (identifier) => ${variables.objectSet}.${this.resolvedType.objectSetMethodNames.object}(identifier) }))`;
    }
  }
}
