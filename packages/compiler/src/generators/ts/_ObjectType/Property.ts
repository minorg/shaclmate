import type { BlankNode, Literal, NamedNode, Variable } from "@rdfjs/types";
import type { Maybe } from "purify-ts";
import {
  type GetAccessorDeclarationStructure,
  type OptionalKind,
  type PropertyDeclarationStructure,
  type PropertySignatureStructure,
  Scope,
} from "ts-morph";
import type {
  PropertyVisibility,
  TsFeature,
  TsObjectDeclarationType,
} from "../../../enums/index.js";
import type { Import } from "../Import.js";
import type { Type } from "../Type.js";
import { rdfjsTermExpression } from "./rdfjsTermExpression.js";

export abstract class Property<
  TypeT extends { readonly mutable: boolean; readonly name: string },
> {
  /**
   * Optional get accessor to include in a class declaration of the object type.
   */
  abstract readonly classGetAccessorDeclaration: Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  >;
  /**
   * Optional property declaration to include in a class declaration of the object type.
   */
  abstract readonly classPropertyDeclaration: Maybe<
    OptionalKind<PropertyDeclarationStructure>
  >;
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
   * Signature of the property in GraphQL (the type returned by the resolver).
   */
  abstract readonly graphqlPropertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  >;
  /**
   * Signature of the property in an interface version of the object.
   */
  abstract readonly interfacePropertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  >;
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
   * Reusable function, type, and other declarations that are not particular to this property but that property-specific code
   * relies on. For example, the equals function/method of ObjectType has a custom return type that's the same across all
   * ObjectType's. Instead of re-declaring the return type anonymously on every equals function, declare a named type
   * as a snippet and reference it.
   *
   * The generator deduplicates snippet declarations across all types before adding them to the source.
   */
  abstract readonly snippetDeclarations: readonly string[];
  /**
   * Property type
.   */
  readonly type: TypeT;
  /**
   * Property visibility: private, protected, public.
   */
  readonly visibility: PropertyVisibility;
  protected readonly dataFactoryVariable: string;
  protected readonly objectType: {
    readonly declarationType: TsObjectDeclarationType;
    readonly features: Set<TsFeature>;
    readonly mutable: () => boolean;
  };

  constructor({
    dataFactoryVariable,
    name,
    objectType,
    type,
    visibility,
  }: {
    dataFactoryVariable: string;
    name: string;
    objectType: Property<TypeT>["objectType"];
    type: TypeT;
    visibility: PropertyVisibility;
  }) {
    this.dataFactoryVariable = dataFactoryVariable;
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
   * Statements to assign the parameter of described by constructorParametersPropertySignature to a class member.
   */
  abstract classConstructorStatements(parameters: {
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
   * Companion to classConstructorStatements with a similar purpose in an interface's create() function.
   */
  abstract interfaceConstructorStatements(parameters: {
    variables: {
      parameter: string;
    };
  }): readonly string[];

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

  protected rdfjsTermExpression(
    rdfjsTerm:
      | Omit<BlankNode, "equals">
      | Omit<Literal, "equals">
      | Omit<NamedNode, "equals">
      | Omit<Variable, "equals">,
  ): string {
    return rdfjsTermExpression({
      dataFactoryVariable: this.dataFactoryVariable,
      rdfjsTerm,
    });
  }
}
