import type { BlankNode, NamedNode } from "@rdfjs/types";

import { Maybe } from "purify-ts";
import type { Logger } from "ts-log";
import { Memoize } from "typescript-memoize";
import type { AbstractType_ConversionFunction } from "./_AbstractType/AbstractType_ConversionFunction.js";
import type { AbstractType_DiscriminantProperty } from "./_AbstractType/AbstractType_DiscriminantProperty.js";
import { AbstractType_GraphqlType } from "./_AbstractType/AbstractType_GraphqlType.js";
import { AbstractType_JsonType } from "./_AbstractType/AbstractType_JsonType.js";
import { AbstractType_JsType } from "./_AbstractType/AbstractType_JsType.js";
import type { Reusables } from "./Reusables.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";
import type { TsGenerator } from "./TsGenerator.js";
import {
  type Code,
  code,
  def,
  joinCode,
  literalOf,
} from "./ts-poet-wrapper.js";
import { tsComment } from "./tsComment.js";

/**
 * Abstract base class all types.
 */
export abstract class AbstractType {
  protected readonly configuration: TsGenerator.Configuration;

  /**
   * Inline TypeScript type expression.
   */
  protected abstract readonly inlineExpression: Code;
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
   * A property that discriminates sub-types of this type e.g., termType on RDF/JS terms.
   */
  abstract readonly discriminantProperty: Maybe<AbstractType.DiscriminantProperty>;

  /**
   * A function (reference or literal) that compares two property values of this type, returning a
   * $EqualsResult.
   */
  abstract readonly equalsFunction: Code;

  /**
   * A function (reference or literal) that takes a filter of filterType (below) and a value of this type
   * and returns true if the value passes the filter.
   */
  abstract readonly filterFunction: Code;

  /**
   * Composite type for filtering instances of this type e.g., SomeObject.Filter with filters for each property.
   */
  abstract readonly filterType: Code;

  /**
   * A FromRdfResourceValuesFunction (reference or literal) that converts a Either<Error, rdfjsResource.Resource.Values> to a
   * Either<Error, rdfjsResource.Resource.Values<this type>>.
   *
   * These functions are used to deserialize property values in an ObjectType, either directly (a property with this type) or indirectly (a property with a type like OptionType
   * that has a type parameter of this type).
   *
   * Some types need to filter on the set of all objects/values of a (subject, predicate). For example, all sh:hasValue values must be present in the set for any values
   * to be considered valid. Similarly, values may also need to be sorted. For example, specifying preferredLanguages should sort the values in the order of the specified languages so that the first value
   * (if it exists) is always of the first preferred language.
   *
   * The function takes two parameters, a rdfjsResource.Resource.Values and a parameters object with the following parameters:
   *   context: unanticipated properties (...) passed to Object.fromRdf
   *   focusResource: the Resource passed to Object.fromRdf
   *   graph: DefaultGraph | NamedNode | undefined to match (subject, predicate, object) triples in; if undefined, match triples in all graphs
   *   ignoreRdfType: whether the RDF type of objects/object unions should be ignored
   *   objectSet: the ObjectSet passed to Object.fromRdf
   *   preferredLanguages: the preferred languages array (e.g., ["en"]) passed to Object.fromRdf
   *   propertyPath: the PropertyPath of the object's property
   */
  abstract readonly fromRdfResourceValuesFunction: Code;

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
   * A function (reference or literal) that takes a  Hasher and a value of this type, calls hasher.update on the value, and returns the Hasher.
   */
  abstract readonly hashFunction: Code;

  /**
   * JavaScript type(s) the type.
   */
  abstract readonly jsTypes: readonly AbstractType.JsType[];

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
   * Name for this type.
   */
  readonly name: Maybe<string>;

  /**
   * Does this type directly or indirectly reference itself?
   */
  abstract readonly recursive: boolean;

  /**
   * Is this type an ObjectType or does it reference an object type?
   */
  abstract readonly referencesNamedType: boolean;

  /**
   * TypeScript type describing .schema.
   */
  abstract readonly schemaType: Code;

  /**
   * Identifier of the shape this type was derived from.
   */
  readonly shapeIdentifier: BlankNode | NamedNode;

  /**
   * The type(s) of the array elements produced by the toRdfResourceValuesExpression.
   */
  abstract readonly toRdfResourceValueTypes: ReadonlySet<
    "BlankNode" | "NamedNode" | "Literal"
  >;

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
   * A ValueSparqlConstructTriplesFunction (reference or literal) that returns an array of sparqljs.Triple's for a property value of this type.
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
   * A ValueSparqlWherePatternsFunction (reference or literal) that returns an array of SparqlPattern's for a property value of this type.
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
    name,
    reusables,
    shapeIdentifier,
  }: {
    name: Maybe<string>;
    comment: Maybe<string>;
    configuration: TsGenerator.Configuration;
    label: Maybe<string>;
    logger: Logger;
    reusables: Reusables;
    shapeIdentifier: BlankNode | NamedNode;
  }) {
    this.comment = comment;
    this.configuration = configuration;
    this.label = label;
    this.logger = logger;
    this.name = name;
    this.reusables = reusables;
    this.rdfjsTermExpression = rdfjsTermExpression.bind({
      imports: this.reusables.imports,
      logger: this.logger,
      snippets: this.reusables.snippets,
    });
    this.shapeIdentifier = shapeIdentifier;
  }

  /**
   * The declaration of named types.
   */
  @Memoize()
  get declaration(): Maybe<Code> {
    const name = this.name.extract();
    if (!name) {
      return Maybe.empty();
    }

    const declarations: Code[] = [];

    if (this.configuration.features.has("Object.type")) {
      declarations.push(
        code`${this.comment
          .alt(this.label)
          .map(tsComment)
          .orDefault("")}export type ${def(name)} = ${this.inlineExpression};`,
      );
    }

    const staticModuleDeclarations = Object.entries(
      this.staticModuleDeclarations(name),
    );
    if (staticModuleDeclarations.length > 0) {
      declarations.push(code`\
export namespace ${def(name)} {
${joinCode(
  staticModuleDeclarations
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map((_) => _[1]),
  { on: "\n\n" },
)}
}`);
    }

    return Maybe.of(joinCode(declarations, { on: "\n\n" }));
  }

  @Memoize()
  get expression(): Code {
    return this.name
      .map((name) => code`${name}`)
      .orDefault(this.inlineExpression);
  }

  /**
   * TypeScript object describing this type, for runtime use.
   */
  @Memoize()
  get schema(): Code {
    return this.name
      .map((name) => code`${name}.schema`)
      .orDefaultLazy(() => this.schemaExpression);
  }

  @Memoize()
  protected get schemaExpression(): Code {
    return code`{ ${joinCode(this.schemaInitializers.concat(), { on: ", " })} }`;
  }

  /**
   * Helper to compose the result of schema along the type hierarchy.
   */
  protected get schemaInitializers(): readonly Code[] {
    return [code`kind: ${literalOf(this.kind)} as const`];
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
   * "property": from a ShaclProperty, while generating the z.object properties of an ObjectType
   * "type": from another Type e.g., an OptionType or DiscriminatedUnionType
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
   * variables are runtime variables, most derived from the parameters of the ObjectType's fromRdf function:
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

  protected staticModuleDeclarations(_name: string): Record<string, Code> {
    const staticModuleDeclarations: Record<string, Code> = {};

    if (this.configuration.features.has("Object.schema")) {
      staticModuleDeclarations["schema"] =
        code`export const schema = ${this.schemaExpression}`;
    }

    return staticModuleDeclarations;
  }
}

export namespace AbstractType {
  export type ConversionFunction = AbstractType_ConversionFunction;
  export type DiscriminantProperty = AbstractType_DiscriminantProperty;
  export namespace DiscriminantProperty {
    export type Value = AbstractType_DiscriminantProperty.Value;
  }
  export const GraphqlType = AbstractType_GraphqlType;
  export type GraphqlType = AbstractType_GraphqlType;
  export type JsType = AbstractType_JsType;
  export const JsType = AbstractType_JsType;
  export const JsonType = AbstractType_JsonType;
  export type JsonType = AbstractType_JsonType;
}
