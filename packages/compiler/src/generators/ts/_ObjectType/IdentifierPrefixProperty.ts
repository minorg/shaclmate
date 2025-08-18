import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import {
  type GetAccessorDeclarationStructure,
  type OptionalKind,
  type PropertyDeclarationStructure,
  type PropertySignatureStructure,
  Scope,
} from "ts-morph";
import type { IdentifierType } from "../IdentifierType.js";
import type { Import } from "../Import.js";
import { SnippetDeclarations } from "../SnippetDeclarations.js";
import type { StringType } from "../StringType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { Property } from "./Property.js";

export class IdentifierPrefixProperty extends Property<StringType> {
  readonly equalsFunction = `${syntheticNamePrefix}strictEquals`;
  readonly mutable = false;
  private readonly own: boolean;

  override readonly declarationImports: readonly Import[] = [];
  override readonly graphqlField: Property<StringType>["graphqlField"] =
    Maybe.empty();
  override readonly interfacePropertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  > = Maybe.empty();
  override readonly jsonPropertySignature: Maybe<
    OptionalKind<PropertySignatureStructure>
  > = Maybe.empty();

  constructor({
    own,
    ...superParameters
  }: {
    own: boolean;
    type: StringType;
  } & ConstructorParameters<typeof Property>[0]) {
    super(superParameters);
    invariant(this.visibility === "protected");
    this.own = own;
  }

  override get classGetAccessorDeclaration(): Maybe<
    OptionalKind<GetAccessorDeclarationStructure>
  > {
    return Maybe.of({
      leadingTrivia: `protected ${!this.own ? "override " : ""}`,
      name: this.name,
      returnType: this.type.name,
      statements: [
        `return (typeof this._${this.name} !== "undefined") ? this._${this.name} : \`urn:shaclmate:\${this.type}:\``,
      ],
    } satisfies OptionalKind<GetAccessorDeclarationStructure>);
  }

  override get classPropertyDeclaration(): Maybe<
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

  override get snippetDeclarations(): readonly string[] {
    const snippetDeclarations: string[] = [];
    if (this.objectType.features.has("equals")) {
      snippetDeclarations.push(SnippetDeclarations.strictEquals);
    }
    return snippetDeclarations;
  }

  override classConstructorStatements({
    variables,
  }: Parameters<
    Property<IdentifierType>["classConstructorStatements"]
  >[0]): readonly string[] {
    return this.classPropertyDeclaration
      .map((classPropertyDeclaration) => [
        `this.${classPropertyDeclaration.name} = ${variables.parameter};`,
      ])
      .orDefault([]);
  }

  override fromJsonStatements(): readonly string[] {
    return [];
  }

  override fromRdfStatements(): readonly string[] {
    return [];
  }

  override hashStatements(): readonly string[] {
    return [];
  }

  override interfaceConstructorStatements(): readonly string[] {
    return [];
  }

  override jsonUiSchemaElement(): Maybe<string> {
    return Maybe.empty();
  }

  override jsonZodSchema(): ReturnType<
    Property<IdentifierType>["jsonZodSchema"]
  > {
    return Maybe.empty();
  }

  override sparqlConstructTemplateTriples(): readonly string[] {
    return [];
  }

  override sparqlWherePatterns(): readonly string[] {
    return [];
  }

  override toJsonObjectMember(): Maybe<string> {
    return Maybe.empty();
  }

  override toRdfStatements(): readonly string[] {
    return [];
  }
}
