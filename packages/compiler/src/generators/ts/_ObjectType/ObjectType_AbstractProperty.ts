import type { Maybe } from "purify-ts";
import type { Logger } from "ts-log";

import type { Reusables } from "../Reusables.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import type { TsGenerator } from "../TsGenerator.js";
import type { Type } from "../Type.js";
import { type Code, code } from "../ts-poet-wrapper.js";

export abstract class ObjectType_AbstractProperty<
  TypeT extends Pick<
    Type,
    "expression" | "filterFunction" | "mutable" | "schema"
  >,
> {
  protected readonly configuration: TsGenerator.Configuration;
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
  abstract readonly declaration: Code;

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
  abstract readonly hashFunctionParameter: Code;

  /**
   * zod object key: schema.
   */
  abstract readonly jsonSchema: Maybe<{
    readonly key: string;
    readonly schema: Code;
  }>;

  /**
   * Signature of the property when serialized to JSON.
   */
  abstract readonly jsonSignature: Maybe<Code>;

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

  /**
   * Property type
.   */
  readonly type: TypeT;

  constructor({
    configuration,
    logger,
    name,
    objectType,
    reusables,
    type,
  }: {
    configuration: TsGenerator.Configuration;
    logger: Logger;
    name: string;
    objectType: { readonly name: Maybe<string> };
    reusables: Reusables;
    type: TypeT;
  }) {
    this.configuration = configuration;
    this.logger = logger;
    this.name = name;
    this.objectType = objectType;
    this.reusables = reusables;
    this.type = type;
    this.rdfjsTermExpression = rdfjsTermExpression.bind({
      imports: this.reusables.imports,
      logger: this.logger,
      snippets: this.reusables.snippets,
    });
  }

  /**
   * Expression to access the value of this property on an object instance. May evaluate a thunk.
   */
  accessExpression({ variables }: { variables: { object: Code } }): Code {
    return code`${variables.object}.${this.name}`;
  }

  /**
   * Initializer (name: value) from a constructor parameter.
   */
  abstract constructorInitializer(parameters: {
    variables: { parameters: Code };
  }): Maybe<Code>;

  /**
   * Initializer (name: value) from a JSON object.
   */
  abstract fromJsonInitializer(parameters: {
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
    variables: { hasher: Code; value: Code };
  }): readonly Code[];

  /**
   * Element object (usually a control https://jsonforms.io/docs/uischema/controls) for a JSON Forms UI schema.
   */
  abstract jsonUiSchemaElement(parameters: {
    variables: { scopePrefix: Code };
  }): Maybe<Code>;

  /**
   * SPARQL.js CONSTRUCT template triples for this property.
   *
   * Parameters:
   *   variables: runtime variables
   *     - filter: an instance of the object's filterType or undefined
   *     - focusIdentifier: identifier (rdfjs.NamedNode or rdfjs.Variable) of the object that is the focus of the patterns
   *     - variablePrefix: prefix to use for new SPARQL variables
   *
   * Returns a (runtime) array of sparqljs.Triple.
   */
  abstract sparqlConstructTriplesExpression(parameters: {
    variables: { filter: Code; focusIdentifier: Code; variablePrefix: Code };
  }): Maybe<Code>;

  /**
   * SPARQL where patterns for this property.
   *
   * Parameters:
   *   variables: (at runtime)
   *     - filter: an instance of the object's filterType or undefined
   *     - focusIdentifier: identifier (rdfjs.NamedNode or rdfjs.Variable) of the object that is the focus of the patterns
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
      preferredLanguages: Code;
      variablePrefix: Code;
    };
  }): Maybe<{ condition?: Code; patterns: Code }>;

  /**
   * Initializer (name: value) to JSON.
   */
  abstract toJsonInitializer(parameters: {
    variables: { value: Code };
  }): Maybe<Code>;

  /**
   * Statements to serialize this property to an RDF resource.
   */
  abstract toRdfRdfResourceValuesStatements(parameters: {
    variables: Omit<
      Parameters<Type["toRdfResourceValuesExpression"]>[0]["variables"],
      "propertyPath"
    >;
  }): readonly Code[];

  /**
   * Initializer (name: value) to serialize this property to a human-readable string (toString).
   */
  abstract toStringInitializer(parameters: {
    variables: { value: Code };
  }): Maybe<Code>;

  protected readonly rdfjsTermExpression: (
    parameters: Parameters<typeof rdfjsTermExpression>[0],
  ) => Code;
}
