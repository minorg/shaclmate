import type { Maybe, NonEmptyList } from "purify-ts";
import { type Code, code, literalOf } from "ts-poet";
import { Memoize } from "typescript-memoize";
import type { TsFeature } from "../../enums/index.js";
import type { Typeof } from "./Typeof.js";

/**
 * Abstract base class all types.
 */
export abstract class AbstractType {
  /**
   * Comment from rdfs:comment.
   */
  readonly comment: Maybe<string>;

  /**
   * Expressions that convert a source type or types to this type. It should include the type itself.
   */
  abstract readonly conversions: readonly AbstractType.Conversion[];

  /**
   * A property that discriminates sub-types of this type e.g., termType on RDF/JS terms.
   */
  abstract readonly discriminantProperty: Maybe<AbstractType.DiscriminantProperty>;

  /**
   * A function (reference or declaration) that compares two property values of this type, returning a
   * $EqualsResult.
   */
  abstract readonly equalsFunction: Code;

  /**
   * A function (reference or declaration) that takes a filter of filterType (below) and a value of this type
   * and returns true if the value passes the filter.
   */
  abstract readonly filterFunction: Code;

  /**
   * Composite type for filtering instances of this type e.g., SomeObject.Filter with filters for each property.
   */
  abstract readonly filterType: Code;

  /**
   * Declarations for GraphQL arguments to pass to this the graphqlResolveExpression.
   */
  abstract readonly graphqlArgs: Maybe<
    Record<
      string,
      {
        type: Code;
      }
    >
  >;

  /**
   * GraphQL-compatible version of the type.
   */
  abstract readonly graphqlType: AbstractType.GraphqlType;

  /**
   * Type discriminator.
   */
  abstract readonly kind: string;

  /**
   * Label from rdfs:label.
   */
  readonly label: Maybe<string>;

  /**
   * Is a value of this type mutable?
   */
  abstract readonly mutable: boolean;

  /**
   * TypeScript name of the type.
   */
  abstract readonly name: Code;

  /**
   * TypeScript object describing this type, for runtime use.
   */
  abstract readonly schema: Code;

  /**
   * TypeScript type describing .schema.
   */
  abstract readonly schemaType: Code;

  /**
   * A SparqlWherePatternsFunction (reference or declaration) that returns an array of SparqlPattern's for a property of this type.
   *
   * The function takes a parameters object (type: SparqlWherePatternsFunctionParameters) with the following parameters:
   * - filter?: an instance of filterType
   * - preferredLanguages: array of preferred language code (strings); may be empty
   * - propertyPatterns: array of sparqljs.BgpPattern's for the property; may be empty
   * - schema: instance of this.schemaType
   * - valueVariable: rdfjs.Variable of the value of this type
   * - variablePrefix: prefix to use for new variables
   */
  abstract readonly sparqlWherePatternsFunction: Code;

  /**
   * JavaScript typeof(s) the type.
   */
  abstract readonly typeofs: NonEmptyList<Typeof>;

  constructor({
    comment,
    label,
  }: { comment: Maybe<string>; label: Maybe<string> }) {
    this.comment = comment;
    this.label = label;
  }

  /**
   * Helper to compose the result of schema along the type hierarchy.
   */
  protected get schemaObject() {
    return {
      kind: code`${literalOf(this.kind)} as const`,
    };
  }

  /**
   * An expression that converts this type's JSON type to a value of this type. It doesn't return a purify.Either because the JSON has
   * already been validated and converted to the expected JSON type with Zod.
   */
  abstract fromJsonExpression(parameters: {
    variables: {
      value: Code;
    };
  }): Code;

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
  abstract fromRdfExpression(parameters: {
    variables: {
      context: Code;
      ignoreRdfType?: boolean;
      objectSet: Code;
      preferredLanguages: Code;
      predicate: Code;
      resource: Code;
      resourceValues: Code;
    };
  }): Code;

  /**
   * An expression that resolves a value of this type in the GraphQL server.
   */
  abstract graphqlResolveExpression(parameters: {
    variables: {
      args: Code;
      value: Code;
    };
  }): Code;

  /**
   * Statements that use hasher.update to hash a property value of this type.
   */
  abstract hashStatements(parameters: {
    depth: number;
    variables: {
      hasher: Code;
      value: Code;
    };
  }): Code;

  /**
   * JSON-compatible version of the type.
   */
  abstract jsonType(parameters?: {
    includeDiscriminantProperty?: boolean;
  }): AbstractType.JsonType;

  /**
   * Element object for a JSON Forms UI schema.
   */
  abstract jsonUiSchemaElement(parameters: {
    variables: { scopePrefix: Code };
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
  abstract jsonZodSchema(parameters: {
    includeDiscriminantProperty?: boolean;
    context: "property" | "type";
    variables: { zod: Code };
  }): Code;

  /**
   * SPARQL.js CONSTRUCT template triples for a value of this type as a (runtime) array of sparqljs.Triple.
   *
   * Parameters:
   *   allowIgnoreRdfType: respect ignoreRdfType passed in at runtime
   *   variables: runtime variables
   *     - valueVariable: rdfjs.Variable of the value of this type, usually the object of the basic triple
   *     - variablePrefix: prefix to use for variables
   *
   * Returns a (runtime) array of sparqljs.Triple.
   */
  abstract sparqlConstructTriples(parameters: {
    allowIgnoreRdfType: boolean;
    variables: {
      valueVariable: Code;
      variablePrefix: Code;
    };
  }): Code;

  /**
   * An expression that converts a value of this type to a JSON-LD compatible value. It can assume the presence
   * of the correct JSON-LD context.
   */
  abstract toJsonExpression(parameters: {
    includeDiscriminantProperty?: boolean;
    variables: {
      value: Code;
    };
  }): Code;

  /**
   * An expression that converts a property value of this type to an array of values that can be .add'd to a rdfjsResource.MutableResource
   * (BlankNode | Literal | NamedNode | boolean | number | string)[].
   */
  abstract toRdfExpression(parameters: {
    variables: {
      predicate: Code;
      mutateGraph: Code;
      resource: Code;
      resourceSet: Code;
      value: Code;
    };
  }): Code;
}

export namespace AbstractType {
  export interface Conversion {
    readonly conversionExpression: (value: Code) => Code;
    readonly sourceTypeCheckExpression: (value: Code) => Code;
    readonly sourceTypeName: Code;
    readonly sourceTypeof: Typeof;
  }

  export interface DiscriminantProperty {
    readonly name: string;
    readonly ownValues: readonly string[];
    readonly descendantValues: readonly string[];
  }

  export class GraphqlType {
    /**
     * Is the type nullable in GraphQL?
     */
    readonly nullable: boolean;

    /**
     * The name of the type when it's nullable -- so it should never include "new graphql.GraphQLNonNull(...)" around it.
     */
    readonly nullableName: Code;

    constructor(nullableName: Code, parameters?: { nullable: boolean }) {
      this.nullable = !!parameters?.nullable;
      this.nullableName = nullableName;
    }

    @Memoize()
    get name(): Code {
      return this.nullable
        ? this.nullableName
        : code`new graphql.GraphQLNonNull(${this.nullableName})`;
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
    readonly requiredName: Code;

    constructor(
      requiredName: Code,
      parameters?: {
        optional: boolean;
      },
    ) {
      this.optional = !!parameters?.optional;
      this.requiredName = requiredName;
    }

    @Memoize()
    get name(): Code {
      return this.optional
        ? code`(${this.requiredName}) | undefined`
        : this.requiredName;
    }
  }
}
