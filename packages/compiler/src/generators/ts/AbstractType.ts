import type { Maybe, NonEmptyList } from "purify-ts";

import type { Import } from "./Import.js";
import type { Sparql } from "./Sparql.js";
import type { Type } from "./Type.js";

/**
 * Abstract base class all types.
 */
export abstract class AbstractType implements Type {
  readonly comment: Maybe<string>;
  readonly label: Maybe<string>;

  constructor({
    comment,
    label,
  }: { comment: Maybe<string>; label: Maybe<string> }) {
    this.comment = comment;
    this.label = label;
  }

  abstract readonly conversions: readonly Type.Conversion[];
  abstract readonly discriminantProperty: Maybe<Type.DiscriminantProperty>;
  abstract readonly equalsFunction: string;
  abstract readonly filterFunction: string;
  abstract readonly filterType:
    | Type.CompositeFilterType
    | Type.CompositeFilterTypeReference;
  abstract readonly graphqlArgs: Maybe<
    Record<
      string,
      {
        type: string;
      }
    >
  >;
  abstract readonly graphqlType: Type.GraphqlType;
  abstract readonly mutable: boolean;
  abstract readonly name: string;
  abstract readonly typeofs: NonEmptyList<
    "boolean" | "object" | "number" | "string"
  >;

  abstract fromJsonExpression(
    parameters: Parameters<Type["fromJsonExpression"]>[0],
  ): string;

  abstract fromRdfExpression(
    parameters: Parameters<Type["fromRdfExpression"]>[0],
  ): string;

  abstract graphqlResolveExpression(
    parameters: Parameters<Type["graphqlResolveExpression"]>[0],
  ): string;

  abstract hashStatements(
    parameters: Parameters<Type["hashStatements"]>[0],
  ): readonly string[];

  abstract jsonType(
    parameters?: Parameters<Type["jsonType"]>[0],
  ): Type.JsonType;

  abstract jsonUiSchemaElement(
    parameters: Parameters<Type["jsonUiSchemaElement"]>[0],
  ): Maybe<string>;

  abstract jsonZodSchema(
    parameters: Parameters<Type["jsonZodSchema"]>[0],
  ): string;

  abstract snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>>;

  abstract sparqlConstructTriples(
    parameters: Parameters<Type["sparqlConstructTriples"]>[0],
  ): readonly (Sparql.Triple | string)[];

  abstract sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0],
  ): readonly Sparql.Pattern[];

  abstract toJsonExpression(
    parameters: Parameters<Type["toJsonExpression"]>[0],
  ): string;

  abstract toRdfExpression(
    parameters: Parameters<Type["toRdfExpression"]>[0],
  ): string;

  abstract useImports(
    parameters: Parameters<Type["useImports"]>[0],
  ): readonly Import[];
}
