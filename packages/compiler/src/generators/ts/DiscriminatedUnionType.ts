import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { DiscriminatedUnionType_Discriminant } from "./_DiscriminatedUnionType/DiscriminatedUnionType_Discriminant.js";
import { DiscriminatedUnionType_equalsFunctionExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_equalsFunctionExpression.js";
import { DiscriminatedUnionType_filterFunctionExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_filterFunctionExpression.js";
import { DiscriminatedUnionType_filterTypeExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_filterTypeExpression.js";
import { DiscriminatedUnionType_fromJsonFunctionExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_fromJsonFunctionExpression.js";
import { DiscriminatedUnionType_fromRdfResourceValuesFunctionExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_fromRdfResourceValuesFunctionExpression.js";
import { DiscriminatedUnionType_hashFunctionExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_hashFunctionExpression.js";
import { DiscriminatedUnionType_inferDiscriminant } from "./_DiscriminatedUnionType/DiscriminatedUnionType_inferDiscriminant.js";
import { DiscriminatedUnionType_inlineExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_inlineExpression.js";
import { DiscriminatedUnionType_jsonSchemaExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_jsonSchemaExpression.js";
import { DiscriminatedUnionType_jsonTypeLiteral } from "./_DiscriminatedUnionType/DiscriminatedUnionType_jsonTypeLiteral.js";
import { DiscriminatedUnionType_schemaTypeExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_schemaTypeExpression.js";
import { DiscriminatedUnionType_toJsonFunctionExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_toJsonFunctionExpression.js";
import { DiscriminatedUnionType_toRdfResourceValuesFunctionExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_toRdfResourceValuesFunctionExpression.js";
import { DiscriminatedUnionType_toStringFunctionExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_toStringFunctionExpression.js";
import { DiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression.js";
import { DiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression } from "./_DiscriminatedUnionType/DiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { Type } from "./Type.js";
import {
  type Code,
  code,
  def,
  joinCode,
  literalOf,
} from "./ts-poet-wrapper.js";

export class DiscriminatedUnionType<
  MemberTypeT extends Type,
> extends AbstractType {
  protected readonly discriminant: DiscriminatedUnionType.Discriminant;

  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly identifierType: Maybe<BlankNodeType | IdentifierType | IriType>;
  override readonly kind: "ObjectDiscriminatedUnion" | "DiscriminatedUnion" =
    "DiscriminatedUnion";
  override readonly recursive: boolean;
  override readonly validationFunction: Maybe<Code> = Maybe.empty();

  constructor({
    identifierType,
    members,
    recursive,
    ...superParameters
  }: {
    identifierType: Maybe<BlankNodeType | IdentifierType | IriType>;
    members: readonly (Pick<
      DiscriminatedUnionType.Member<MemberTypeT>,
      "type"
    > & {
      readonly discriminantValue: Maybe<number | string>;
    })[];
    recursive: boolean;
    synthetic: boolean;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.identifierType = identifierType;
    invariant(members.length >= 2);
    this.recursive = recursive;
    this.discriminant = DiscriminatedUnionType_inferDiscriminant.call(
      this,
      members,
    );

    this.lazyMembers = () =>
      members.map((member, memberI) => {
        let discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
        switch (this.discriminant.kind) {
          case "Extrinsic":
            discriminantValues = [this.discriminant.memberValues[memberI]];
            break;
          case "Hybrid":
            discriminantValues = this.discriminant.memberValues[memberI].values;
            break;
          case "Intrinsic": {
            discriminantValues =
              member.type.discriminantProperty.unsafeCoerce().values;
            break;
          }
          case "Typeof":
            discriminantValues = [this.discriminant.memberValues[memberI]];
            break;
          default:
            throw this.discriminant satisfies never;
        }

        invariant(discriminantValues.length > 0);

        const typeCheck =
          (json: boolean) =>
          (instance: Code): Code => {
            const discriminant = this.discriminant; // To get type narrowing to work

            if (discriminant.kind === "Typeof") {
              return code`(${joinCode(
                discriminantValues.map(
                  (discriminantValue) =>
                    code`typeof ${instance} === ${literalOf(discriminantValue)}`,
                ),
                { on: " || " },
              )})`;
            }

            if (discriminant.kind === "Intrinsic" && !json) {
              switch (member.type.kind) {
                case "Object":
                case "ObjectDiscriminatedUnion":
                  return code`${member.type.name.unsafeCoerce()}.is${member.type.name.unsafeCoerce()}(${instance})`;
              }
            }

            const discriminantName = json
              ? discriminant.jsonName
              : discriminant.name;

            return code`(${joinCode(
              discriminantValues.map(
                (discriminantValue) =>
                  code`${instance}["${discriminantName}"] === ${literalOf(discriminantValue)}`,
              ),
              { on: " || " },
            )})`;
          };

        return {
          discriminantValues,
          jsonType: member.type.jsonType({
            includeDiscriminantProperty:
              this.discriminant.kind === "Intrinsic" ||
              (this.discriminant.kind === "Hybrid" &&
                this.discriminant.memberValues[memberI].kind === "Intrinsic"),
          }).expression,
          jsonTypeCheck: typeCheck(true),
          primaryDiscriminantValue: discriminantValues[0],
          type: member.type,
          typeCheck: typeCheck(false),
          typeToJsonExpression: (valueVariable) =>
            member.type.toJsonExpression({
              includeDiscriminantProperty:
                this.discriminant.kind === "Intrinsic" ||
                (this.discriminant.kind === "Hybrid" &&
                  this.discriminant.memberValues[memberI].kind === "Intrinsic"),
              variables: { value: valueVariable },
            }),
          unwrap: (instance: Code): Code => {
            switch (this.discriminant.kind) {
              case "Extrinsic":
                return code`${instance}.value`;
              case "Hybrid":
                return this.discriminant.memberValues[memberI].kind ===
                  "Intrinsic"
                  ? instance
                  : code`${instance}.value`;
              case "Intrinsic":
              case "Typeof":
                return instance;
            }
          },
          wrap: (instance: Code): Code => {
            switch (this.discriminant.kind) {
              case "Extrinsic":
                return code`{ ${this.discriminant.name}: ${literalOf(discriminantValues[0])} as const, value: ${instance} }`;
              case "Hybrid":
                return this.discriminant.memberValues[memberI].kind ===
                  "Intrinsic"
                  ? instance
                  : code`{ ${this.discriminant.name}: ${literalOf(discriminantValues[0])} as const, value: ${instance} }`;
              case "Intrinsic":
              case "Typeof":
                return instance;
            }
          },
        };
      });
  }

  @Memoize()
  override get conversionFunction(): Maybe<AbstractType.ConversionFunction> {
    return Maybe.of({
      code: code`${this.reusables.snippets.identityConversionFunction}`,
      sourceTypes:
        this.discriminant.kind === "Typeof"
          ? this.members.flatMap(({ type }) =>
              type.jsTypes.map((jsType) => ({
                expression: type.expression,
                jsType,
              })),
            )
          : [
              {
                expression: this.expression,
                jsType: {
                  instanceof: "Object",
                  typeof: "object",
                },
              },
            ],
    });
  }

  @Memoize()
  get declaration(): Maybe<Code> {
    const name = this.name.extract();
    if (!name) {
      return Maybe.empty();
    }

    const declarations: Code[] = [];

    if (this.configuration.features.has("Object.type")) {
      declarations.push(
        code`export type ${def(name)} = ${DiscriminatedUnionType_inlineExpression.call(this)};`,
      );
    }

    const staticModuleDeclarations = Object.entries(
      this.staticModuleDeclarations,
    );
    if (staticModuleDeclarations.length > 0) {
      declarations.push(code`\
export namespace ${def(name)} {
${joinCode(
  staticModuleDeclarations
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map((_) => _[1]),
  { on: "\n\n" },
)}
}`);
    }

    return Maybe.of(joinCode(declarations, { on: "\n\n" }));
  }

  @Memoize()
  override get discriminantProperty(): Maybe<AbstractType.DiscriminantProperty> {
    switch (this.discriminant.kind) {
      case "Extrinsic":
        return Maybe.of({
          jsonName: this.discriminant.jsonName,
          name: this.discriminant.name,
          values: this.discriminant.memberValues,
        });
      case "Hybrid":
        return Maybe.of({
          jsonName: this.discriminant.jsonName,
          name: "termType",
          values: this.discriminant.memberValues.flatMap((_) => _.values),
        });
      case "Intrinsic":
        return Maybe.of({
          jsonName: this.discriminant.jsonName,
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
      .orDefault(DiscriminatedUnionType_equalsFunctionExpression.call(this));
  }

  @Memoize()
  override get expression(): Code {
    return this.name
      .map((name) => code`${name}`)
      .orDefault(DiscriminatedUnionType_inlineExpression.call(this));
  }

  @Memoize()
  override get filterFunction(): Code {
    return this.name
      .map((name) => code`${name}.filter`)
      .orDefault(DiscriminatedUnionType_filterFunctionExpression.call(this));
  }

  @Memoize()
  get filterType(): Code {
    return this.name
      .map((name) => code`${name}.Filter`)
      .orDefault(DiscriminatedUnionType_filterTypeExpression.call(this));
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return this.name
      .map((name) => code`${name}.fromRdfResourceValues`)
      .orDefault(
        DiscriminatedUnionType_fromRdfResourceValuesFunctionExpression.call(
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
      .orDefault(DiscriminatedUnionType_hashFunctionExpression.call(this));
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

  get jsonSchemaFunctionDeclaration(): Code {
    let expression = DiscriminatedUnionType_jsonSchemaExpression.call(this);

    const meta: Record<string, string> = {
      // id: this.name,
    };
    this.comment.ifJust((description) => {
      meta["description"] = description;
    });
    this.label.ifJust((label) => {
      meta["title"] = label;
    });
    if (Object.keys(meta).length > 0) {
      expression = code`${expression}.meta(${meta})`;
    }

    return code`export const schema = () => ${expression};`;
  }

  get jsonTypeAliasDeclaration(): Code {
    return code`export type Json = ${DiscriminatedUnionType_jsonTypeLiteral.call(this).expression}`;
  }

  @Memoize()
  get members(): readonly DiscriminatedUnionType.Member<MemberTypeT>[] {
    return this.lazyMembers();
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
  override get schema() {
    return this.name
      .map((name) => code`${name}.schema`)
      .orDefault(this.schemaExpression);
  }

  @Memoize()
  override get schemaType(): Code {
    return this.name
      .map(() => code`typeof ${this.schema}`)
      .orDefault(DiscriminatedUnionType_schemaTypeExpression.call(this));
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
        DiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression.call(
          this,
        ),
      );
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlWherePatterns`)
      .orDefault(
        DiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression.call(
          this,
        ),
      );
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

  protected get staticModuleDeclarations(): Record<string, Code> {
    const name = this.name.unsafeCoerce();
    const staticModuleDeclarations: Record<string, Code> = {};

    if (this.configuration.features.has("Object.equals")) {
      staticModuleDeclarations[`equals`] =
        code`export const equals = ${DiscriminatedUnionType_equalsFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.filter")) {
      staticModuleDeclarations[`Filter`] =
        code`export type Filter = ${DiscriminatedUnionType_filterTypeExpression.call(this)};`;
      staticModuleDeclarations[`filter`] =
        code`export const filter = ${DiscriminatedUnionType_filterFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.hash")) {
      staticModuleDeclarations[`hash`] =
        code`export const hash = ${DiscriminatedUnionType_hashFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.JSON.type")) {
      staticModuleDeclarations[`Json.type`] =
        code`${this.jsonTypeAliasDeclaration}`;
    }

    if (this.configuration.features.has("Object.JSON.schema")) {
      staticModuleDeclarations[`Json.namespace`] = code`\
export namespace Json {
  ${this.jsonSchemaFunctionDeclaration}

  export function parse(json: unknown): ${this.reusables.imports.Either}<Error, Json> {
    const jsonSafeParseResult = schema().safeParse(json);
    if (!jsonSafeParseResult.success) { return ${this.reusables.imports.Left}(jsonSafeParseResult.error); }
    return ${this.reusables.imports.Right}(jsonSafeParseResult.data);
  }
}`;
    }

    if (this.configuration.features.has("Object.fromJson")) {
      staticModuleDeclarations[`fromJson`] =
        code`export const fromJson = ${DiscriminatedUnionType_fromJsonFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.fromRdf")) {
      staticModuleDeclarations[`fromRdfResourceValues`] =
        code`export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${name}, ${this.schemaType}> = ${DiscriminatedUnionType_fromRdfResourceValuesFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.schema")) {
      staticModuleDeclarations["schema"] =
        code`export const schema = ${this.schemaExpression}`;
    }

    if (this.configuration.features.has("Object.toJson")) {
      staticModuleDeclarations[`toJson`] =
        code`export const toJson = ${DiscriminatedUnionType_toJsonFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.toRdf")) {
      staticModuleDeclarations[`toRdfResourceValues`] =
        code`export const toRdfResourceValues = ${DiscriminatedUnionType_toRdfResourceValuesFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.SPARQL")) {
      staticModuleDeclarations[`valueSparqlConstructTriples`] =
        code`export const valueSparqlConstructTriples: ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ${DiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression.call(this)};`;

      staticModuleDeclarations[`valueSparqlWherePatterns`] =
        code`export const valueSparqlWherePatterns: ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ${DiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.toString")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toString`] =
        code`export const ${syntheticNamePrefix}toString = ${DiscriminatedUnionType_toStringFunctionExpression.call(this)};`;
    }

    return staticModuleDeclarations;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.fromJson`).orDefault(DiscriminatedUnionType_fromJsonFunctionExpression.call(this))}(${variables.value})`;
  }

  override graphqlResolveExpression({
    variables,
  }: {
    variables: { value: Code };
  }): Code {
    return variables.value;
  }

  override jsonSchema({
    context,
  }: Parameters<AbstractType["jsonSchema"]>[0]): Code {
    const expression = this.name
      .map((name) => code`${name}.Json.schema()`)
      .orDefault(DiscriminatedUnionType_jsonSchemaExpression.call(this));
    if (context === "property" && this.recursive) {
      return code`${this.reusables.imports.z}.lazy((): ${this.reusables.imports.z}.ZodType<${this.jsonType().expression}> => ${expression})`;
    }
    return expression;
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    return this.name
      .map((name) => new AbstractType.JsonType(code`${name}.Json`))
      .orDefault(DiscriminatedUnionType_jsonTypeLiteral.call(this));
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.toJson`).orDefault(DiscriminatedUnionType_toJsonFunctionExpression.call(this))}(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    const { value: valueVariable, ...otherVariables } = variables;
    return code`${this.name.map((name) => code`${name}.toRdfResourceValues`).orDefault(DiscriminatedUnionType_toRdfResourceValuesFunctionExpression.call(this))}(${valueVariable}, ${otherVariables})`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.${this.configuration.syntheticNamePrefix}toString`).orDefault(DiscriminatedUnionType_toStringFunctionExpression.call(this))}(${variables.value})`;
  }

  private readonly lazyMembers: () => readonly DiscriminatedUnionType.Member<MemberTypeT>[];
}

export namespace DiscriminatedUnionType {
  export type Discriminant = DiscriminatedUnionType_Discriminant;

  export interface Member<TypeT extends Type> {
    readonly discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
    readonly jsonType: Code;
    readonly jsonTypeCheck: (instance: Code) => Code;
    readonly primaryDiscriminantValue: AbstractType.DiscriminantProperty.Value;
    readonly type: TypeT;
    readonly typeCheck: (instance: Code) => Code;
    readonly typeToJsonExpression: (valueVariable: Code) => Code;
    readonly unwrap: (instance: Code) => Code;
    readonly wrap: (instance: Code) => Code;
  }
}
