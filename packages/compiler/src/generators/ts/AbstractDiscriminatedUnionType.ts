import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractDiscriminatedUnionType_conversionFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_conversionFunction.js";
import type { AbstractDiscriminatedUnionType_Discriminant } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_Discriminant.js";
import { AbstractDiscriminatedUnionType_equalsFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_equalsFunction.js";
import { AbstractDiscriminatedUnionType_filterFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_filterFunction.js";
import { AbstractDiscriminatedUnionType_filterTypeExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_filterTypeExpression.js";
import { AbstractDiscriminatedUnionType_fromJsonObjectFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_fromJsonObjectFunction.js";
import { AbstractDiscriminatedUnionType_fromRdfResourceValuesFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_fromRdfResourceValuesFunction.js";
import { AbstractDiscriminatedUnionType_hashFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_hashFunction.js";
import { AbstractDiscriminatedUnionType_inferDiscriminant } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_inferDiscriminant.js";
import { AbstractDiscriminatedUnionType_inlineExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_inlineExpression.js";
import { AbstractDiscriminatedUnionType_schemaTypeExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_schemaTypeExpression.js";
import { AbstractDiscriminatedUnionType_toJsonObjectFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_toJsonObjectFunction.js";
import { AbstractDiscriminatedUnionType_toLoggableFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_toLoggableFunction.js";
import { AbstractDiscriminatedUnionType_toRdfResourceValuesFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_toRdfResourceValuesFunction.js";
import { AbstractDiscriminatedUnionType_toStringFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_toStringFunction.js";
import { AbstractDiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_valueSparqlConstructTriplesFunction.js";
import { AbstractDiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression } from "./_AbstractDiscriminatedUnionType/AbstractDiscriminatedUnionType_valueSparqlWherePatternsFunction.js";
import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { ObjectType } from "./ObjectType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export abstract class AbstractDiscriminatedUnionType<
  MemberTypeT extends Type,
> extends AbstractCompoundType<
  AbstractDiscriminatedUnionType.Member<MemberTypeT>,
  MemberTypeT
> {
  protected readonly discriminant: AbstractDiscriminatedUnionType.Discriminant;

  protected override equalsFunctionExpression =
    AbstractDiscriminatedUnionType_equalsFunctionExpression;
  protected override filterFunctionExpression =
    AbstractDiscriminatedUnionType_filterFunctionExpression;
  protected override filterTypeExpression =
    AbstractDiscriminatedUnionType_filterTypeExpression;
  protected override fromJsonObjectFunctionExpression =
    AbstractDiscriminatedUnionType_fromJsonObjectFunctionExpression;
  protected override fromRdfResourceValuesFunctionExpression =
    AbstractDiscriminatedUnionType_fromRdfResourceValuesFunctionExpression;
  protected override hashFunctionExpression =
    AbstractDiscriminatedUnionType_hashFunctionExpression;
  protected override schemaTypeExpression =
    AbstractDiscriminatedUnionType_schemaTypeExpression;
  protected override toJsonObjectFunctionExpression =
    AbstractDiscriminatedUnionType_toJsonObjectFunctionExpression;
  protected override toLoggableFunctionExpression =
    AbstractDiscriminatedUnionType_toLoggableFunctionExpression;
  protected override toRdfResourceValuesFunctionExpression =
    AbstractDiscriminatedUnionType_toRdfResourceValuesFunctionExpression;
  protected override toStringFunctionExpression =
    AbstractDiscriminatedUnionType_toStringFunctionExpression;
  protected override valueSparqlConstructTriplesFunctionExpression =
    AbstractDiscriminatedUnionType_valueSparqlConstructTriplesFunctionExpression;
  protected override valueSparqlWherePatternsFunctionExpression =
    AbstractDiscriminatedUnionType_valueSparqlWherePatternsFunctionExpression;

  override readonly graphqlArgs: AbstractCompoundType<
    AbstractDiscriminatedUnionType.Member<MemberTypeT>,
    MemberTypeT
  >["graphqlArgs"] = Maybe.empty();
  readonly identifierProperty: Maybe<ObjectType.IdentifierProperty>;
  abstract override readonly kind:
    | "ObjectDiscriminatedUnion"
    | "DiscriminatedUnion";
  override readonly recursive: boolean;
  override readonly validationFunction: AbstractCompoundType<
    AbstractDiscriminatedUnionType.Member<MemberTypeT>,
    MemberTypeT
  >["validationFunction"] = Maybe.empty();

  constructor({
    identifierProperty,
    members,
    recursive,
    ...superParameters
  }: {
    identifierProperty: Maybe<ObjectType.IdentifierProperty>;
    members: readonly (Pick<
      AbstractDiscriminatedUnionType.Member<MemberTypeT>,
      "type"
    > & {
      readonly discriminantValue: Maybe<number | string>;
    })[];
    recursive: boolean;
    synthetic: boolean;
  } & ConstructorParameters<
    typeof AbstractCompoundType<
      AbstractDiscriminatedUnionType.Member<MemberTypeT>,
      MemberTypeT
    >
  >[0]) {
    super(superParameters);
    this.identifierProperty = identifierProperty;
    invariant(members.length >= 2);
    this.recursive = recursive;
    this.discriminant = AbstractDiscriminatedUnionType_inferDiscriminant.call(
      this,
      members,
    );

    this.lazyMembers = () =>
      members.map((member, memberI) => {
        let discriminantValues: readonly AbstractCompoundType.DiscriminantProperty.Value[];
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

        return {
          discriminantValues,
          primaryDiscriminantValue: discriminantValues[0],
          type: member.type,
          typeCheck: (instance: Code): Code => {
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

            const discriminantName = discriminant.name;

            return code`(${joinCode(
              discriminantValues.map(
                (discriminantValue) =>
                  code`${instance}["${discriminantName}"] === ${literalOf(discriminantValue)}`,
              ),
              { on: " || " },
            )})`;
          },
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

  get jsonValueType(): AbstractCompoundType<
    AbstractDiscriminatedUnionType.Member<MemberTypeT>,
    MemberTypeT
  >["jsonValueType"] {
    return this.jsonObjectType;
  }

  @Memoize()
  override get conversionFunction(): Maybe<AbstractCompoundType.ConversionFunction> {
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
  override get discriminantProperty(): Maybe<AbstractCompoundType.DiscriminantProperty> {
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
  get jsonObjectType(): AbstractCompoundType<
    AbstractDiscriminatedUnionType.Member<MemberTypeT>,
    MemberTypeT
  >["jsonObjectType"] {
    return this.jsonTypeFactory.createJsonDiscriminatedUnionType(
      this.members.map((member) => {
        const type = member.type.jsonObjectType;
        invariant(type.kind === "JsonObject");
        return {
          discriminantValue: member.primaryDiscriminantValue,
          type,
        };
      }),
      {
        name: this.name.map((name) => [name, "Json"]).extract(),
        recursive: this.recursive,
      },
    );
  }

  @Memoize()
  override get graphqlType(): AbstractCompoundType.GraphqlType {
    const name = this.name.extract();
    if (
      !name ||
      !this.members.every((member) => member.type.kind === "Object")
    ) {
      throw new Error("not implemented");
    }
    return new AbstractCompoundType.GraphqlType(
      code`${name}.GraphQL`,
      this.reusables,
    );
  }

  @Memoize()
  override get jsTypes(): AbstractCompoundType<
    AbstractDiscriminatedUnionType.Member<MemberTypeT>,
    MemberTypeT
  >["jsTypes"] {
    const jsTypes: AbstractCompoundType.JsType[] = [];
    for (const member of this.members) {
      for (const memberJsType of member.type.jsTypes) {
        if (
          !jsTypes.some((jsType) =>
            AbstractCompoundType.JsType.equals(jsType, memberJsType),
          )
        ) {
          jsTypes.push(memberJsType);
        }
      }
    }
    return jsTypes;
  }

  @Memoize()
  get members(): readonly AbstractDiscriminatedUnionType.Member<MemberTypeT>[] {
    return this.lazyMembers();
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
  private get conversionFunctionExpression(): Maybe<AbstractCompoundType.ConversionFunction> {
    return AbstractDiscriminatedUnionType_conversionFunctionExpression.call(
      this,
    );
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

    return staticModuleDeclarations;
  }

  private readonly lazyMembers: () => readonly AbstractDiscriminatedUnionType.Member<MemberTypeT>[];
}

export namespace AbstractDiscriminatedUnionType {
  export type Discriminant = AbstractDiscriminatedUnionType_Discriminant;

  export interface Member<TypeT extends Type> {
    readonly discriminantValues: readonly AbstractCompoundType.DiscriminantProperty.Value[];
    readonly primaryDiscriminantValue: AbstractCompoundType.DiscriminantProperty.Value;
    readonly type: TypeT;
    readonly typeCheck: (instance: Code) => Code;
    readonly unwrap: (instance: Code) => Code;
    readonly wrap: (instance: Code) => Code;
  }
}
