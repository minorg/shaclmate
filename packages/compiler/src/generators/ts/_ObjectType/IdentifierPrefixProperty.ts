import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { StringType } from "../StringType.js";
import { snippets } from "../snippets.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { type Code, code } from "../ts-poet-wrapper.js";
import { AbstractProperty } from "./AbstractProperty.js";

export class IdentifierPrefixProperty extends AbstractProperty<StringType> {
  private readonly own: boolean;

  override readonly filterProperty: AbstractProperty<StringType>["filterProperty"] =
    Maybe.empty();
  override readonly graphqlField: AbstractProperty<StringType>["graphqlField"] =
    Maybe.empty();
  override readonly jsonSignature: Maybe<Code> = Maybe.empty();
  override readonly jsonZodSchema: AbstractProperty<StringType>["jsonZodSchema"] =
    Maybe.empty();
  readonly kind = "IdentifierPrefixProperty";
  override readonly mutable = false;
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

  override get constructorParametersSignature(): Maybe<Code> {
    return Maybe.of(code`readonly ${this.name}?: ${this.type.name};`);
  }

  override get declaration(): Maybe<Code> {
    if (this.objectType.declarationType === "interface") {
      return Maybe.empty();
    }

    if (!this.own) {
      return Maybe.empty();
    }

    return Maybe.of(
      code`protected readonly _${this.name}?: ${this.type.name};`,
    );
  }

  @Memoize()
  override get equalsFunction(): Maybe<Code> {
    return this.objectType.declarationType === "class"
      ? Maybe.of(code`${snippets.strictEquals}`)
      : Maybe.empty();
  }

  override get getAccessorDeclaration(): Maybe<Code> {
    return Maybe.of(code`\
protected ${!this.own ? "override " : ""} get ${this.name}(): ${this.type.name} {
  return (typeof this._${this.name} !== "undefined") ? this._${this.name} : \`urn:shaclmate:\${this.${syntheticNamePrefix}type}:\`;
}`);
  }

  override constructorStatements({
    variables,
  }: Parameters<
    AbstractProperty<StringType>["constructorStatements"]
  >[0]): readonly Code[] {
    switch (this.objectType.declarationType) {
      case "class":
        return this.declaration
          .map(() => [code`this._${this.name} = ${variables.parameter};`])
          .orDefault([]);
      case "interface":
        return [];
    }
  }

  override fromJsonStatements(): readonly Code[] {
    return [];
  }

  override fromRdfExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  override hashStatements(): readonly Code[] {
    return [];
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  override sparqlConstructTriples(): Maybe<Code> {
    return Maybe.empty();
  }

  override sparqlWherePatterns(): ReturnType<
    AbstractProperty<StringType>["sparqlWherePatterns"]
  > {
    return Maybe.empty();
  }

  override toJsonObjectMemberExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  override toRdfStatements(): readonly Code[] {
    return [];
  }
}
