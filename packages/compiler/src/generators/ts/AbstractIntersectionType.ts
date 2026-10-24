import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractIntersectionType_equalsFunctionExpression } from "./_AbstractIntersectionType/AbstractIntersectionType_equalsFunctionExpression.js";
import { AbstractIntersectionType_filterFunctionExpression } from "./_AbstractIntersectionType/AbstractIntersectionType_filterFunctionExpression.js";
import { AbstractIntersectionType_hashFunctionExpression } from "./_AbstractIntersectionType/AbstractIntersectionType_hashFunctionExpression.js";
import { AbstractIntersectionType_toLoggableFunctionExpression } from "./_AbstractIntersectionType/AbstractIntersectionType_toLoggableFunctionExpression.js";
import { AbstractIntersectionType_toRdfResourceValuesFunctionExpression } from "./_AbstractIntersectionType/AbstractIntersectionType_toRdfResourceValuesFunctionExpression.js";
import { AbstractIntersectionType_toStringFunctionExpression } from "./_AbstractIntersectionType/AbstractIntersectionType_toStringFunctionExpression.js";
import { AbstractIntersectionType_valueSparqlConstructTriplesFunctionExpression } from "./_AbstractIntersectionType/AbstractIntersectionType_valueSparqlConstructTriplesFunctionExpression.js";
import { AbstractIntersectionType_valueSparqlWherePatternsFunctionExpression } from "./_AbstractIntersectionType/AbstractIntersectionType_valueSparqlWherePatternsFunctionExpression.js";
import { AbstractCompoundType } from "./AbstractCompoundType.js";
import type { ObjectType } from "./ObjectType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode } from "./ts-poet-wrapper.js";

export abstract class AbstractIntersectionType<
  MemberTypeT extends Type,
> extends AbstractCompoundType<
  AbstractIntersectionType.Member<MemberTypeT>,
  MemberTypeT
> {
  protected override equalsFunctionExpression =
    AbstractIntersectionType_equalsFunctionExpression;
  protected override filterFunctionExpression =
    AbstractIntersectionType_filterFunctionExpression;
  protected override hashFunctionExpression =
    AbstractIntersectionType_hashFunctionExpression;
  protected override toLoggableFunctionExpression =
    AbstractIntersectionType_toLoggableFunctionExpression;
  protected override toRdfResourceValuesFunctionExpression =
    AbstractIntersectionType_toRdfResourceValuesFunctionExpression;
  protected override toStringFunctionExpression =
    AbstractIntersectionType_toStringFunctionExpression;
  protected override valueSparqlConstructTriplesFunctionExpression =
    AbstractIntersectionType_valueSparqlConstructTriplesFunctionExpression;
  protected valueSparqlWherePatternsFunctionExpression =
    AbstractIntersectionType_valueSparqlWherePatternsFunctionExpression;

  override readonly conversionFunction: AbstractCompoundType<
    AbstractIntersectionType.Member<MemberTypeT>,
    MemberTypeT
  >["conversionFunction"] = Maybe.empty();
  override readonly discriminantProperty: AbstractCompoundType<
    AbstractIntersectionType.Member<MemberTypeT>,
    MemberTypeT
  >["discriminantProperty"] = Maybe.empty();
  override readonly graphqlArgs: AbstractCompoundType<
    AbstractIntersectionType.Member<MemberTypeT>,
    MemberTypeT
  >["graphqlArgs"] = Maybe.empty();
  readonly identifierProperty: Maybe<ObjectType.IdentifierProperty>;
  abstract override readonly kind: "ObjectIntersection" | "Intersection";
  readonly members: readonly AbstractIntersectionType.Member<MemberTypeT>[];
  override readonly recursive: boolean;
  override readonly validationFunction: AbstractCompoundType<
    AbstractIntersectionType.Member<MemberTypeT>,
    MemberTypeT
  >["validationFunction"] = Maybe.empty();

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
  } & ConstructorParameters<
    typeof AbstractCompoundType<
      AbstractIntersectionType.Member<MemberTypeT>,
      MemberTypeT
    >
  >[0]) {
    super(superParameters);
    this.identifierProperty = identifierProperty;
    invariant(members.length >= 2);
    this.members = members;
    this.recursive = recursive;
  }

  @Memoize()
  override get graphqlType(): AbstractCompoundType.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  override get jsTypes(): AbstractCompoundType<
    AbstractIntersectionType.Member<MemberTypeT>,
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
    invariant(jsTypes.length === 1);
    return jsTypes;
  }

  protected override get schemaInitializers(): readonly Code[] {
    return super.schemaInitializers.concat(
      code`members: [${joinCode(
        this.members.map(({ type }) => type.schema),
        { on: "," },
      )}] as const`,
    );
  }

  protected filterTypeExpression(): Code {
    return joinCode(
      this.members.map(({ type }) => type.filterType),
      { on: " & " },
    );
  }

  protected schemaTypeExpression(): Code {
    return code`${{
      kind: this.kind,
      members: code`[${joinCode(
        this.members.map(({ type }) => type.schemaType),
        { on: ", " },
      )}]`,
    }}`;
  }
}

export namespace AbstractIntersectionType {
  export type JsonType = AbstractCompoundType.JsonType;
  export interface Member<TypeT extends Type> {
    readonly type: TypeT;
  }
}
