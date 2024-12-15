import type { Maybe } from "purify-ts";
import {
  type GetAccessorDeclarationStructure,
  type OptionalKind,
  type PropertyDeclarationStructure,
  type PropertySignatureStructure,
  Scope,
} from "ts-morph";
import type { PropertyVisibility } from "../../../enums/index.js";
import type { Configuration } from "../Configuration.js";
import type { Type } from "../Type.js";

export abstract class Property<TypeT extends { readonly name: string }> {
  abstract readonly classConstructorParametersPropertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  >;
  abstract readonly classGetAccessorDeclaration: Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  >;
  abstract readonly classPropertyDeclaration: Maybe<
    OptionalKind<PropertyDeclarationStructure>
  >;
  abstract readonly equalsFunction: string;
  abstract readonly interfacePropertySignature: OptionalKind<PropertySignatureStructure>;
  readonly name: string;
  readonly type: TypeT;
  readonly visibility: PropertyVisibility;
  protected readonly configuration: Configuration;

  constructor({
    configuration,
    name,
    type,
    visibility,
  }: {
    configuration: Configuration;
    name: string;
    type: TypeT;
    visibility: PropertyVisibility;
  }) {
    this.configuration = configuration;
    this.name = name;
    this.type = type;
    this.visibility = visibility;
  }

  get importStatements(): readonly string[] {
    return [];
  }

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

  abstract classConstructorStatements(parameters: {
    variables: {
      parameter: string;
    };
  }): readonly string[];

  abstract fromRdfStatements(parameters: {
    variables: {
      context: string;
      resource: string;
    };
  }): readonly string[];

  abstract hashStatements(
    parameters: Parameters<Type["propertyHashStatements"]>[0],
  ): readonly string[];

  abstract sparqlGraphPatternExpression(): Maybe<string>;

  abstract toRdfStatements(parameters: {
    variables: Omit<
      Parameters<Type["propertyToRdfExpression"]>[0]["variables"],
      "predicate"
    >;
  }): readonly string[];
}
