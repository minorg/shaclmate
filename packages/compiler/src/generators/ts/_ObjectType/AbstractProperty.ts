import type { Maybe } from "purify-ts";
import {
  type GetAccessorDeclarationStructure,
  type OptionalKind,
  type PropertyDeclarationStructure,
  type PropertySignatureStructure,
  Scope,
} from "ts-morph";

import type { PropertyVisibility } from "../../../enums/index.js";
import type { Import } from "../Import.js";
import type { ObjectType } from "../ObjectType.js";
import type { Sparql } from "../Sparql.js";
import type { Type } from "../Type.js";

export abstract class AbstractProperty<
  TypeT extends Pick<Type, "filterFunction" | "mutable" | "name">,
> {
  protected readonly objectType: ObjectType;

  /**
   * Optional property to include in the parameters object of a class constructor.
   */
  abstract readonly constructorParametersPropertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  >;

  /**
   * Function declaration that takes two values of the property and compares them, returning an $EqualsResult.
   */
  abstract readonly equalsFunction: Maybe<string>;

  /**
   * Optional property in the object type's filter.
   */
  abstract readonly filterProperty: Maybe<{
    readonly name: string;
    readonly type: string;
  }>;

  /**
   * Optional get accessor to include in a class declaration of the object type.
   */
  abstract readonly getAccessorDeclaration: Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  >;

  /**
   * GraphQL.js field definition.
   */
  abstract readonly graphqlField: Maybe<{
    args: Maybe<
      Record<
        string,
        {
          type: string;
        }
      >
    >;
    description: Maybe<string>;
    name: string;
    resolve: string;
    type: string;
  }>;

  /**
   * Signature of the property when serialized to JSON (the type of toJsonObjectMember).
   */
  abstract readonly jsonPropertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  >;

  /**
   * Is the property reassignable?
   */
  abstract readonly mutable: boolean;

  /**
   * TypeScript identifier-safe name of the property.
   */
  readonly name: string;

  /**
   * Optional property declaration to include in a class declaration of the object type.
   */
  abstract readonly propertyDeclaration: Maybe<
    OptionalKind<PropertyDeclarationStructure>
  >;

  /**
   * Signature of the property in an interface version of the object.
   */
  abstract readonly propertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  >;

  /**
   * Is the property's type the ObjectType or does its type indirectly reference the ObjectType?
   */
  abstract readonly recursive: boolean;

  /**
   * TypeScript object describing this type, for runtime use.
   */
  abstract readonly schema: string;

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
   * Imports this property requires when declared in an object.
   */
  abstract get declarationImports(): readonly Import[];

  /**
   * Statements to assign the parameter of described by constructorParametersPropertySignature to a class or interface member.
   */
  abstract constructorStatements(parameters: {
    variables: {
      parameter: string;
      parameters: string;
    };
  }): readonly string[];

  /**
   * Statements to deserialize JSON for this property (as described by toJsonObjectMember) to a typed value of the property.
   */
  abstract fromJsonStatements(parameters: {
    variables: {
      jsonObject: string;
    };
  }): readonly string[];

  /**
   * Expression to deserialize this property on the given rdfjsResource.Resource to a Either<Error, this property type>.
   */
  abstract fromRdfExpression(parameters: {
    variables: {
      context: string;
      objectSet: string;
      preferredLanguages: string;
      resource: string;
    };
  }): Maybe<string>;

  /**
   * Statements to hash this property using a hasher instance.
   */
  abstract hashStatements(
    parameters: Parameters<Type["hashStatements"]>[0],
  ): readonly string[];

  /**
   * Element object (usually a control https://jsonforms.io/docs/uischema/controls) for a JSON Forms UI schema.
   */
  abstract jsonUiSchemaElement(parameters: {
    variables: { scopePrefix: string };
  }): Maybe<string>;

  /**
   * zod Object key: schema pair on the property serialized by toJsonObjectMember.
   */
  abstract jsonZodSchema(parameters: { variables: { zod: string } }): Maybe<{
    readonly key: string;
    readonly schema: string;
  }>;

  /**
   * Reusable function, type, and other declarations that are not particular to this property but that property-specific code
   * relies on. For example, the equals function/method of ObjectType has a custom return type that's the same across all
   * ObjectType's. Instead of re-declaring the return type anonymously on every equals function, declare a named type
   * as a snippet and reference it.
   *
   * The generator deduplicates snippet declarations across all types before adding them to the source.
   */
  abstract snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>>;

  /**
   * An array of SPARQL.js CONSTRUCT template triples for this property as strings (so they can incorporate runtime calls).
   *
   * Parameters:
   *   variables: (at runtime)
   *     - focusIdentifier: identifier (rdfjs.BlankNode or rdfjs.NamedNode) of the ObjectType that is the focus of the triples
   *     - variablePrefix: prefix to use for new variables
   */
  abstract sparqlConstructTriples(parameters: {
    variables: { focusIdentifier: string; variablePrefix: string };
  }): readonly (Sparql.Triple | string)[];

  /**
   * An array of SPARQL.js WHERE patterns for this property as strings (so they can incorporate runtime calls).
   *
   * Parameters:
   *   variables: (at runtime)
   *     - filter: an instance of the object's filterType or undefined
   *     - focusIdentifier: identifier (rdfjs.BlankNode or rdfjs.NamedNode) of the object that is the focus of the patterns
   *     - preferredLanguages: array of preferred language code (strings)
   *     - variablePrefix: prefix to use for new variables
   */
  abstract sparqlWherePatterns(parameters: {
    variables: {
      filter: string;
      focusIdentifier: string;
      preferredLanguages: string;
      variablePrefix: string;
    };
  }): { condition?: string; patterns: readonly Sparql.Pattern[] };

  /**
   * property: expression to serialize a property to a JSON object member.
   */
  abstract toJsonObjectMember(parameters: {
    variables: { value: string };
  }): Maybe<string>;

  /**
   * Statements to serialize this property to an RDF resource.
   */
  abstract toRdfStatements(parameters: {
    variables: Omit<
      Parameters<Type["toRdfExpression"]>[0]["variables"],
      "predicate"
    >;
  }): readonly string[];

  protected static visibilityToScope(
    visibility: PropertyVisibility,
  ): Scope | undefined {
    switch (visibility) {
      case "private":
        return Scope.Private;
      case "protected":
        return Scope.Protected;
      case "public":
        return undefined;
    }
  }
}
