import { Maybe } from "purify-ts";
import "ts-morph";
import { Memoize } from "typescript-memoize";

import type { TsFeature } from "../../../enums/TsFeature.js";
import type { IdentifierType as _IdentifierType } from "../IdentifierType.js";
import { Import } from "../Import.js";
import type { ObjectType as ResultObjectType } from "../ObjectType.js";
import type { ObjectUnionType as ResultObjectUnionType } from "../ObjectUnionType.js";
import { OptionType } from "../OptionType.js";
import { SetType } from "../SetType.js";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import { Type as _Type } from "../Type.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { ShaclProperty } from "./ShaclProperty.js";

export class LazyShaclProperty<
  IdentifierTypeT extends LazyShaclProperty.Type.IdentifierType,
  LazyTypeT extends LazyShaclProperty.Type<IdentifierTypeT, ResultTypeT>,
  ResultTypeT extends LazyShaclProperty.Type.ResultType,
> extends ShaclProperty<LazyTypeT> {
  override readonly mutable = false;
  override readonly recursive = false;

  override get graphqlField(): ShaclProperty<
    LazyShaclProperty.Type<IdentifierTypeT, ResultTypeT>
  >["graphqlField"] {
    return Maybe.of({
      description: this.comment.map(JSON.stringify).extract(),
      name: this.name,
      // TODO: this probably won't work
      resolve: `(source) => ${this.type.graphqlResolveExpression({ variables: { value: `source.${this.name}` } })}`,
      type: this.type.graphqlName,
    });
  }
}

export namespace LazyShaclProperty {
  export abstract class Type<
    IdentifierTypeT extends Type.IdentifierType,
    ResultTypeT extends Type.ResultType,
  > extends _Type {
    override readonly discriminatorProperty: _Type["discriminatorProperty"] =
      Maybe.empty();
    override readonly mutable = false;
    override readonly typeof = "object";

    protected readonly identifierType: IdentifierTypeT;
    protected readonly resultType: ResultTypeT;
    protected readonly runtimeClass: {
      readonly identifierPropertyName: string;
      readonly name: string;
      readonly objectMethodName: string;
      readonly rawName: string;
      readonly snippetDeclaration: string;
    };

    constructor({
      identifierType,
      resultType,
      runtimeClass,
    }: {
      identifierType: IdentifierTypeT;
      resultType: ResultTypeT;
      runtimeClass: Type<IdentifierTypeT, ResultTypeT>["runtimeClass"];
    }) {
      super();
      this.identifierType = identifierType;
      this.resultType = resultType;
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
      return `((left, right) => ${this.identifierType.equalsFunction}(left.${this.runtimeClass.identifierPropertyName}, right.${this.runtimeClass.identifierPropertyName}))`;
    }

    override get graphqlName(): string {
      return this.resultType.graphqlName;
    }

    override graphqlResolveExpression({
      variables,
    }: Parameters<_Type["graphqlResolveExpression"]>[0]): string {
      return `${variables.value}.${this.runtimeClass.objectMethodName}()`;
    }

    override hashStatements({
      depth,
      variables,
    }: Parameters<_Type["hashStatements"]>[0]): readonly string[] {
      return this.identifierType.hashStatements({
        depth: depth + 1,
        variables: {
          ...variables,
          value: `${variables.value}.${this.runtimeClass.identifierPropertyName}`,
        },
      });
    }

    override get jsonName(): string {
      return this.identifierType.jsonName;
    }

    override get jsonPropertySignature() {
      return this.identifierType.jsonPropertySignature;
    }

    override jsonUiSchemaElement(
      parameters: Parameters<_Type["jsonUiSchemaElement"]>[0],
    ): Maybe<string> {
      return this.identifierType.jsonUiSchemaElement(parameters);
    }

    override jsonZodSchema(
      parameters: Parameters<_Type["jsonZodSchema"]>[0],
    ): string {
      return this.identifierType.jsonZodSchema(parameters);
    }

    override get name(): string {
      return this.runtimeClass.name;
    }

    override snippetDeclarations(
      parameters: Parameters<_Type["snippetDeclarations"]>[0],
    ): readonly string[] {
      return this.identifierType
        .snippetDeclarations(parameters)
        .concat(this.resultType.snippetDeclarations(parameters))
        .concat(this.runtimeClass.snippetDeclaration);
    }

    override toJsonExpression({
      variables,
    }: Parameters<_Type["toJsonExpression"]>[0]): string {
      return this.identifierType.toJsonExpression({
        variables: {
          value: `${variables.value}.${this.runtimeClass.identifierPropertyName}`,
        },
      });
    }

    override toRdfExpression({
      variables,
    }: Parameters<_Type["toRdfExpression"]>[0]): string {
      return this.identifierType.toRdfExpression({
        variables: {
          ...variables,
          value: `${variables.value}.${this.runtimeClass.identifierPropertyName}`,
        },
      });
    }

    override useImports(parameters: {
      features: Set<TsFeature>;
    }): readonly Import[] {
      return this.resultType.useImports(parameters).concat(Import.PURIFY);
    }
  }

  export namespace Type {
    export type IdentifierType =
      | _IdentifierType
      | OptionType<_IdentifierType>
      | SetType<_IdentifierType>;

    export type ResultType =
      | ResultObjectType
      | ResultObjectUnionType
      | OptionType<ResultObjectType | ResultObjectUnionType>
      | SetType<ResultObjectType | ResultObjectUnionType>;
  }

  export class ObjectSetType<
    ResultTypeT extends SetType<ResultObjectType | ResultObjectUnionType>,
  > extends Type<SetType<_IdentifierType>, ResultTypeT> {
    constructor(resultType: ResultTypeT) {
      super({
        identifierType: new SetType({
          itemType: resultType.itemType.identifierType,
          minCount: 0,
          mutable: false,
        }),
        resultType,
        runtimeClass: {
          identifierPropertyName: "identifiers",
          name: `${syntheticNamePrefix}LazyObjectSet<${resultType.itemType.name}, ${resultType.itemType.identifierTypeAlias}>`,
          objectMethodName: "objects",
          rawName: `${syntheticNamePrefix}LazyObjectSet`,
          snippetDeclaration: SnippetDeclarations.LazyObjectSet,
        },
      });
    }

    @Memoize()
    override get conversions(): readonly _Type.Conversion[] {
      return super.conversions.concat(
        {
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: ${value}.map(_ => _.${syntheticNamePrefix}identifier), ${this.runtimeClass.objectMethodName}: async () => purify.Either.of(${value} as readonly ${this.resultType.itemType.name}[]) })`,
          sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
          sourceTypeName: `readonly ${this.resultType.itemType.name}[]`,
        },
        {
          conversionExpression: () =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: [], ${this.runtimeClass.objectMethodName}: async () => { throw new Error("should never be called"); } })`,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "undefined"`,
          sourceTypeName: "undefined",
        },
      );
    }

    override fromJsonExpression(
      parameters: Parameters<_Type["fromJsonExpression"]>[0],
    ): string {
      return `new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: ${this.identifierType.fromJsonExpression(parameters)}, ${this.runtimeClass.objectMethodName}: () => Promise.resolve(purify.Left(new Error("unable to resolve identifiers deserialized from JSON"))) })`;
    }

    override fromRdfExpression(
      parameters: Parameters<_Type["fromRdfExpression"]>[0],
    ): string {
      const { variables } = parameters;
      return `${this.identifierType.fromRdfExpression(parameters)}.map(identifiers => new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: identifiers, ${this.runtimeClass.objectMethodName}: (identifiers) => ${variables.objectSet}.${this.resultType.itemType.objectSetMethodNames.objects}({ where: { identifiers, type: "identifiers" }}) }))`;
    }
  }

  abstract class SingleObjectType<
    IdentifierTypeT extends Exclude<
      Type.IdentifierType,
      SetType<_IdentifierType>
    >,
    ResultTypeT extends Exclude<
      Type.ResultType,
      SetType<ResultObjectType | ResultObjectUnionType>
    >,
  > extends Type<IdentifierTypeT, ResultTypeT> {
    override fromJsonExpression(
      parameters: Parameters<_Type["fromJsonExpression"]>[0],
    ): string {
      return `new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: ${this.identifierType.fromJsonExpression(parameters)}, ${this.runtimeClass.objectMethodName}: (identifier) => Promise.resolve(purify.Left(new Error(\`unable to resolve identifier \${rdfjsResource.Resource.Identifier.toString(identifier)} deserialized from JSON\`))) })`;
    }
  }

  export class OptionalObjectType<
    ResultTypeT extends OptionType<ResultObjectType | ResultObjectUnionType>,
  > extends SingleObjectType<OptionType<_IdentifierType>, ResultTypeT> {
    constructor(resultType: ResultTypeT) {
      super({
        identifierType: new OptionType({
          itemType: resultType.itemType.identifierType,
        }),
        resultType,
        runtimeClass: {
          identifierPropertyName: "identifier",
          name: `${syntheticNamePrefix}LazyOptionalObject<${resultType.itemType.name}, ${resultType.itemType.identifierTypeAlias}>`,
          objectMethodName: "object",
          rawName: `${syntheticNamePrefix}LazyOptionalObject`,
          snippetDeclaration: SnippetDeclarations.LazyOptionalObject,
        },
      });
    }

    @Memoize()
    override get conversions(): readonly _Type.Conversion[] {
      return super.conversions.concat(
        {
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: purify.Maybe.of(${value}.${syntheticNamePrefix}identifier), ${this.runtimeClass.objectMethodName}: async () => purify.Either.of(${value} as ${this.resultType.itemType.name}) })`,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "object" && ${value} instanceof ${this.resultType.itemType.name}`,
          sourceTypeName: this.resultType.itemType.name,
        },
        {
          conversionExpression: (value) =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: ${value}.map(_ => _.${syntheticNamePrefix}identifier), ${this.runtimeClass.objectMethodName}: async () => purify.Either.of((${value} as purify.Maybe<${this.resultType.itemType.name}>).unsafeCoerce()) })`,
          sourceTypeCheckExpression: (value) =>
            `purify.Maybe.isMaybe(${value})`,
          sourceTypeName: `purify.Maybe<${this.resultType.itemType.name}>`,
        },
        {
          conversionExpression: () =>
            `new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: purify.Maybe.empty(), ${this.runtimeClass.objectMethodName}: async () => { throw new Error("should never be called"); } })`,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "undefined"`,
          sourceTypeName: "undefined",
        },
      );
    }

    override fromRdfExpression(
      parameters: Parameters<_Type["fromRdfExpression"]>[0],
    ): string {
      const { variables } = parameters;
      return `${this.identifierType.fromRdfExpression(parameters)}.map(identifier => new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: identifier, ${this.runtimeClass.objectMethodName}: (identifier) => ${variables.objectSet}.${this.resultType.itemType.objectSetMethodNames.object}(identifier) }))`;
    }
  }

  export class RequiredObjectType<
    ResultTypeT extends ResultObjectType | ResultObjectUnionType,
  > extends SingleObjectType<_IdentifierType, ResultTypeT> {
    constructor(resultType: ResultTypeT) {
      super({
        identifierType: resultType.identifierType,
        resultType,
        runtimeClass: {
          identifierPropertyName: "identifier",
          name: `${syntheticNamePrefix}LazyRequiredObject<${resultType.name}, ${resultType.identifierTypeAlias}>`,
          objectMethodName: "object",
          rawName: `${syntheticNamePrefix}LazyRequiredObject`,
          snippetDeclaration: SnippetDeclarations.LazyRequiredObject,
        },
      });
    }

    override get conversions(): readonly _Type.Conversion[] {
      return super.conversions.concat({
        conversionExpression: (value) =>
          `new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: ${value}.${syntheticNamePrefix}identifier, ${this.runtimeClass.objectMethodName}: async () => purify.Either.of(${value} as ${this.resultType.name}) })`,
        sourceTypeCheckExpression: (value) =>
          `typeof ${value} === "object" && ${value} instanceof ${this.resultType.name}`,
        sourceTypeName: this.resultType.name,
      });
    }

    override fromRdfExpression(
      parameters: Parameters<_Type["fromRdfExpression"]>[0],
    ): string {
      const { variables } = parameters;
      return `${this.identifierType.fromRdfExpression(parameters)}.map(identifier => new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: identifier, ${this.runtimeClass.objectMethodName}: (identifier) => ${variables.objectSet}.${this.resultType.objectSetMethodNames.object}(identifier) }))`;
    }
  }
}
