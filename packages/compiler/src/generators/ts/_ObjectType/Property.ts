import type {} from "@rdfjs/types";
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
import type { Type } from "../Type.js";

export abstract class Property<TypeT extends Pick<Type, "mutable" | "name">> {
  /**
   * Optional property to include in the parameters object of a class constructor.
   */
  abstract readonly constructorParametersPropertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  >;

  /**
   * Function declaration that takes two values of the property and compares them, returning an $EqualsResult.
   */
  abstract readonly equalsFunction: string;

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
    name: string;
    description?: string;
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
   * Property type
.   */
  readonly type: TypeT;

  /**
   * Property visibility: private, protected, public.
   */

  readonly visibility: PropertyVisibility;

  protected readonly objectType: ObjectType;

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

  /**
   * Statements to assign the parameter of described by constructorParametersPropertySignature to a class or interface member.
   */
  abstract constructorStatements(parameters: {
    variables: {
      parameter: string;
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
   * Statements to deserialize RDF for this property to a typed value of the property.
   */
  abstract fromRdfStatements(parameters: {
    variables: {
      context: string;
      languageIn: string;
      objectSet: string;
      resource: string;
    };
  }): readonly string[];

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
  ): readonly string[];

  /**
   * An array of SPARQL.js CONSTRUCT template triples for this property as strings (so they can incorporate runtime calls).
   */
  abstract sparqlConstructTemplateTriples(parameters: {
    variables: { subject: string; variablePrefix: string };
  }): readonly string[];

  /**
   * An array of SPARQL.js where patterns for this property as strings (so they can incorporate runtime calls).
   */
  abstract sparqlWherePatterns(parameters: {
    variables: { subject: string; variablePrefix: string };
  }): readonly string[];

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
}
