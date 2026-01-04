import type { Maybe, NonEmptyList } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { TsFeature } from "../../enums/TsFeature.js";
import type { Import } from "./Import.js";

export interface Type {
  /**
   * Comment from rdfs:comment.
   */
  readonly comment: Maybe<string>;

  /**
   * Expressions that convert a source type or types to this type. It should include the type itself.
   */
  readonly conversions: readonly Type.Conversion[];

  /**
   * A property that discriminates sub-types of this type e.g., termType on RDF/JS terms.
   */
  readonly discriminantProperty: Maybe<Type.DiscriminantProperty>;

  /**
   * A function (reference or declaration) that compares two property values of this type, returning a
   * $EqualsResult.
   */
  readonly equalsFunction: string;

  /**
   * Type of another type for filtering instances of this type e.g., SomeObject.Filter with filters for each property.
   */
  readonly filterType: Type.CompositeFilterType;

  /**
   * GraphQL-compatible version of the type.
   */
  readonly graphqlType: Type.GraphqlType;

  /**
   * Label from rdfs:label.
   */
  readonly label: Maybe<string>;

  /**
   * Is a value of this type mutable?
   */
  readonly mutable: boolean;

  /**
   * TypeScript name of the type.
   */
  readonly name: string;

  /**
   * JavaScript typeof(s) the type.
   */
  readonly typeofs: NonEmptyList<"boolean" | "object" | "number" | "string">;

  /**
   * An expression that converts this type's JSON type to a value of this type. It doesn't return a purify.Either because the JSON has
   * already been validated and converted to the expected JSON type with Zod.
   */
  fromJsonExpression(parameters: {
    variables: {
      value: string;
    };
  }): string;

  /**
   * An expression that converts a purify.Either<Error, rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>> to a
   * purify.Either<Error, rdfjsResource.Resource.Values<this type>>.
   *
   * These expressions are used to deserialize property values in an ObjectType, either directly (a property with this Type) or indirectly (a property with a Type like OptionType
   * that has a type parameter of this Type).
   *
   * Some types need to filter on the set of all objects/values of a (subject, predicate). For example, all sh:hasValue values must be present in the set for any values
   * to be considered valid. Similar
   *
   * Values may also need to be sorted. For example, specifying preferredLanguages should sort the values in the order of the specified languages so that the first value
   * (if it exists) is always of the first preferred language.
   *
   * variables are runtime variables, most derived from the parameters of the ObjectType's fromRdf function:
   *   context: unanticipated properties (...) passed to Object.fromRdf
   *   ignoreRdfType: whether the RDF type of objects/object unions should be ignored
   *   objectSet: the ObjectSet passed to Object.fromRdf
   *   predicate: the predicate of the object's property
   *   preferredLanguages: the preferred languages array (e.g., ["en"]) passed to Object.fromRdf
   *   resource: the rdfjsResource.Resource passed to Object.fromRdf
   *   resourceValues: the purify.Either<Error, rdfjsResource.Resource.Values<rdfjsResource.Resource.TermValue>> to be converted to values of this type.
   */
  fromRdfExpression(parameters: {
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

  /**
   * Declarations for GraphQL arguments to pass to this the graphqlResolveExpression.
   */
  readonly graphqlArgs: Maybe<
    Record<
      string,
      {
        type: string;
      }
    >
  >;

  /**
   * An expression that resolves a value of this type in the GraphQL server.
   */
  graphqlResolveExpression(parameters: {
    variables: {
      args: string;
      value: string;
    };
  }): string;

  /**
   * Statements that use hasher.update to hash a property value of this type.
   */
  hashStatements(parameters: {
    depth: number;
    variables: {
      hasher: string;
      value: string;
    };
  }): readonly string[];

  /**
   * JSON-compatible version of the type.
   */
  jsonType(parameters?: {
    includeDiscriminantProperty?: boolean;
  }): Type.JsonType;

  /**
   * Element object for a JSON Forms UI schema.
   */
  jsonUiSchemaElement(parameters: {
    variables: { scopePrefix: string };
  }): Maybe<string>;

  /**
   * Zod schema for the JSON type of this type.
   *
   * This method is called in two contexts:
   * "property": from a ShaclProperty, while generating the z.object properties of an ObjectType
   * "type": from another Type e.g., an OptionType or UnionType
   *
   * z.lazy() should only be returned for "property".
   */
  jsonZodSchema(parameters: {
    includeDiscriminantProperty?: boolean;
    context: "property" | "type";
    variables: { zod: string };
  }): string;

  /**
   * Reusable function, type, and other declarations that are not particular to this type but that type-specific code
   * relies on. For example, the equals function/method of ObjectType has a custom return type that's the same across all
   * ObjectType's. Instead of re-declaring the return type anonymously on every equals function, declare a named type
   * as a snippet and reference it.
   *
   * The generator deduplicates snippet declarations across all types before adding them to the source.
   */
  snippetDeclarations(parameters: {
    features: ReadonlySet<TsFeature>;
    recursionStack: Type[];
  }): readonly string[];

  /**
   * An array of SPARQL.js CONSTRUCT template triples for a value of this type, as strings (so they can incorporate runtime calls).
   *
   * This method is called in two contexts:
   * (1) When an instance of the type is an "object" of a property.
   *     This method should return a BGP (variables.subject, variables.predicate, variables.object) and recursively call itself with the variables.object as a "subject" context.
   * (2) When an instance of the type is a "subject".
   *     For example, ListType calls this method to with the item variable as a subject in order to chain additional patterns on items. Term types with no additional patterns should return an empty array.
   */
  sparqlConstructTemplateTriples({
    allowIgnoreRdfType,
    context,
    variables,
  }:
    | {
        allowIgnoreRdfType: boolean;
        context: "object";
        variables: {
          object: string;
          predicate: string;
          subject: string;
          variablePrefix: string;
        };
      }
    | {
        allowIgnoreRdfType: boolean;
        context: "subject";
        variables: {
          subject: string;
          variablePrefix: string;
        };
      }): readonly string[];

  /**
   * An array of SPARQL.js where patterns for a value of this type, as strings (so they can incorporate runtime calls).
   *
   * See note in sparqlConstructTemplateTriples re: how this method is used.
   */
  sparqlWherePatterns({
    allowIgnoreRdfType,
    context,
    variables,
  }:
    | {
        allowIgnoreRdfType: boolean;
        context: "object";
        variables: {
          object: string;
          predicate: string;
          preferredLanguages: string;
          subject: string;
          variablePrefix: string;
        };
      }
    | {
        allowIgnoreRdfType: boolean;
        context: "subject";
        variables: {
          preferredLanguages: string;
          subject: string;
          variablePrefix: string;
        };
      }): readonly string[];

  /**
   * An expression that converts a value of this type to a JSON-LD compatible value. It can assume the presence
   * of the correct JSON-LD context.
   */
  toJsonExpression(parameters: {
    includeDiscriminantProperty?: boolean;
    variables: {
      value: string;
    };
  }): string;

  /**
   * An expression that converts a property value of this type to an array of values that can be .add'd to a rdfjsResource.MutableResource
   * (BlankNode | Literal | NamedNode | boolean | number | string)[].
   */
  toRdfExpression(parameters: {
    variables: {
      predicate: string;
      mutateGraph: string;
      resource: string;
      resourceSet: string;
      value: string;
    };
  }): string;

  /**
   * Imports necessary to use this type.
   */
  useImports(parameters: {
    features: ReadonlySet<TsFeature>;
  }): readonly Import[];
}

export namespace Type {
  export interface Conversion {
    readonly conversionExpression: (value: string) => string;
    readonly sourceTypeCheckExpression: (value: string) => string;
    readonly sourceTypeName: string;
  }

  export interface DiscriminantProperty {
    readonly name: string;
    readonly ownValues: readonly string[];
    readonly descendantValues: readonly string[];
  }

  export class CompositeFilterType {
    readonly properties: Readonly<Record<string, FilterType>>;

    constructor({
      properties,
    }: { properties: Readonly<Record<string, FilterType>> }) {
      this.properties = properties;
    }
  }

  export class ScalarFilterType {
    /**
     * Name of the GraphQL version of this type.
     */
    readonly graphqlName: string;

    /**
     * TypeScript name of this type.
     */
    readonly name: string;

    constructor({ graphqlName, name }: { graphqlName: string; name: string }) {
      this.graphqlName = graphqlName;
      this.name = name;
    }
  }

  export type FilterType = CompositeFilterType | ScalarFilterType;

  export class GraphqlType {
    /**
     * Is the type nullable in GraphQL?
     */
    readonly nullable: boolean;

    /**
     * The name of the type when it's nullable -- so it should never include "new graphql.GraphQLNonNull(...)" around it.
     */
    readonly nullableName: string;

    constructor(nullableName: string, parameters?: { nullable: boolean }) {
      this.nullable = !!parameters?.nullable;
      this.nullableName = nullableName;
    }

    @Memoize()
    get name(): string {
      return this.nullable
        ? this.nullableName
        : `new graphql.GraphQLNonNull(${this.nullableName})`;
    }
  }

  export class JsonType {
    /**
     * Is the type optional in JSON? Equivalent to ? in TypeScript or | undefined.
     */
    readonly optional: boolean;

    /**
     * The name of the type when it's required i.e. -- so it should never include "| undefined".
     */
    readonly requiredName: string;

    constructor(
      requiredName: string,
      parameters?: {
        optional: boolean;
      },
    ) {
      this.optional = !!parameters?.optional;
      this.requiredName = requiredName;
    }

    @Memoize()
    get name(): string {
      return this.optional
        ? `(${this.requiredName}) | undefined`
        : this.requiredName;
    }
  }
}
