import type { Logger } from "@rdfx/logger";

import type { Maybe } from "purify-ts";
import type { AbstractType } from "../AbstractType.js";
import type { Reusables } from "../Reusables.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import type { TsGenerator } from "../TsGenerator.js";
import type { Type } from "../Type.js";
import type { Code } from "../ts-poet-wrapper.js";

export abstract class ObjectType_AbstractProperty {
  protected readonly configuration: TsGenerator.Configuration;
  protected readonly jsonTypeFactory: AbstractType.JsonTypeFactory;
  protected readonly logger: Logger;
  protected readonly objectType: { readonly name: Maybe<string> };
  protected readonly reusables: Reusables;

  /**
   * Optional parameter to include in the parameters object of constructor function.
   */
  abstract readonly constructorParameter: Maybe<{
    readonly hasQuestionToken: boolean;
    readonly signature: Code;
  }>;

  /**
   * Property declaration to include in the type declaration of the ObjectType.
   */
  abstract readonly declaration: Maybe<Code>;

  /**
   * Optional property in the ObjectType's filter.
   */
  abstract readonly filterProperty: Maybe<{
    readonly name: string;
    readonly type: Code;
  }>;

  /**
   * GraphQL.js field definition.
   */
  abstract readonly graphqlField: Maybe<{
    args: Maybe<
      Record<
        string,
        {
          type: Code;
        }
      >
    >;
    description: Maybe<string>;
    name: string;
    resolve: Code;
    type: Code;
  }>;

  /**
   * Parameter to include in the expression of the ObjectType passed to its hash function.
   *
   * Only specified if different from declaration.
   */
  abstract readonly hashFunctionParameter: Maybe<Code>;

  /**
   * This property as a Member of a JsonObjectType.
   */
  abstract readonly jsonObjectMember: Maybe<{
    readonly description: Maybe<string>;
    readonly label: Maybe<string>;
    readonly name: string;
    readonly optional: boolean;
    readonly recursive: boolean;
    readonly type: AbstractType.JsonType;
    readonly uiSchemaElement: Maybe<
      (parameters: { variables: { scopePrefix: Code } }) => Code
    >;
  }>;

  /**
   * Property type discriminant e.g., "Shacl".
   */
  abstract readonly kind: string;

  /**
   * Is the property reassignable?
   */
  abstract readonly mutable: boolean;

  /**
   * TypeScript identifier-safe name of the property.
   */
  readonly name: string;

  /**
   * Is the property's type the ObjectType or does its type indirectly reference the ObjectType?
   */
  abstract readonly recursive: boolean;

  /**
   * TypeScript object describing this type, for runtime use.
   */
  abstract readonly schema: Maybe<Code>;

  /**
   * TypeScript type describing .schema.
   */
  abstract readonly schemaType: Maybe<Code>;

  constructor({
    configuration,
    jsonTypeFactory,
    logger,
    name,
    objectType,
    reusables,
  }: {
    configuration: TsGenerator.Configuration;
    jsonTypeFactory: AbstractType.JsonTypeFactory;
    logger: Logger;
    name: string;
    objectType: { readonly name: Maybe<string> };
    reusables: Reusables;
  }) {
    this.configuration = configuration;
    this.jsonTypeFactory = jsonTypeFactory;
    this.logger = logger;
    this.name = name;
    this.objectType = objectType;
    this.reusables = reusables;
    this.rdfjsTermExpression = rdfjsTermExpression.bind({
      imports: this.reusables.imports,
      logger: this.logger,
      snippets: this.reusables.snippets,
    });
  }

  /**
   * Initializer (name: value) from a constructor parameter.
   */
  abstract constructorInitializer(parameters: {
    variables: { parameters: Code };
  }): Maybe<Code>;

  /**
   * An expression that compares two values of this property, returning a $EqualsResult.
   */
  abstract equalsExpression(parameters: {
    variables: {
      leftObject: Code;
      rightObject: Code;
    };
  }): Maybe<Code>;

  /**
   * Expression to filter this property using an instance of the ObjectType's filter.
   *
   * Parameters:
   *   variables: runtime variables
   *     - filter: an instance of the object's filterType or undefined
   *     - object: an instance of the object
   */
  abstract filterExpression(parameters: {
    variables: { filter: Code; object: Code };
  }): Maybe<Code>;

  /**
   * Initializer (name: value) from a JSON object.
   */
  abstract fromJsonInitializer(parameters: {
    discriminated: boolean;
    variables: {
      jsonObject: Code;
    };
  }): Maybe<Code>;

  /**
   * Initializer (name: value) from a rdfjsResource.Resource to a Either<Error, this property type>.
   */
  abstract fromRdfResourceValuesInitializer(parameters: {
    variables: {
      focusResource: Code;
      options: Code;
    };
  }): Maybe<Code>;

  /**
   * Statements to hash this property using a hasher instance.
   */
  abstract hashStatements(parameters: {
    variables: { hasher: Code; object: Code };
  }): readonly Code[];

  /**
   * SPARQL.js CONSTRUCT template triples for this property.
   *
   * Parameters:
   *   variables: runtime variables
   *     - filter: an instance of the object's filterType or undefined
   *     - focusIdentifier: identifier (rdfjs.NamedNode or rdfjs.Variable) of the object that is the focus of the patterns
   *     - ignoreRdfType: whether the RDF type of objects/object unions should be ignored
   *     - variablePrefix: prefix to use for new SPARQL variables
   *
   * Returns a (runtime) array of sparqljs.Triple.
   */
  abstract sparqlConstructTriplesExpression(parameters: {
    variables: {
      filter: Code;
      focusIdentifier: Code;
      ignoreRdfType: Code;
      variablePrefix: Code;
    };
  }): Maybe<Code>;

  /**
   * SPARQL where patterns for this property.
   *
   * Parameters:
   *   variables: (at runtime)
   *     - filter: an instance of the object's filterType or undefined
   *     - focusIdentifier: identifier (rdfjs.NamedNode or rdfjs.Variable) of the object that is the focus of the patterns
   *     - ignoreRdfType: whether the RDF type of objects/object unions should be ignored
   *     - schema: an instance of the object's schema if available
   *     - preferredLanguages: array of preferred language code (strings)
   *     - variablePrefix: prefix to use for new SPARQL variables
   *
   * Returns:
   *   - condition: optional runtime condition to evaluate in an if statement before including the patterns
   *   - patterns: runtime array of SparqlPattern's.
   */
  abstract sparqlWherePatternsExpression(parameters: {
    variables: {
      filter: Code;
      focusIdentifier: Code;
      ignoreRdfType: Code;
      preferredLanguages: Code;
      schema: Maybe<Code>;
      variablePrefix: Code;
    };
  }): Maybe<{ condition?: Code; patterns: Code }>;

  /**
   * Initializer (name: value) to JSON.
   */
  abstract toJsonInitializer(parameters: {
    discriminated: boolean;
    variables: { object: Code };
  }): Maybe<Code>;

  /**
   * Initializer (name: value) to serialize this property to a loggable value.
   */
  abstract toLoggableInitializer(parameters: {
    variables: { object: Code };
  }): Maybe<Code>;

  /**
   * Statements to serialize this property to an RDF resource.
   */
  abstract toRdfRdfResourceValuesStatements(parameters: {
    variables: Omit<
      Parameters<Type["toRdfResourceValuesExpression"]>[0]["variables"],
      "propertyPath" | "value"
    > & { object: Code };
  }): readonly Code[];

  /**
   * Initializer (name: value) to serialize this property to a human-readable string (toString).
   */
  abstract toStringInitializer(parameters: {
    variables: { object: Code };
  }): Maybe<Code>;

  protected readonly rdfjsTermExpression: (
    parameters: Parameters<typeof rdfjsTermExpression>[0],
  ) => Code;
}
