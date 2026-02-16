import type { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import type { PropertyVisibility } from "../../../enums/index.js";
import type { ObjectType } from "../ObjectType.js";
import type { Type } from "../Type.js";
import { type Code, code, literalOf } from "../ts-poet-wrapper.js";

export abstract class AbstractProperty<
  TypeT extends Pick<Type, "filterFunction" | "mutable" | "name" | "schema">,
> {
  protected readonly objectType: ObjectType;

  /**
   * Optional property to include in the parameters object of a class constructor.
   */
  abstract readonly constructorParametersSignature: Maybe<Code>;

  /**
   * Optional property declaration to include in a class or interface declaration of the object type.
   */
  abstract readonly declaration: Maybe<Code>;

  /**
   * Function declaration that takes two values of the property and compares them, returning an $EqualsResult.
   */
  abstract readonly equalsFunction: Maybe<Code>;

  /**
   * Optional property in the object type's filter.
   */
  abstract readonly filterProperty: Maybe<{
    readonly name: string;
    readonly type: Code;
  }>;

  /**
   * Optional get accessor to include in a class declaration of the object type.
   */
  abstract readonly getAccessorDeclaration: Maybe<Code>;

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
   * Signature of the property when serialized to JSON (the type of toJsonObjectMember).
   */
  abstract readonly jsonSignature: Maybe<Code>;

  /**
   * zod Object key: schema pair on the property serialized by toJsonObjectMember.
   */
  abstract readonly jsonZodSchema: Maybe<{
    readonly key: string;
    readonly schema: Code;
  }>;

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
   * Is the property's type the ObjectType or does its type indirectly reference the ObjectType?
   */
  abstract readonly recursive: boolean;

  /**
   * Property type
.   */
  readonly type: TypeT;

  /**
   * Property visibility: private, protected, public.
   */
  readonly visibility: PropertyVisibility;

  constructor({
    name,
    objectType,
    type,
    visibility,
  }: {
    name: string;
    objectType: ObjectType;
    type: TypeT;
    visibility: PropertyVisibility;
  }) {
    this.name = name;
    this.objectType = objectType;
    this.type = type;
    this.visibility = visibility;
  }

  /**
   * TypeScript object describing this type, for runtime use.
   */
  @Memoize()
  get schema(): Code {
    return code`${this.schemaObject}`;
  }

  protected get schemaObject() {
    return {
      kind: code`${literalOf(this.kind)} as const`,
      name: literalOf(this.name),
      type: code`() => (${this.type.schema})`,
    };
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
  abstract fromRdfExpression(parameters: {
    variables: {
      context: Code;
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
   * SPARQL.js CONSTRUCT template triples for a value of this type as a (runtime) array of sparqljs.Triple.
   *
   * Parameters:
   *   variables: runtime variables
   *     - valueVariable: rdfjs.Variable of the value of this type, usually the object of the basic triple
   *     - variablePrefix: prefix to use for variables
   *
   * Returns a (runtime) array of sparqljs.Triple.
   */
  abstract sparqlConstructTriples(parameters: {
    variables: { focusIdentifier: Code; variablePrefix: Code };
  }): Maybe<Code>;

  /**
   * SPARQL where patterns for this property.
   *
   * Parameters:
   *   variables: (at runtime)
   *     - filter: an instance of the object's filterType or undefined
   *     - focusIdentifier: identifier (rdfjs.BlankNode or rdfjs.NamedNode) of the object that is the focus of the patterns
   *     - preferredLanguages: array of preferred language code (strings)
   *     - variablePrefix: prefix to use for new variables
   *
   * Returns:
   *   - condition: optional runtime condition to evaluate in an if statement before including the patterns
   *   - patterns: runtime array of SparqlPattern's.
   */
  abstract sparqlWherePatterns(parameters: {
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
  abstract toRdfStatements(parameters: {
    variables: Omit<
      Parameters<Type["toRdfExpression"]>[0]["variables"],
      "predicate"
    >;
  }): readonly Code[];
}
