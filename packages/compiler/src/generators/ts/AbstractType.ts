import type { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";

import type { TsFeature } from "../../enums/index.js";
import type { Import } from "./Import.js";
import { objectInitializer } from "./objectInitializer.js";
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
  abstract readonly graphqlType: Type.GraphqlType;
  abstract readonly mutable: boolean;
  abstract readonly name: string;
  abstract readonly typeofs: NonEmptyList<
    "boolean" | "object" | "number" | "string"
  >;

  abstract fromJsonExpression(parameters: {
    variables: {
      value: string;
    };
  }): string;

  abstract fromRdfExpression(parameters: {
    variables: {
      context: string;
      ignoreRdfType?: boolean;
      objectSet: string;
      preferredLanguages: string;
      predicate: string;
      resource: string;
      resourceValues: string;
    };
  }): string;

  abstract readonly graphqlArgs: Maybe<
    Record<
      string,
      {
        type: string;
      }
    >
  >;

  abstract graphqlResolveExpression(parameters: {
    variables: {
      args: string;
      value: string;
    };
  }): string;

  abstract hashStatements(parameters: {
    depth: number;
    variables: {
      hasher: string;
      value: string;
    };
  }): readonly string[];

  abstract jsonType(parameters?: {
    includeDiscriminantProperty?: boolean;
  }): Type.JsonType;

  abstract jsonUiSchemaElement(parameters: {
    variables: { scopePrefix: string };
  }): Maybe<string>;

  abstract jsonZodSchema(parameters: {
    includeDiscriminantProperty?: boolean;
    context: "property" | "type";
    variables: { zod: string };
  }): string;

  abstract snippetDeclarations(parameters: {
    features: ReadonlySet<TsFeature>;
    recursionStack: Type[];
  }): Readonly<Record<string, string>>;

  sparqlConstructChainTriples(
    _parameters: Parameters<Type["sparqlConstructChainTriples"]>[0],
  ): readonly string[] {
    return [];
  }

  sparqlConstructPropertyTriples({
    allowIgnoreRdfType,
    variables,
  }: Parameters<Type["sparqlConstructPropertyTriples"]>[0]): readonly string[] {
    const objectPrefix = "dataFactory.variable!(";
    const objectSuffix = ")";
    invariant(variables.object.startsWith(objectPrefix));
    invariant(variables.object.endsWith(objectSuffix));
    return [
      objectInitializer({
        object: variables.object,
        predicate: variables.predicate,
        subject: variables.subject,
      }),
    ].concat(
      this.sparqlConstructChainTriples({
        allowIgnoreRdfType,
        variables: {
          subject: variables.object,
          variablePrefix: variables.object.substring(
            objectPrefix.length,
            variables.object.length - objectSuffix.length,
          ),
        },
      }),
    );
  }

  sparqlWhereChainPatterns(
    _parameters: Parameters<Type["sparqlWhereChainPatterns"]>[0],
  ): readonly string[] {
    return [];
  }

  sparqlWherePropertyPatterns({
    allowIgnoreRdfType,
    variables,
  }: Parameters<Type["sparqlWherePropertyPatterns"]>[0]): readonly string[] {
    const objectPrefix = "dataFactory.variable!(";
    const objectSuffix = ")";
    invariant(variables.object.startsWith(objectPrefix));
    invariant(variables.object.endsWith(objectSuffix));
    return [
      objectInitializer({
        triples: `[${objectInitializer({
          object: variables.object,
          predicate: variables.predicate,
          subject: variables.subject,
        })}]`,
        type: '"bgp"',
      }),
    ].concat(
      this.sparqlWhereChainPatterns({
        allowIgnoreRdfType,
        variables: {
          preferredLanguages: variables.preferredLanguages,
          subject: variables.object,
          variablePrefix: variables.object.substring(
            objectPrefix.length,
            variables.object.length - objectSuffix.length,
          ),
        },
      }),
    );
  }

  abstract toJsonExpression(parameters: {
    includeDiscriminantProperty?: boolean;
    variables: {
      value: string;
    };
  }): string;

  abstract toRdfExpression(parameters: {
    variables: {
      predicate: string;
      mutateGraph: string;
      resource: string;
      resourceSet: string;
      value: string;
    };
  }): string;

  abstract useImports(parameters: {
    features: ReadonlySet<TsFeature>;
  }): readonly Import[];
}
