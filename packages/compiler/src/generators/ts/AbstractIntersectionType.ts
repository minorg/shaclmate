import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import type { ObjectType } from "./ObjectType.js";
import { singleEntryRecord } from "./singleEntryRecord.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export abstract class AbstractIntersectionType<
  MemberTypeT extends Type,
> extends AbstractType {
  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly identifierProperty: Maybe<ObjectType.IdentifierProperty>;
  abstract override readonly kind: "ObjectIntersection" | "Intersection";
  readonly members: readonly AbstractIntersectionType.Member<MemberTypeT>[];
  override readonly recursive: boolean;
  override readonly validationFunction: Maybe<Code> = Maybe.empty();

  constructor({
    identifierProperty,
    members,
    recursive,
    ...superParameters
  }: {
    identifierProperty: Maybe<ObjectType.IdentifierProperty>;
    members: readonly AbstractIntersectionType.Member<MemberTypeT>[];
    recursive: boolean;
    synthetic: boolean;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.identifierProperty = identifierProperty;
    invariant(members.length >= 2);
    this.members = members;
    this.recursive = recursive;
  }

  @Memoize()
  override get conversionFunction(): Maybe<AbstractType.ConversionFunction> {
    if (this.conversionFunctionExpression.isNothing()) {
      return this.conversionFunctionExpression;
    }

    return this.name
      .map((name) =>
        Maybe.of({
          code: code`${name}.convert`,
          sourceTypes: this.conversionFunctionExpression.extract()!.sourceTypes,
        }),
      )
      .orDefault(this.conversionFunctionExpression);
  }

  @Memoize()
  override get discriminantProperty(): Maybe<AbstractType.DiscriminantProperty> {
    switch (this.discriminant.kind) {
      case "Extrinsic":
        return Maybe.of({
          name: this.discriminant.name,
          values: this.discriminant.memberValues,
        });
      case "Hybrid":
        return Maybe.of({
          name: "termType",
          values: this.discriminant.memberValues.flatMap((_) => _.values),
        });
      case "Intrinsic":
        return Maybe.of({
          name: this.discriminant.name,
          values: this.discriminant.memberValues,
        });
      case "Typeof":
        return Maybe.empty();
      default:
        throw this.discriminant satisfies never;
    }
  }

  @Memoize()
  override get equalsFunction(): Code {
    return this.name
      .map((name) => code`${name}.equals`)
      .orDefault(AbstractIntersectionType_equalsFunctionExpression.call(this));
  }

  @Memoize()
  override get filterFunction(): Code {
    return this.name
      .map((name) => code`${name}.filter`)
      .orDefault(AbstractIntersectionType_filterFunctionExpression.call(this));
  }

  @Memoize()
  get filterType(): Code {
    return this.name
      .map((name) => code`${name}.Filter`)
      .orDefault(AbstractIntersectionType_filterTypeExpression.call(this));
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return this.name
      .map((name) => code`${name}.fromRdfResourceValues`)
      .orDefault(
        AbstractIntersectionType_fromRdfResourceValuesFunctionExpression.call(
          this,
        ),
      );
  }

  @Memoize()
  override get graphqlType(): AbstractType.GraphqlType {
    const name = this.name.extract();
    if (
      !name ||
      !this.members.every((member) => member.type.kind === "Object")
    ) {
      throw new Error("not implemented");
    }
    return new AbstractType.GraphqlType(code`${name}.GraphQL`, this.reusables);
  }

  @Memoize()
  override get hashFunction(): Code {
    return this.name
      .map((name) => code`${name}.hash`)
      .orDefault(AbstractIntersectionType_hashFunctionExpression.call(this));
  }

  @Memoize()
  override get jsTypes(): AbstractType["jsTypes"] {
    const jsTypes: AbstractType.JsType[] = [];
    for (const member of this.members) {
      for (const memberJsType of member.type.jsTypes) {
        if (
          !jsTypes.some((jsType) =>
            AbstractType.JsType.equals(jsType, memberJsType),
          )
        ) {
          jsTypes.push(memberJsType);
        }
      }
    }
    return jsTypes;
  }

  @Memoize()
  override get mutable(): boolean {
    return this.members.some((member) => member.type.mutable);
  }

  get referencesNamedType(): boolean {
    return (
      this.name.isJust() ||
      this.members.some((member) => member.type.referencesNamedType)
    );
  }

  @Memoize()
  override get schemaType(): Code {
    return this.name
      .map(() => code`typeof ${this.schema}`)
      .orDefault(AbstractIntersectionType_schemaTypeExpression.call(this));
  }

  @Memoize()
  get toRdfResourceValueTypes(): AbstractType["toRdfResourceValueTypes"] {
    const set = new Set<"BlankNode" | "Literal" | "NamedNode">();
    for (const member of this.members) {
      for (const value of member.type.toRdfResourceValueTypes) {
        set.add(value);
      }
    }
    return set;
  }

  @Memoize()
  override get valueSparqlConstructTriplesFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlConstructTriples`)
      .orDefault(
        AbstractIntersectionType_valueSparqlConstructTriplesFunctionExpression.call(
          this,
        ),
      );
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlWherePatterns`)
      .orDefault(
        AbstractIntersectionType_valueSparqlWherePatternsFunctionExpression.call(
          this,
        ),
      );
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    return AbstractIntersectionType_inlineExpression.call(this);
  }

  protected override get schemaInitializers(): readonly Code[] {
    return super.schemaInitializers.concat(
      code`members: { ${joinCode(
        this.members.map(
          ({ discriminantValues, type, primaryDiscriminantValue }) =>
            code`${literalOf(primaryDiscriminantValue)}: ${{
              discriminantValues: discriminantValues,
              type: type.schema,
            }}`,
        ),
        { on: "," },
      )} }`,
    );
  }

  @Memoize()
  private get conversionFunctionExpression(): Maybe<AbstractType.ConversionFunction> {
    return AbstractIntersectionType_conversionFunctionExpression.call(this);
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.fromJson`).orDefault(AbstractIntersectionType_fromJsonFunctionExpression.call(this))}(${variables.value})`;
  }

  override graphqlResolveExpression({
    variables,
  }: {
    variables: { value: Code };
  }): Code {
    return variables.value;
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    return this.jsonTypeFactory.createJsonIntersectionType(
      this.members.map((member) => {
        const memberJsonType = member.type.jsonType({
          discriminantProperty: singleEntryRecord(
            this.configuration.objectDiscriminantProperty.jsonName,
            {
              type:
                typeof member.primaryDiscriminantValue === "number"
                  ? this.jsonTypeFactory.createJsonNumberType({
                      in_: [member.primaryDiscriminantValue],
                    })
                  : this.jsonTypeFactory.createJsonStringType({
                      in_: [member.primaryDiscriminantValue],
                    }),
            },
          ),
          form: "expanded",
        });
        invariant(memberJsonType.kind === "JsonObject", memberJsonType.kind);
        return memberJsonType;
      }),
      {
        name: this.name.map((name) => [name, "Json"]).extract(),
        recursive: this.recursive,
      },
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.toJson`).orDefault(AbstractIntersectionType_toJsonFunctionExpression.call(this))}(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    const { value: valueVariable, ...otherVariables } = variables;
    return code`${this.name.map((name) => code`${name}.toRdfResourceValues`).orDefault(AbstractIntersectionType_toRdfResourceValuesFunctionExpression.call(this))}(${valueVariable}, ${otherVariables})`;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractType["toLoggableExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.${this.configuration.syntheticNamePrefix}toLoggable`).orDefault(AbstractIntersectionType_toLoggableFunctionExpression.call(this))}(${variables.value})`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.${this.configuration.syntheticNamePrefix}toString`).orDefault(AbstractIntersectionType_toStringFunctionExpression.call(this))}(${variables.value})`;
  }

  protected override staticModuleDeclarations(
    name: string,
  ): Record<string, Code> {
    const staticModuleDeclarations: Record<string, Code> = {
      ...super.staticModuleDeclarations(name),
    };

    this.conversionFunctionExpression.ifJust((conversionFunction) => {
      staticModuleDeclarations["convert"] =
        code`export const convert = ${conversionFunction.code};`;
    });

    if (this.configuration.features.has("Object.equals")) {
      staticModuleDeclarations["equals"] =
        code`export const equals = ${AbstractIntersectionType_equalsFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.filter")) {
      staticModuleDeclarations["Filter"] =
        code`export type Filter = ${AbstractIntersectionType_filterTypeExpression.call(this)};`;
      staticModuleDeclarations["filter"] =
        code`export const filter = ${AbstractIntersectionType_filterFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.hash")) {
      staticModuleDeclarations["hash"] =
        code`export const hash = ${AbstractIntersectionType_hashFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.JSON.type")) {
      this.jsonType().declaration.ifJust((jsonTypeDeclaration) => {
        staticModuleDeclarations["JSON"] = jsonTypeDeclaration;
      });
    }

    if (this.configuration.features.has("Object.fromJson")) {
      staticModuleDeclarations["fromJson"] =
        code`export const fromJson = ${AbstractIntersectionType_fromJsonFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.fromRdf")) {
      staticModuleDeclarations["fromRdfResourceValues"] =
        code`export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${name}, ${this.schemaType}> = ${AbstractIntersectionType_fromRdfResourceValuesFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.toJson")) {
      staticModuleDeclarations["toJson"] =
        code`export const toJson = ${AbstractIntersectionType_toJsonFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.toRdf")) {
      staticModuleDeclarations["toRdfResourceValues"] =
        code`export const toRdfResourceValues = ${AbstractIntersectionType_toRdfResourceValuesFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.SPARQL")) {
      staticModuleDeclarations["valueSparqlConstructTriples"] =
        code`export const valueSparqlConstructTriples: ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ${AbstractIntersectionType_valueSparqlConstructTriplesFunctionExpression.call(this)};`;

      staticModuleDeclarations["valueSparqlWherePatterns"] =
        code`export const valueSparqlWherePatterns: ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ${AbstractIntersectionType_valueSparqlWherePatternsFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.toLoggable")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toLoggable`] =
        code`export const ${syntheticNamePrefix}toLoggable = ${AbstractIntersectionType_toLoggableFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.toString")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toString`] =
        code`export const ${syntheticNamePrefix}toString = ${AbstractIntersectionType_toStringFunctionExpression.call(this)};`;
    }

    return staticModuleDeclarations;
  }
}

export namespace AbstractIntersectionType {
  export interface Member<TypeT extends Type> {
    readonly type: TypeT;
  }
}
