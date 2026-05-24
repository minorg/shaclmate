import type { Maybe } from "purify-ts";
import type { Logger } from "ts-log";
import { Memoize } from "typescript-memoize";

import type { Reusables } from "./Reusables.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { TsGenerator } from "./TsGenerator.js";
import type { Typeof } from "./Typeof.js";
import { type Code, code, literalOf } from "./ts-poet-wrapper.js";

/**
 * Abstract base class all types.
 */
export abstract class AbstractType {
  protected readonly configuration: TsGenerator.Configuration;
  protected readonly logger: Logger;
  protected readonly reusables: Reusables;

  /**
   * Comment from rdfs:comment.
   */
  readonly comment: Maybe<string>;

  /**
   * Function that takes a value of one or more source types to this type and returns Either<Error, ThisType>.
   *
   * The source types should include this type.
   *
   * The function should not perform validation (e.g., checking array lengths). That will be done by validationFunction in conjunction with this function.
   *
   * If unspecified, uses an identity function (i.e., function identity(value: ThisType): Either<Error, ThisType>).
   */
  abstract readonly conversionFunction: Maybe<AbstractType.ConversionFunction>;

  /**
   * The declaration of named types.
   */
  abstract readonly declaration: Maybe<Code>;

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
   * A function (reference or declaration) that takes a  Hasher and a value of this type, calls hasher.update on the value, and returns the Hasher.
   */
  abstract readonly hashFunction: Code;

  /**
   * Type discriminant.
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
  abstract readonly name: Code | string;

  /**
   * Does this type directly or indirectly reference itself?
   */
  abstract readonly recursive: boolean;

  /**
   * TypeScript object describing this type, for runtime use.
   */
  abstract readonly schema: Code;

  /**
   * TypeScript type describing .schema.
   */
  abstract readonly schemaType: Code;

  /**
   * The type(s) of the array elements produced by the toRdfResourceValuesExpression.
   */
  abstract readonly toRdfResourceValueTypes: ReadonlySet<
    "BlankNode" | "NamedNode" | "Literal"
  >;

  /**
   * JavaScript typeof(s) the type.
   */
  abstract readonly typeofs: readonly Typeof[];

  /**
   * Function that takes
   * - a schema of this.schemaType
   * - a value of this.type
   *
   * and validates the value against the schema, returning
   * - Left(Error) if validation fails or
   * - Right(the value) if validatios succeeds
   *
   * If unspecified, uses an identity function (i.e., function identity(schema: unknown, value: ThisType): Either<Error, ThisType>).
   */
  abstract readonly validationFunction: Maybe<Code>;

  /**
   * A ValueSparqlConstructTriplesFunction (reference or declaration) that returns an array of sparqljs.Triple's for a property value of this type.
   *
   * The function takes a parameters object with the following parameters:
   * - filter: an instance of filterType | undefined
   * - ignoreRdfType: boolean
   * - schema: instance of this.schemaType
   * - valueVariable: rdfjs.Variable of the value of this type
   * - variablePrefix: string prefix to use for new variables
   */
  abstract readonly valueSparqlConstructTriplesFunction: Code;

  /**
   * A ValueSparqlWherePatternsFunction (reference or declaration) that returns an array of SparqlPattern's for a property value of this type.
   *
   * The function takes a parameters object with the following parameters:
   * - filter: an instance of filterType | undefined
   * - preferredLanguages: array of preferred language code (strings) | undefined
   * - propertyPatterns: array of sparqljs.Pattern's for the property; may be empty
   * - schema: instance of this.schemaType
   * - valueVariable: rdfjs.Variable of the value of this type
   * - variablePrefix: string prefix to use for new variables
   */
  abstract readonly valueSparqlWherePatternsFunction: Code;

  constructor({
    comment,
    configuration,
    label,
    logger,
    reusables,
  }: {
    comment: Maybe<string>;
    configuration: TsGenerator.Configuration;
    label: Maybe<string>;
    logger: Logger;
    reusables: Reusables;
  }) {
    this.comment = comment;
    this.configuration = configuration;
    this.label = label;
    this.logger = logger;
    this.reusables = reusables;
    this.rdfjsTermExpression = rdfjsTermExpression.bind({
      imports: this.reusables.imports,
      logger: this.logger,
      snippets: this.reusables.snippets,
    });
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
   * An expression that converts this type's JSON type to an Either<Error, ThisType>.
   */
  abstract fromJsonExpression(parameters: {
    variables: {
      value: Code;
    };
  }): Code;

  /**
   * An expression that converts a Either<Error, rdfjsResource.Resource.Values> to a
   * Either<Error, rdfjsResource.Resource.Values<this type>>.
   *
   * These expressions are used to deserialize property values in an NamedObjectType, either directly (a property with this Type) or indirectly (a property with a Type like OptionType
   * that has a type parameter of this Type).
   *
   * Some types need to filter on the set of all objects/values of a (subject, predicate). For example, all sh:hasValue values must be present in the set for any values
   * to be considered valid. Similar
   *
   * Values may also need to be sorted. For example, specifying preferredLanguages should sort the values in the order of the specified languages so that the first value
   * (if it exists) is always of the first preferred language.
   *
   * variables are runtime variables, most derived from the parameters of the NamedObjectType's fromRdf function:
   *   context: unanticipated properties (...) passed to Object.fromRdf
   *   graph: DefaultGraph | NamedNode | undefined to match (subject, predicate, object) triples in; if undefined, match triples in all graphs
   *   ignoreRdfType: whether the RDF type of objects/object unions should be ignored
   *   objectSet: the ObjectSet passed to Object.fromRdf
   *   preferredLanguages: the preferred languages array (e.g., ["en"]) passed to Object.fromRdf
   *   propertyPath: the PropertyPath of the object's property
   *   resource: the Resource passed to Object.fromRdf
   *   resourceValues: the Either<Error, rdfjsResource.Resource.Values> to be converted to values of this type
   */
  abstract fromRdfResourceValuesExpression(parameters: {
    variables: {
      context: Code;
      graph: Code;
      ignoreRdfType?: boolean;
      objectSet: Code;
      preferredLanguages: Code;
      propertyPath: Code;
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
   * Zod schema for the JSON type of this type.
   *
   * This method is called in two contexts:
   * "property": from a ShaclProperty, while generating the z.object properties of an NamedObjectType
   * "type": from another Type e.g., an OptionType or UnionType
   *
   * z.lazy() should only be returned for "property".
   */
  abstract jsonSchema(parameters: {
    includeDiscriminantProperty?: boolean;
    context: "property" | "type";
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
  }): Maybe<Code>;

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
   * An expression that converts a property value of this type to a value or an array of values that can be .add'd to a Resource with
   *   resource.add(predicate, convertedValue, graph)
   *
   * variables are runtime variables, most derived from the parameters of the NamedObjectType's fromRdf function:
   *   graph: DefaultGraph | NamedNode | undefined to .add to; if undefined, add to the default graph
   *   propertyPath: predicate path (NamedNode) or InversePath on a predicate path
   *   resource: the Resource to .add to
   *   resourceSet: ResourceSet for any new Resources needed while conversion (of e.g., nested objects)
   *   value: value of this type, to be converted to (BlankNode | Literal | NamedNode | bigint | boolean | number | string) or an array of the same
   */
  abstract toRdfResourceValuesExpression(parameters: {
    variables: {
      graph: Code;
      propertyPath: Code;
      resource: Code;
      resourceSet: Code;
      value: Code;
    };
  }): Code;

  /**
   * An expression that converts a value of this type to a human-readable string (toString).
   */
  abstract toStringExpression(parameters: { variables: { value: Code } }): Code;

  protected readonly rdfjsTermExpression: (
    parameters: Parameters<typeof rdfjsTermExpression>[0],
  ) => Code;
}

export namespace AbstractType {
  export interface ConversionFunction {
    readonly code: Code;
    readonly sourceTypes: {
      readonly name: Code | string;
      readonly typeof: Typeof;
    }[];
  }

  export interface DiscriminantProperty {
    readonly descendantValues: readonly DiscriminantProperty.Value[];
    readonly jsonName: string;
    readonly name: string;
    readonly ownValues: readonly DiscriminantProperty.Value[];
  }

  export namespace DiscriminantProperty {
    export type Value = number | string;
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

    private readonly reusables: Reusables;

    constructor(
      nullableName: Code,
      reusables: Reusables,
      options?: { nullable: boolean },
    ) {
      this.nullable = !!options?.nullable;
      this.nullableName = nullableName;
      this.reusables = reusables;
    }

    @Memoize()
    get name(): Code {
      return this.nullable
        ? this.nullableName
        : code`new ${this.reusables.imports.GraphQLNonNull}(${this.nullableName})`;
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
    readonly requiredName: Code | string;

    constructor(
      requiredName: Code | string,
      parameters?: {
        optional: boolean;
      },
    ) {
      this.optional = !!parameters?.optional;
      this.requiredName = requiredName;
    }

    @Memoize()
    get name(): Code | string {
      return this.optional
        ? code`(${this.requiredName}) | undefined`
        : this.requiredName;
    }
  }
}
