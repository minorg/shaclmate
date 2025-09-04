import { Maybe } from "purify-ts";
import type { OptionalKind, PropertySignatureStructure } from "ts-morph";
import { Memoize } from "typescript-memoize";

import { Import } from "../Import.js";
import type { ObjectType } from "../ObjectType.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import type { OptionType } from "../OptionType.js";
import { SetType } from "../SetType.js";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { ShaclProperty } from "./ShaclProperty.js";

export class LazyShaclProperty<
  TypeT extends LazyShaclProperty.Type,
> extends ShaclProperty<TypeT> {
  override readonly mutable = false;
  override readonly recursive = false;

  @Memoize()
  override get constructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    let hasQuestionToken = false;
    const typeNames = new Set<string>(); // Remove duplicates with a set
    typeNames.add(this.typeName);
    for (const conversion of this.type.conversions) {
      if (conversion.sourceTypeName === "undefined") {
        hasQuestionToken = true;
      } else {
        typeNames.add(conversion.sourceTypeName);
      }
    }

    return Maybe.of({
      hasQuestionToken,
      isReadonly: true,
      leadingTrivia: this.declarationComment,
      name: this.name,
      type: [...typeNames].sort().join(" | "),
    });
  }

  @Memoize()
  override get declarationImports(): readonly Import[] {
    return super.declarationImports.concat(Import.PURIFY);
  }

  @Memoize()
  override get equalsFunction(): string {
    return `${syntheticNamePrefix}alwaysEquals`;
  }

  override get graphqlField(): ShaclProperty<TypeT>["graphqlField"] {
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

  @Memoize()
  protected override get typeName(): string {
    if (this.type instanceof SetType) {
      return `(parameters: { limit: number; offset: number }) => Promise<Either<Error, ${this.type.name}>>`;
    }
    return `() => Promise<Either<Error, ${this.type.name}>>`;
  }

  override constructorStatements({
    variables,
  }: Parameters<
    ShaclProperty<TypeT>["constructorStatements"]
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
        `if (${conversion.sourceTypeCheckExpression(variables.parameter)}) { ${lhs} = async () => ${conversion.conversionExpression(variables.parameter)}; }`,
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
      `const ${this.name} = () => Promise.resolve(purify.Left<Error, ${this.type.name}>(new Error("cannot deserialize lazy properties from JSON"));`,
    ];
  }

  override fromRdfStatements(
    _parameters: Parameters<ShaclProperty<TypeT>["fromRdfStatements"]>[0],
  ): readonly string[] {
    return [];
  }

  override hashStatements(): readonly string[] {
    return [];
  }

  override jsonUiSchemaElement(): Maybe<string> {
    return Maybe.empty();
  }

  override jsonZodSchema(): ReturnType<ShaclProperty<TypeT>["jsonZodSchema"]> {
    return Maybe.empty();
  }

  override snippetDeclarations(
    parameters: Parameters<ShaclProperty<TypeT>["snippetDeclarations"]>[0],
  ): readonly string[] {
    return super
      .snippetDeclarations(parameters)
      .concat(SnippetDeclarations.alwaysEquals);
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
  export type Type =
    | ObjectType
    | ObjectUnionType
    | OptionType<ObjectType | ObjectUnionType>
    | SetType<ObjectType | ObjectUnionType>;
}
