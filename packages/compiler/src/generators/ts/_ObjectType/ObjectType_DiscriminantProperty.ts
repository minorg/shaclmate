import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { type Code, code, literalOf } from "../ts-poet-wrapper.js";
import { ObjectType_AbstractProperty } from "./ObjectType_AbstractProperty.js";

export class ObjectType_DiscriminantProperty extends ObjectType_AbstractProperty {
  override readonly createFunctionParameter: ObjectType_AbstractProperty["createFunctionParameter"] =
    Maybe.empty();

  /**
   * The discriminant property is not declared in the object type. It's only added on construction.
   */
  override readonly declaration: ObjectType_AbstractProperty["declaration"] =
    Maybe.empty();
  override readonly filterProperty: ObjectType_AbstractProperty["filterProperty"] =
    Maybe.empty();
  override readonly graphqlField: ObjectType_AbstractProperty["graphqlField"] =
    Maybe.empty();
  override readonly hashFunctionParameter: ObjectType_AbstractProperty["hashFunctionParameter"] =
    Maybe.empty();
  override readonly jsonObjectMember: ObjectType_AbstractProperty["jsonObjectMember"] =
    Maybe.empty();
  override readonly kind = "Discriminant";
  override readonly mutable = false;
  override readonly recursive = false;
  override readonly schema: ObjectType_AbstractProperty["schema"] =
    Maybe.empty();
  override readonly schemaType: ObjectType_AbstractProperty["schemaType"] =
    Maybe.empty();
  readonly value: string;

  constructor({
    configuration,
    value,
    ...superParameters
  }: {
    value: string;
  } & Omit<
    ConstructorParameters<typeof ObjectType_AbstractProperty>[0],
    "name"
  >) {
    super({
      ...superParameters,
      configuration,
      name: configuration.objectDiscriminantProperty.name,
    });
    this.value = value;
  }

  @Memoize()
  get values(): readonly string[] {
    return [this.value];
  }

  @Memoize()
  override createInitializer(): Maybe<Code> {
    return Maybe.of(
      code`${literalOf(this.name)}: ${this.reusables.imports.Right}(${literalOf(this.value)} as const)`,
    );
  }

  @Memoize()
  override equalsExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  @Memoize()
  override filterExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  override fromJsonObjectInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override fromRdfResourceValuesInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override hashStatements(): readonly Code[] {
    return [];
  }

  override sparqlConstructTriplesExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  override sparqlWherePatternsExpression(): ReturnType<
    ObjectType_AbstractProperty["sparqlWherePatternsExpression"]
  > {
    return Maybe.empty();
  }

  override toJsonInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override toLoggableInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override toRdfResourceValuesStatements(): readonly Code[] {
    return [];
  }

  override toStringInitializer(): Maybe<Code> {
    return Maybe.empty();
  }
}
