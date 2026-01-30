import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import {
  type GetAccessorDeclarationStructure,
  type OptionalKind,
  type PropertyDeclarationStructure,
  type PropertySignatureStructure,
  Scope,
} from "ts-morph";
import { Memoize } from "typescript-memoize";
import type { AbstractType } from "../AbstractType.js";
import type { IdentifierType } from "../IdentifierType.js";
import type { Import } from "../Import.js";
import type { StringType } from "../StringType.js";
import { sharedSnippetDeclarations } from "../sharedSnippetDeclarations.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class IdentifierPrefixProperty extends AbstractProperty<StringType> {
  private readonly own: boolean;

  override readonly declarationImports: readonly Import[] = [];
  override readonly filterProperty: AbstractProperty<StringType>["filterProperty"] =
    Maybe.empty();
  override readonly graphqlField: AbstractProperty<StringType>["graphqlField"] =
    Maybe.empty();
  override readonly jsonPropertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  > = Maybe.empty();
  readonly kind = "IdentifierPrefixProperty";
  override readonly mutable = false;
  override readonly propertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  > = Maybe.empty();
  override readonly recursive = false;

  constructor({
    own,
    ...superParameters
  }: {
    own: boolean;
    type: StringType;
  } & ConstructorParameters<typeof AbstractProperty>[0]) {
    super(superParameters);
    invariant(this.visibility === "protected");
    this.own = own;
  }

  override get constructorParametersPropertySignature(): Maybe<
    OptionalKind<PropertySignatureStructure>
  > {
    return Maybe.of({
      hasQuestionToken: true,
      isReadonly: true,
      name: this.name,
      type: this.type.name,
    });
  }

  @Memoize()
  override get equalsFunction(): Maybe<string> {
    return this.objectType.declarationType === "class"
      ? Maybe.of(`${syntheticNamePrefix}strictEquals`)
      : Maybe.empty();
  }

  override get getAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    return Maybe.of({
      leadingTrivia: `protected ${!this.own ? "override " : ""}`,
      name: this.name,
      returnType: this.type.name,
      statements: [
        `return (typeof this._${this.name} !== "undefined") ? this._${this.name} : \`urn:shaclmate:\${this.${syntheticNamePrefix}type}:\``,
      ],
    } satisfies OptionalKind<GetAccessorDeclarationStructure>);
  }

  override get propertyDeclaration(): Maybe<
    OptionalKind<PropertyDeclarationStructure>
  > {
    return this.own
      ? Maybe.of({
          hasQuestionToken: true,
          isReadonly: true,
          name: `_${this.name}`,
          scope: Scope.Protected,
          type: this.type.name,
        })
      : Maybe.empty();
  }

  override constructorStatements({
    variables,
  }: Parameters<
    AbstractProperty<IdentifierType>["constructorStatements"]
  >[0]): readonly string[] {
    switch (this.objectType.declarationType) {
      case "class":
        return this.propertyDeclaration
          .map((propertyDeclaration) => [
            `this.${propertyDeclaration.name} = ${variables.parameter};`,
          ])
          .orDefault([]);
      case "interface":
        return [];
    }
  }

  override fromJsonStatements(): readonly string[] {
    return [];
  }

  override fromRdfExpression(): Maybe<string> {
    return Maybe.empty();
  }

  override hashStatements(): readonly string[] {
    return [];
  }

  override jsonUiSchemaElement(): Maybe<string> {
    return Maybe.empty();
  }

  override jsonZodSchema(): ReturnType<
    AbstractProperty<IdentifierType>["jsonZodSchema"]
  > {
    return Maybe.empty();
  }

  override snippetDeclarations(): Readonly<Record<string, string>> {
    if (this.objectType.features.has("equals")) {
      return sharedSnippetDeclarations.strictEquals;
    }
    return {};
  }

  override sparqlConstructTriples(): readonly (
    | AbstractType.SparqlConstructTriple
    | string
  )[] {
    return [];
  }

  override sparqlWherePatterns(): ReturnType<
    AbstractProperty<StringType>["sparqlWherePatterns"]
  > {
    return { patterns: "" };
  }

  override toJsonObjectMember(): Maybe<string> {
    return Maybe.empty();
  }

  override toRdfStatements(): readonly string[] {
    return [];
  }
}
