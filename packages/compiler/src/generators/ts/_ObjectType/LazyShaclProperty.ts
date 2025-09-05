import { Maybe } from "purify-ts";
import type { OptionalKind, PropertySignatureStructure } from "ts-morph";
import { Memoize } from "typescript-memoize";
import type { TsFeature } from "../../../enums/TsFeature.js";
import type { IdentifierType as _IdentifierType } from "../IdentifierType.js";
import { Import } from "../Import.js";
import type { ObjectType as ResultObjectType } from "../ObjectType.js";
import type { ObjectUnionType as ResultObjectUnionType } from "../ObjectUnionType.js";
import { OptionType } from "../OptionType.js";
import type { SetType } from "../SetType.js";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import type { Type as AbcType } from "../Type.js";
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
    LazyShaclProperty.Type<ResultTypeT>
  >["graphqlField"] {
    return Maybe.of({
      description: this.comment.map(JSON.stringify).extract(),
      name: this.name,
      // TODO: this probably won't work
      resolve: `(source) => ${this.type.graphqlResolveExpression({ variables: { value: `source.${this.name}` } })}`,
      type: this.type.graphqlName,
    });
  }

  override get jsonPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.empty();
  }

  override constructorStatements({
    variables,
  }: Parameters<
    ShaclProperty<LazyShaclProperty.Type<ResultTypeT>>["constructorStatements"]
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
      ShaclProperty<LazyShaclProperty.Type<ResultTypeT>>["fromRdfStatements"]
    >[0],
  ): readonly string[] {
    return [];
  }

  override hashStatements(): readonly string[] {
    return [];
  }

  override jsonUiSchemaElement(): Maybe<string> {
    return Maybe.empty();
  }

  override jsonZodSchema(): ReturnType<
    ShaclProperty<LazyShaclProperty.Type<ResultTypeT>>["jsonZodSchema"]
  > {
    return Maybe.empty();
  }

  override sparqlConstructTemplateTriples(): readonly string[] {
    return [];
  }

  override sparqlWherePatterns(): readonly string[] {
    return [];
  }

  override toJsonObjectMember(): Maybe<string> {
    return Maybe.empty();
  }

  override toRdfStatements(): readonly string[] {
    return [];
  }
}

export namespace LazyShaclProperty {
  export abstract class Type<
    IdentifierTypeT extends Type.IdentifierType,
    ResultTypeT extends Type.ResultType,
  > {
    readonly mutable = false;

    readonly identifierType: IdentifierTypeT;
    readonly resultType: ResultTypeT;
    readonly runtimeClass: {
      readonly name: string;
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
      this.identifierType = identifierType;
      this.resultType = resultType;
      this.runtimeClass = runtimeClass;
    }

    get conversions(): readonly AbcType.Conversion[] {
      return [
        {
          conversionExpression: (value) => value,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "object" && ${value} instanceof ${this.runtimeClass.name}`,
          sourceTypeName: this.name,
        } satisfies AbcType.Conversion,
      ].concat(this.resultType.conversions);
    }

    @Memoize()
    get equalsFunction(): string {
      return `${syntheticNamePrefix}alwaysEquals`;
    }

    get graphqlName(): string {
      return this.resultType.graphqlName;
    }

    graphqlResolveExpression(
      parameters: Parameters<AbcType["graphqlResolveExpression"]>[0],
    ): string {
      return this.resultType.graphqlResolveExpression(parameters);
    }

    @Memoize()
    get name(): string {
      return this.runtimeClass.name;
    }

    snippetDeclarations(
      parameters: Parameters<AbcType["snippetDeclarations"]>[0],
    ): readonly string[] {
      return this.resultType
        .snippetDeclarations(parameters)
        .concat(
          SnippetDeclarations.alwaysEquals,
          this.runtimeClass.snippetDeclaration,
        );
    }

    useImports(parameters: {
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

  export class ObjectType<
    ResultTypeT extends ResultObjectType | ResultObjectUnionType,
  > extends Type<_IdentifierType, ResultTypeT> {
    constructor(resultType: ResultTypeT) {
      super({
        identifierType: resultType.identifierType,
        resultType,
        runtimeClass: {
          name: `${syntheticNamePrefix}LazyObject`,
          snippetDeclaration: SnippetDeclarations.LazyObject,
        },
      });
    }
  }

  export class ObjectOptionType<
    ResultTypeT extends OptionType<ResultObjectType | ResultObjectUnionType>,
  > extends Type<ResultTypeT> {
    constructor(resultType: ResultTypeT) {
      super({
        identifierType: new OptionType({
          itemType: resultType.itemType.identifierType,
        }),
        resultType,
        runtimeClass: {
          name: `${syntheticNamePrefix}LazyObjectOption`,
          snippetDeclaration: SnippetDeclarations.LazyObjectOption,
        },
      });
    }
  }

  export class ObjectSetType<
    ResultTypeT extends SetType<ResultObjectType | ResultObjectUnionType>,
  > extends Type<ResultTypeT> {
    constructor(resultType: ResultTypeT) {
      super({
        resultType,
        runtimeClass: {
          name: `${syntheticNamePrefix}LazyObjectSet`,
          snippetDeclaration: SnippetDeclarations.LazyObjectSet,
        },
      });
    }
  }
}
