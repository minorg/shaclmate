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

  override constructorStatements({
    variables,
  }: Parameters<
    ShaclProperty<
      LazyShaclProperty.Type<IdentifierTypeT, ResultTypeT>
    >["constructorStatements"]
  >[0]): readonly string[] {
    const typeConversions = this.type.conversions;
    if (typeConversions.length === 1) {
      switch (this.objectType.declarationType) {
        case "class":
          return [`this.${this.name} = ${variables.parameter};`];
        case "interface":
          return [`const ${this.name} = ${variables.parameter};`];
      }
    }

    let lhs: string;
    const statements: string[] = [];
    switch (this.objectType.declarationType) {
      case "class":
        lhs = `this.${this.name}`;
        break;
      case "interface":
        lhs = this.name;
        statements.push(`let ${this.name}: ${this.type.name};`);
        break;
    }

    statements.push(
      typeConversions
        .map((conversion, conversionI) => {
          if (conversionI === 0) {
            return `if (typeof ${variables.parameter} === "function") { ${lhs} = ${variables.parameter}; }`;
          }
          return `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { const ${syntheticNamePrefix}${this.name}Capture = ${conversion.conversionExpression(variables.parameter)}; ${lhs} = async () => purify.Either.of(${syntheticNamePrefix}${this.name}Capture); }`;
        })
        // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
        .concat(`{ ${lhs} = (${variables.parameter}) satisfies never; }`)
        .join(" else "),
    );

    return statements;
  }

  override fromRdfStatements(
    _parameters: Parameters<
      ShaclProperty<
        LazyShaclProperty.Type<IdentifierTypeT, ResultTypeT>
      >["fromRdfStatements"]
    >[0],
  ): readonly string[] {
    return [];
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
            `typeof ${value} === "object" && ${value} instanceof ${this.runtimeClass.name}`,
          sourceTypeName: this.name,
        } satisfies _Type.Conversion,
      ].concat(this.resultType.conversions);
    }

    @Memoize()
    override get equalsFunction(): string {
      return `((left, right) => ${this.identifierType.equalsFunction}(left.${this.runtimeClass.identifierPropertyName}, right.${this.runtimeClass.identifierPropertyName}))`;
    }

    override get graphqlName(): string {
      return this.resultType.graphqlName;
    }

    override fromJsonExpression(
      parameters: Parameters<_Type["fromJsonExpression"]>[0],
    ): string {
      return `new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: ${this.identifierType.fromJsonExpression(parameters)}, ${this.runtimeClass.objectMethodName}: (identifier) => Promise.resolve(purify.Left<Error, ${this.resultType.name}>(new Error(\`unable to resolve identifier \${rdfjsResource.Resource.Identifier.toString(identifier)} deserialized from JSON\`)) })`;
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

  export class RequiredObjectType<
    ResultTypeT extends ResultObjectType | ResultObjectUnionType,
  > extends Type<_IdentifierType, ResultTypeT> {
    constructor(resultType: ResultTypeT) {
      super({
        identifierType: resultType.identifierType,
        resultType,
        runtimeClass: {
          identifierPropertyName: "identifier",
          name: `${syntheticNamePrefix}LazyRequiredObject`,
          objectMethodName: "object",
          snippetDeclaration: SnippetDeclarations.LazyRequiredObject,
        },
      });
    }
  }

  export class OptionalObjectType<
    ResultTypeT extends OptionType<ResultObjectType | ResultObjectUnionType>,
  > extends Type<OptionType<_IdentifierType>, ResultTypeT> {
    constructor(resultType: ResultTypeT) {
      super({
        identifierType: new OptionType({
          itemType: resultType.itemType.identifierType,
        }),
        resultType,
        runtimeClass: {
          identifierPropertyName: "identifier",
          name: `${syntheticNamePrefix}LazyOptionalObject`,
          objectMethodName: "object",
          snippetDeclaration: SnippetDeclarations.LazyOptionalObject,
        },
      });
    }
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
          name: `${syntheticNamePrefix}LazyObjectSet`,
          objectMethodName: "objects",
          snippetDeclaration: SnippetDeclarations.LazyObjectSet,
        },
      });
    }

    override fromJsonExpression(
      parameters: Parameters<_Type["fromJsonExpression"]>[0],
    ): string {
      return `new ${this.runtimeClass.name}({ ${this.runtimeClass.identifierPropertyName}: ${this.identifierType.fromJsonExpression(parameters)}, ${this.runtimeClass.objectMethodName}: (identifiers) => Promise.resolve(purify.Left<Error, ${this.resultType.name}>(new Error(\`unable to resolve identifiers deserialized from JSON\`)) })`;
    }
  }
}
