import { Maybe } from "purify-ts";
import type { OptionalKind, PropertySignatureStructure } from "ts-morph";
import { Memoize } from "typescript-memoize";

import { SetType } from "generators/ts/SetType.js";
import { Import } from "../Import.js";
import type { ObjectType } from "../ObjectType.js";
import type { ObjectUnionType } from "../ObjectUnionType.js";
import type { OptionType } from "../OptionType.js";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { ShaclProperty } from "./ShaclProperty.js";

export class LazyShaclProperty<
  TypeT extends
    | ObjectType
    | ObjectUnionType
    | OptionType<ObjectType | ObjectUnionType>
    | SetType<ObjectType | ObjectUnionType>,
> extends ShaclProperty<TypeT> {
  override readonly mutable = false;
  override readonly recursive = false;

  @Memoize()
  override get declarationImports(): readonly Import[] {
    return super.declarationImports.concat(Import.PURIFY);
  }

  @Memoize()
  override get equalsFunction(): string {
    return `${syntheticNamePrefix}alwaysEquals`;
  }

  override get jsonPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.empty();
  }

  @Memoize()
  protected override get typeName(): string {
    if (this.type instanceof SetType) {
      return `(parameters: {limit: number; offset: number}) => Promise<Either<Error, ${this.type.name}>>`;
    }
    return `() => Promise<Either<Error, ${this.type.name}>>`;
  }

  override fromJsonStatements(): readonly string[] {
    return [
      `const ${this.name} = () => Promise.resolve(purify.Left<Error, ${this.type.name}>(new Error("cannot deserialize lazy properties from JSON"));`,
    ];
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
