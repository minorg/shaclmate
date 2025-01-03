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
import type { Type } from "../Type.js";

export abstract class Property<
  TypeT extends { readonly mutable: boolean; readonly name: string },
> {
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
  abstract readonly jsonPropertySignature: OptionalKind<PropertySignatureStructure>;
  abstract readonly mutable: boolean;
  readonly name: string;
  readonly type: TypeT;
  readonly visibility: PropertyVisibility;
  protected readonly dataFactoryVariable: string;

  constructor({
    dataFactoryVariable,
    name,
    type,
    visibility,
  }: {
    dataFactoryVariable: string;
    name: string;
    type: TypeT;
    visibility: PropertyVisibility;
  }) {
    this.dataFactoryVariable = dataFactoryVariable;
    this.name = name;
    this.type = type;
    this.visibility = visibility;
  }

  get declarationImports(): readonly Import[] {
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
      languageIn: string;
      resource: string;
    };
  }): readonly string[];

  abstract hashStatements(
    parameters: Parameters<Type["propertyHashStatements"]>[0],
  ): readonly string[];

  abstract sparqlGraphPatternExpression(): Maybe<string>;

  abstract toJsonObjectMember(parameters: {
    variables: { value: string };
  }): string;

  abstract toRdfStatements(parameters: {
    variables: Omit<
      Parameters<Type["propertyToRdfExpression"]>[0]["variables"],
      "predicate"
    >;
  }): readonly string[];
}
