import { Maybe } from "purify-ts";
import type { OptionalKind, PropertySignatureStructure } from "ts-morph";
import { Memoize } from "typescript-memoize";

import type { TsFeature } from "../../../enums/TsFeature.js";
import { Import } from "../Import.js";
import type { ObjectType } from "../ObjectType.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import type { OptionType } from "../OptionType.js";
import { SetType } from "../SetType.js";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { ShaclProperty } from "./ShaclProperty.js";

export class LazyShaclProperty<
  EagerTypeT extends LazyShaclProperty.Type.EagerType,
> extends ShaclProperty<LazyShaclProperty.Type<EagerTypeT>> {
  override readonly mutable = false;
  override readonly recursive = false;

  override get graphqlField(): ShaclProperty<
    LazyShaclProperty.Type<EagerTypeT>
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
    ShaclProperty<LazyShaclProperty.Type<EagerTypeT>>["constructorStatements"]
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

    const conversionBranches: string[] = [
      `if (typeof ${variables.parameter} === "function") { ${lhs} = ${variables.parameter}; }`,
    ];
    for (const conversion of this.type.conversions) {
      conversionBranches.push(
        `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { const ${syntheticNamePrefix}${this.name}Capture = ${conversion.conversionExpression(variables.parameter)}; ${lhs} = async () => purify.Either.of(${syntheticNamePrefix}${this.name}Capture); }`,
      );
    }
    // We shouldn't need this else, since the parameter now has the never type, but have to add it to appease the TypeScript compiler
    conversionBranches.push(
      `{ ${lhs} = (${variables.parameter}) satisfies never; }`,
    );
    statements.push(conversionBranches.join(" else "));

    return statements;
  }

  override fromJsonStatements(): readonly string[] {
    return [
      `const ${this.name} = () => Promise.resolve(purify.Left<Error, ${this.type.name}>(new Error("cannot deserialize lazy properties from JSON")));`,
    ];
  }

  override fromRdfStatements(
    _parameters: Parameters<
      ShaclProperty<LazyShaclProperty.Type<EagerTypeT>>["fromRdfStatements"]
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
    ShaclProperty<LazyShaclProperty.Type<EagerTypeT>>["jsonZodSchema"]
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
  export class Type<EagerTypeT extends Type.EagerType> {
    readonly mutable = false;
    readonly eagerType: EagerTypeT;

    constructor({
      eagerType,
    }: {
      eagerType: EagerTypeT;
    }) {
      this.eagerType = eagerType;
    }

    get conversions() {
      return this.eagerType.conversions;
    }

    @Memoize()
    get equalsFunction(): string {
      return `${syntheticNamePrefix}alwaysEquals`;
    }

    @Memoize()
    get name(): string {
      // Use extra parentheses so the function type can be safely |'d with other types. Without the parentheses the | associates with the return type of the function,
      // not the function as a whole.
      if (this.eagerType instanceof SetType) {
        return `((parameters: { limit: number; offset: number }) => Promise<purify.Either<Error, ${this.eagerType.name}>>)`;
      }
      return `(() => Promise<purify.Either<Error, ${this.eagerType.name}>>)`;
    }

    snippetDeclarations(
      parameters: Parameters<EagerTypeT["snippetDeclarations"]>[0],
    ): readonly string[] {
      return this.eagerType
        .snippetDeclarations(parameters)
        .concat(SnippetDeclarations.alwaysEquals);
    }

    useImports(parameters: {
      features: Set<TsFeature>;
    }): readonly Import[] {
      return this.eagerType.useImports(parameters).concat(Import.PURIFY);
    }
  }

  export namespace Type {
    export type EagerType =
      | ObjectType
      | ObjectUnionType
      | OptionType<ObjectType | ObjectUnionType>
      | SetType<ObjectType | ObjectUnionType>;
  }
}
