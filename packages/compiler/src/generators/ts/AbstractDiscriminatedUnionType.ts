import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractDiscriminatedUnionType_conversionFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_conversionFunctionExpression.js";
import type { AbstractDiscriminatedUnionType_Discriminant } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_Discriminant.js";
import { AbstractDiscriminatedUnionType_equalsFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_equalsFunctionExpression.js";
import { AbstractDiscriminatedUnionType_filterFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_filterFunctionExpression.js";
import { AbstractDiscriminatedUnionType_filterTypeExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_filterTypeExpression.js";
import { AbstractDiscriminatedUnionType_fromJsonFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_fromJsonFunctionExpression.js";
import { AbstractDiscriminatedUnionType_fromRdfResourceValuesFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_fromRdfResourceValuesFunctionExpression.js";
import { AbstractDiscriminatedUnionType_hashFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_hashFunctionExpression.js";
import { AbstractDiscriminatedUnionType_inferDiscriminant } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_inferDiscriminant.js";
import { AbstractDiscriminatedUnionType_inlineExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_inlineExpression.js";
import { AbstractDiscriminatedUnionType_jsonSchemaExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_jsonSchemaExpression.js";
import { AbstractDiscriminatedUnionType_jsonTypeLiteral } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_jsonTypeLiteral.js";
import { AbstractDiscriminatedUnionType_schemaTypeExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_schemaTypeExpression.js";
import { AbstractDiscriminatedUnionType_toJsonFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_toJsonFunctionExpression.js";
import { AbstractDiscriminatedUnionType_toRdfResourceValuesFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_toRdfResourceValuesFunctionExpression.js";
import { AbstractDiscriminatedUnionType_toStringFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_toStringFunctionExpression.js";
import { AbstractDiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression.js";
import { AbstractDiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression.js";
import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export abstract class AbstractDiscriminatedUnionType<
  MemberTypeT extends Type,
> extends AbstractType {
  protected readonly discriminant: AbstractDiscriminatedUnionType.Discriminant;

  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly identifierType: Maybe<BlankNodeType | IdentifierType | IriType>;
  abstract override readonly kind:
    | "ObjectDiscriminatedUnion"
    | "DiscriminatedUnion";
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
      AbstractDiscriminatedUnionType.Member<MemberTypeT>,
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
    this.discriminant = AbstractDiscriminatedUnionType_inferDiscriminant.call(
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

            // Causes problems in mixed Object | other dicriminated unions
            // if (discriminant.kind === "Intrinsic" && !json) {
            //   switch (member.type.kind) {
            //     case "Object":
            //     case "ObjectDiscriminatedUnion":
            //       return code`${member.type.name.unsafeCoerce()}.is${member.type.name.unsafeCoerce()}(${instance})`;
            //   }
            // }

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
      .orDefault(
        AbstractDiscriminatedUnionType_equalsFunctionExpression.call(this),
      );
  }

  @Memoize()
  override get filterFunction(): Code {
    return this.name
      .map((name) => code`${name}.filter`)
      .orDefault(
        AbstractDiscriminatedUnionType_filterFunctionExpression.call(this),
      );
  }

  @Memoize()
  get filterType(): Code {
    return this.name
      .map((name) => code`${name}.Filter`)
      .orDefault(
        AbstractDiscriminatedUnionType_filterTypeExpression.call(this),
      );
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return this.name
      .map((name) => code`${name}.fromRdfResourceValues`)
      .orDefault(
        AbstractDiscriminatedUnionType_fromRdfResourceValuesFunctionExpression.call(
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
      .orDefault(
        AbstractDiscriminatedUnionType_hashFunctionExpression.call(this),
      );
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
    let expression =
      AbstractDiscriminatedUnionType_jsonSchemaExpression.call(this);

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
    return code`export type Json = ${AbstractDiscriminatedUnionType_jsonTypeLiteral.call(this).expression}`;
  }

  @Memoize()
  get members(): readonly AbstractDiscriminatedUnionType.Member<MemberTypeT>[] {
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
  override get schemaType(): Code {
    return this.name
      .map(() => code`typeof ${this.schema}`)
      .orDefault(
        AbstractDiscriminatedUnionType_schemaTypeExpression.call(this),
      );
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
        AbstractDiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression.call(
          this,
        ),
      );
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlWherePatterns`)
      .orDefault(
        AbstractDiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression.call(
          this,
        ),
      );
  }

  @Memoize()
  protected override get inlineExpression(): Code {
    return AbstractDiscriminatedUnionType_inlineExpression.call(this);
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
    return AbstractDiscriminatedUnionType_conversionFunctionExpression.call(
      this,
    );
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.fromJson`).orDefault(AbstractDiscriminatedUnionType_fromJsonFunctionExpression.call(this))}(${variables.value})`;
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
      .orDefault(
        AbstractDiscriminatedUnionType_jsonSchemaExpression.call(this),
      );
    if (context === "property" && this.recursive) {
      return code`${this.reusables.imports.z}.lazy((): ${this.reusables.imports.z}.ZodType<${this.jsonType().expression}> => ${expression})`;
    }
    return expression;
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    return this.name
      .map((name) => new AbstractType.JsonType(code`${name}.Json`))
      .orDefault(AbstractDiscriminatedUnionType_jsonTypeLiteral.call(this));
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.toJson`).orDefault(AbstractDiscriminatedUnionType_toJsonFunctionExpression.call(this))}(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    const { value: valueVariable, ...otherVariables } = variables;
    return code`${this.name.map((name) => code`${name}.toRdfResourceValues`).orDefault(AbstractDiscriminatedUnionType_toRdfResourceValuesFunctionExpression.call(this))}(${valueVariable}, ${otherVariables})`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.${this.configuration.syntheticNamePrefix}toString`).orDefault(AbstractDiscriminatedUnionType_toStringFunctionExpression.call(this))}(${variables.value})`;
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
        code`export const equals = ${AbstractDiscriminatedUnionType_equalsFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.filter")) {
      staticModuleDeclarations["Filter"] =
        code`export type Filter = ${AbstractDiscriminatedUnionType_filterTypeExpression.call(this)};`;
      staticModuleDeclarations["filter"] =
        code`export const filter = ${AbstractDiscriminatedUnionType_filterFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.hash")) {
      staticModuleDeclarations["hash"] =
        code`export const hash = ${AbstractDiscriminatedUnionType_hashFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.JSON.type")) {
      staticModuleDeclarations["Json.type"] =
        code`${this.jsonTypeAliasDeclaration}`;
    }

    if (this.configuration.features.has("Object.JSON.schema")) {
      staticModuleDeclarations["Json.namespace"] = code`\
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
      staticModuleDeclarations["fromJson"] =
        code`export const fromJson = ${AbstractDiscriminatedUnionType_fromJsonFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.fromRdf")) {
      staticModuleDeclarations["fromRdfResourceValues"] =
        code`export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${name}, ${this.schemaType}> = ${AbstractDiscriminatedUnionType_fromRdfResourceValuesFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.toJson")) {
      staticModuleDeclarations["toJson"] =
        code`export const toJson = ${AbstractDiscriminatedUnionType_toJsonFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.toRdf")) {
      staticModuleDeclarations["toRdfResourceValues"] =
        code`export const toRdfResourceValues = ${AbstractDiscriminatedUnionType_toRdfResourceValuesFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.SPARQL")) {
      staticModuleDeclarations["valueSparqlConstructTriples"] =
        code`export const valueSparqlConstructTriples: ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ${AbstractDiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression.call(this)};`;

      staticModuleDeclarations["valueSparqlWherePatterns"] =
        code`export const valueSparqlWherePatterns: ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ${AbstractDiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression.call(this)};`;
    }

    if (this.configuration.features.has("Object.toString")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toString`] =
        code`export const ${syntheticNamePrefix}toString = ${AbstractDiscriminatedUnionType_toStringFunctionExpression.call(this)};`;
    }

    return staticModuleDeclarations;
  }

  private readonly lazyMembers: () => readonly AbstractDiscriminatedUnionType.Member<MemberTypeT>[];
}

export namespace AbstractDiscriminatedUnionType {
  export type Discriminant = AbstractDiscriminatedUnionType_Discriminant;

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
