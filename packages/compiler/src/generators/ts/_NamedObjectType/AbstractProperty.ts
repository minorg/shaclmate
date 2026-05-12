import type { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import type { Logger } from "ts-log";
import { Memoize } from "typescript-memoize";
import type { NamedObjectType } from "../NamedObjectType.js";
import type { Reusables } from "../Reusables.js";
import { rdfjsTermExpression } from "../rdfjsTermExpression.js";
import { removeUndefined } from "../removeUndefined.js";
import type { Type } from "../Type.js";
import { type Code, code, literalOf } from "../ts-poet-wrapper.js";

export abstract class AbstractProperty<
  TypeT extends Pick<Type, "filterFunction" | "mutable" | "name" | "schema">,
> {
  protected readonly logger: Logger;
  protected readonly namedObjectType: NamedObjectType;
  protected readonly reusables: Reusables;
  protected readonly rdfjsTermExpression: (
    parameters: Parameters<typeof rdfjsTermExpression>[0],
  ) => Code;

  /**
   * Optional property to include in the parameters object of a class constructor.
   */
  abstract readonly constructorParametersSignature: Maybe<Code>;

  /**
   * Property declaration to include in a class or interface declaration of the object type.
   */
  abstract readonly declaration: Code;

  /**
   * Optional property in the object type's filter.
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
   * zod Object key: schema pair on the property serialized by toJsonObjectMember.
   */
  abstract readonly jsonSchema: Maybe<{
    readonly key: string;
    readonly schema: Code;
  }>;

  /**
   * Signature of the property when serialized to JSON (the type of toJsonObjectMember).
   */
  abstract readonly jsonSignature: Maybe<Code>;

  /**
   * Property type discriminator e.g., "ShaclProperty".
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
   * Is the property's type the NamedObjectType or does its type indirectly reference the NamedObjectType?
   */
  abstract readonly recursive: boolean;

  /**
   * Property type
.   */
  readonly type: TypeT;

  constructor({
    logger,
    name,
    namedObjectType,
    reusables,
    type,
  }: {
    logger: Logger;
    name: string;
    namedObjectType: NamedObjectType;
    reusables: Reusables;
    type: TypeT;
  }) {
    this.logger = logger;
    this.name = name;
    this.namedObjectType = namedObjectType;
    this.reusables = reusables;
    this.type = type;
    this.rdfjsTermExpression = rdfjsTermExpression.bind({
      imports: this.reusables.imports,
      logger: this.logger,
      snippets: this.reusables.snippets,
    });
  }

  /**
   * TypeScript object describing this type, for runtime use.
   */
  @Memoize()
  get schema(): Code {
    return code`${removeUndefined(this.schemaObject)}`;
  }

  protected get schemaObject() {
    invariant(this.kind.endsWith("Property"));
    return {
      kind: code`${literalOf(this.kind.substring(0, this.kind.length - "Property".length))} as const`,
      // name: literalOf(this.name),
      type: code`() => (${this.type.schema})`,
    };
  }

  /**
   * Expression to access the value of this property on an object instance. May evaluate a thunk.
   */
  accessExpression({ variables }: { variables: { object: Code } }): Code {
    return code`${variables.object}.${this.name}`;
  }

  /**
   * Statements to assign the parameter of described by constructorParametersSignature to a class or interface member.
   */
  abstract constructorStatements(parameters: {
    variables: {
      parameter: Code;
      parameters: Code;
    };
  }): readonly Code[];

  /**
   * Statements to deserialize JSON for this property (as described by toJsonObjectMember) to a typed value of the property.
   */
  abstract fromJsonStatements(parameters: {
    variables: {
      jsonObject: Code;
    };
  }): readonly Code[];

  /**
   * Expression to deserialize this property on the given rdfjsResource.Resource to a Either<Error, this property type>.
   */
  abstract fromRdfResourceValuesExpression(parameters: {
    variables: {
      context: Code;
      graph: Code;
      objectSet: Code;
      preferredLanguages: Code;
      resource: Code;
    };
  }): Maybe<Code>;

  /**
   * Statements to hash this property using a hasher instance.
   */
  abstract hashStatements(
    parameters: Parameters<Type["hashStatements"]>[0],
  ): readonly Code[];

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
   * Expression to serialize a property to a JSON object member.
   */
  abstract toJsonObjectMemberExpression(parameters: {
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
   * Expression to serialize this property to a human-readable string (toString).
   */
  abstract toStringExpression(parameters: {
    variables: { value: Code };
  }): Maybe<Code>;
}
