import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";

import { type Code, code, literalOf } from "../ts-poet-wrapper.js";
import { ObjectType_AbstractProperty } from "./ObjectType_AbstractProperty.js";

export class ObjectType_DiscriminantProperty extends ObjectType_AbstractProperty {
  override readonly constructorParameter: ObjectType_AbstractProperty["constructorParameter"] =
    Maybe.empty();
  override readonly filterProperty: ObjectType_AbstractProperty["filterProperty"] =
    Maybe.empty();
  override readonly graphqlField: ObjectType_AbstractProperty["graphqlField"] =
    Maybe.empty();
  override readonly kind = "Discriminant";
  override readonly mutable = false;
  override readonly recursive = false;
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
  get declaration(): Maybe<Code> {
    return Maybe.of(code`readonly ${this.name}: ${literalOf(this.value)};`);
  }

  @Memoize()
  get hashFunctionParameter(): Maybe<Code> {
    return Maybe.of(code`readonly ${this.name}?: ${literalOf(this.value)};`);
  }

  @Memoize()
  get jsonObjectMember(): ObjectType_AbstractProperty["jsonObjectMember"] {
    return Maybe.of({
      description: Maybe.empty(),
      label: Maybe.empty(),
      name: this.configuration.objectDiscriminantProperty.jsonName,
      optional: false,
      recursive: false,
      type: this.jsonTypeFactory.createJsonStringType({
        in_: [this.value],
      }),
      uiSchemaElement: Maybe.empty(),
    });
  }

  override get schema(): Maybe<Code> {
    return Maybe.of(code`${{ kind: this.kind, value: this.value }}`);
  }

  override get schemaType(): Maybe<Code> {
    return Maybe.of(code`${{ kind: this.kind, value: this.value }}`);
  }

  @Memoize()
  get values(): readonly string[] {
    return [this.value];
  }

  override constructorInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  @Memoize()
  override equalsExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  @Memoize()
  override filterExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  override fromJsonInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override fromRdfResourceValuesInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override hashStatements({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty["hashStatements"]
  >[0]): readonly Code[] {
    return [
      code`if (${variables.object}.${this.name}) { ${variables.hasher}.update(${variables.object}.${this.name}); }`,
    ];
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
    return Maybe.of(
      code`${literalOf(this.configuration.objectDiscriminantProperty.jsonName)}: ${literalOf(this.value)} as const`,
    );
  }

  override toRdfRdfResourceValuesStatements(): readonly Code[] {
    return [];
  }

  override toStringInitializer(): Maybe<Code> {
    return Maybe.empty();
  }

  override toLoggableInitializer(): Maybe<Code> {
    return Maybe.of(code`${literalOf(this.name)}: ${literalOf(this.value)}`);
  }
}
