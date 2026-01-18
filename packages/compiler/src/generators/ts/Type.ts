import type { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { TsFeature } from "../../enums/TsFeature.js";
import type { Import } from "./Import.js";
import type { Sparql } from "./Sparql.js";

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
   * A function (reference or declaration) that takes a filter of filterType (below) and a value of this type
   * and returns true if the value passes the filter.
   */
  readonly filterFunction: string;

  /**
   * Type of another type for filtering instances of this type e.g., SomeObject.Filter with filters for each property.
   */
  readonly filterType:
    | Type.CompositeFilterType
    | Type.CompositeFilterTypeReference;

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
   * Snippets should be named in order to facilitate deduplication. A snippet should usually be a single declaration (e.g.,
   * a function or a type) and the snippet's name should be the name of that declaration.
   */
  snippetDeclarations(parameters: {
    features: ReadonlySet<TsFeature>;
    recursionStack: Type[];
  }): Readonly<Record<string, string>>;

  /**
   * An array of SPARQL.js CONSTRUCT template triples for a value of this type, as strings (so they can incorporate runtime calls).
   *
   * Parameters:
   *   allowIgnoreRdfType: respect ignoreRdfType passed in at runtime
   *   variables: runtime variables
   *     - valueVariable: rdfjs.Variable of the value of this type, usually the object of the basic triple
   *     - variablePrefix: prefix to use for variables
   */
  sparqlConstructTriples(parameters: {
    allowIgnoreRdfType: boolean;
    variables: {
      valueVariable: string;
      variablePrefix: string;
    };
  }): readonly (Sparql.Triple | string)[];

  /**
   * An array of SPARQL.js WHERE patterns for a value of this type, as strings (so they can incorporate runtime calls).
   *
   * Parameters:
   *   allowIgnoreRdfType: respect ignoreRdfType passed in at runtime
   *   propertyPattern: if Just, should be included in the patterns for this type
   *   variables: (at runtime)
   *     - filter: if Just, an instance of filterType or undefined
   *     - preferredLanguages: array of preferred language code (strings)
   *     - valueVariable: rdfjs.Variable of the value of this type
   *     - variablePrefix: prefix to use for new variables
   */
  sparqlWherePatterns(parameters: {
    allowIgnoreRdfType: boolean;
    propertyPatterns: readonly Sparql.Pattern[];
    variables: {
      filter: Maybe<string>;
      preferredLanguages: string;
      valueVariable: string;
      variablePrefix: string;
    };
  }): readonly Sparql.Pattern[];

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
    constructor(readonly properties: Readonly<Record<string, FilterType>>) {
      invariant(Object.entries(properties).length > 0);
    }

    @Memoize()
    get name(): string {
      return `{ ${Object.entries(this.properties)
        .map(
          ([propertyName, propertyFilterType]) =>
            `readonly "${propertyName}"?: ${propertyFilterType.name};`,
        )
        .join(" ")} }`;
    }
  }

  export class CompositeFilterTypeReference {
    constructor(readonly reference: string) {}

    get name(): string {
      return this.reference;
    }
  }

  export class ScalarFilterType {
    constructor(readonly name: string) {}
  }

  export type FilterType =
    | CompositeFilterType
    | CompositeFilterTypeReference
    | ScalarFilterType;

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
