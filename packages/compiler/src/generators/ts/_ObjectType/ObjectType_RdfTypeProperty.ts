import type { NamedNode } from "@rdfjs/types";
import { Maybe } from "purify-ts";
import { Memoize } from "typescript-memoize";
import { type Code, code, literalOf } from "../ts-poet-wrapper.js";
import { ObjectType_AbstractProperty } from "./ObjectType_AbstractProperty.js";

export class ObjectType_RdfTypeProperty extends ObjectType_AbstractProperty<ObjectType_RdfTypeProperty.Type> {
  override readonly constructorParameter: ObjectType_AbstractProperty<ObjectType_RdfTypeProperty.Type>["constructorParameter"] =
    Maybe.empty();
  override readonly declaration =
    code`readonly ${this.name}: ${this.type.expression};`;
  override readonly filterProperty: ObjectType_AbstractProperty<ObjectType_RdfTypeProperty.Type>["filterProperty"] =
    Maybe.empty();
  override readonly graphqlField: ObjectType_AbstractProperty<ObjectType_RdfTypeProperty.Type>["graphqlField"] =
    Maybe.empty();
  override readonly hashFunctionParameter =
    code`readonly ${this.name}?: ${this.type.expression};`;
  override readonly kind = "RdfType";
  override readonly mutable = false;
  override readonly recursive = false;

  constructor({
    configuration,
    ...superParameters
  }: {
    value: string;
  } & Omit<
    ConstructorParameters<typeof ObjectType_AbstractProperty>[0],
    "name" | "type"
  >) {
    super({
      ...superParameters,
      configuration,
      name: "rdfType",
      type: new ObjectType_RdfTypeProperty.Type(value),
    });
  }

  @Memoize()
  get jsonName(): string {
    return this.configuration.objectRdfTypeProperty.jsonName;
  }

  @Memoize()
  override get jsonSchema(): ObjectType_AbstractProperty<ObjectType_RdfTypeProperty.Type>["jsonSchema"] {
    return Maybe.of({
      key: this.jsonName,
      schema: code`${this.reusables.imports.z}.literal(${literalOf(this.value)})`,
    });
  }

  @Memoize()
  override get jsonSignature(): Maybe<Code> {
    return Maybe.of(code`readonly "${this.jsonName}": ${this.type.expression}`);
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

  private get constValue(): Code {
    return code`${literalOf(this.value)} as const`;
  }

  override constructorInitializer(): Maybe<Code> {
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
    ObjectType_AbstractProperty<ObjectType_RdfTypeProperty.Type>["hashStatements"]
  >[0]): readonly Code[] {
    return [
      code`if (${variables.value}) { ${variables.hasher}.update(${variables.value}); }`,
    ];
  }

  override jsonUiSchemaElement({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty<ObjectType_RdfTypeProperty.Type>["jsonUiSchemaElement"]
  >[0]): Maybe<Code> {
    const scope = code`\`\${${variables.scopePrefix}}/properties/${this.jsonName}\``;
    return Maybe.of(
      code`{ rule: { condition: { schema: { const: ${this.constValue} }, scope: ${scope} }, effect: "HIDE" }, scope: ${scope}, type: "Control" }`,
    );
  }

  override sparqlConstructTriplesExpression(): Maybe<Code> {
    return Maybe.empty();
  }

  override sparqlWherePatternsExpression(): ReturnType<
    ObjectType_AbstractProperty<ObjectType_RdfTypeProperty.Type>["sparqlWherePatternsExpression"]
  > {
    return Maybe.empty();
  }

  override toJsonInitializer({
    variables,
  }: Parameters<
    ObjectType_AbstractProperty<ObjectType_RdfTypeProperty.Type>["toJsonInitializer"]
  >[0]): Maybe<Code> {
    return Maybe.of(code`"${this.jsonName}": ${variables.value}`);
  }

  override toRdfRdfResourceValuesStatements(): readonly Code[] {
    return [];
  }

  override toStringInitializer(): Maybe<Code> {
    return Maybe.empty();
  }
}

export namespace ObjectType_RdfTypeProperty {
  export class Type {
    readonly filterFunction = code`nonextant`;
    readonly mutable = false;

    constructor(
      readonly fromRdfType: NamedNode,
      readonly toRdfTypes: readonly NamedNode[],
    ) {}

    @Memoize()
    get expression(): Code {
      throw new Error("should never be called");
    }

    @Memoize()
    get schema(): Code {
      throw new Error("should never be called");
    }
  }
}
