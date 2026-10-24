import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractCompoundType } from "./AbstractCompoundType.js";
import { codeEquals } from "./codeEquals.js";
import type { ObjectType } from "./ObjectType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export abstract class AbstractIntersectionType<
  MemberTypeT extends Type,
> extends AbstractCompoundType<
  AbstractIntersectionType.Member<MemberTypeT>,
  MemberTypeT
> {
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

  protected equalsFunctionExpression(): Code {
    return code`\
(left, right) =>
${joinCode(
  this.members.map(
    ({ type }) => code`${type.equalsFunction.annotatedUsage}(left, right)`,
  ),
  { on: " && " },
)}`;
  }

  protected filterFunctionExpression(): Code {
    return code`\
(filter, value) =>
  ${joinCode(
    this.members.map(
      ({ type }) => code`${type.filterFunction.annotatedUsage}(filter, value)`,
    ),
    { on: " && " },
  )}`;
  }

  protected filterTypeExpression(): Code {
    return joinCode(
      this.members.map(({ type }) => type.filterType),
      { on: " & " },
    );
  }

  protected hashFunctionExpression(): Code {
    return code`\
(hasher, value) => {
${joinCode(
  this.members.map(
    ({ type }) => code`${type.hashFunction.annotatedUsage}(hasher, value);`,
  ),
)}
}`;
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

  protected toLoggableFunctionExpression(): Code {
    const memberToLoggableExpressions = this.members.map(({ type }) =>
      type.toLoggableExpression({
        variables: { value: code`value` },
      }),
    );

    // If every toLoggable expression is the same, use that expression and don't bother discriminating the member type.
    if (
      memberToLoggableExpressions.every(
        (memberToLoggableExpression, memberI) =>
          memberI === 0 ||
          codeEquals(
            memberToLoggableExpression,
            memberToLoggableExpressions[0],
          ),
      )
    ) {
      return code`(value) => ${memberToLoggableExpressions[0]}`;
    }

    return code`(value) => [${joinCode(memberToLoggableExpressions, { on: "," })}]`;
  }

  protected toRdfResourceValuesFunctionExpression(): Code {
    return code`\
(value, _options) => {
  let rdfResourceValues: (${this.toRdfResourceValueTypesExpression})[] = [];
${joinCode(
  this.members.map(
    ({ type }) =>
      code`rdfResourceValues = rdfResourceValues.concat(${type.toRdfResourceValuesExpression(
        {
          variables: {
            graph: code`_options.graph`,
            propertyPath: code`_options.propertyPath`,
            resource: code`_options.resource`,
            resourceSet: code`_options.resourceSet`,
            value: code`value`,
          },
        },
      )});`,
  ),
)}
  return rdfResourceValues;
}`;
  }

  protected toStringFunctionExpression(): Code {
    const memberToStringExpressions = this.members.map(({ type }) =>
      type.toStringExpression({
        variables: { value: code`value` },
      }),
    );

    // If every toString expression is the same, use that expression and don't bother discriminating the member type.
    if (
      memberToStringExpressions.every(
        (memberToStringExpression, memberI) =>
          memberI === 0 ||
          codeEquals(memberToStringExpression, memberToStringExpressions[0]),
      )
    ) {
      return code`(value) => ${memberToStringExpressions[0]}`;
    }

    return code`\
(value) => JSON.stringify([${joinCode(
      this.members.map(({ type }) =>
        type.toStringExpression({
          variables: { value: code`value` },
        }),
      ),
      { on: ", " },
    )}])`;
  }

  protected valueSparqlConstructTriplesFunctionExpression(): Code {
    return code`\
({ ignoreRdfType, filter, schema, ...otherParameters }) => {
  let triples: ${this.reusables.imports.sparqljs}.Triple[] = [];

  ${joinCode(
    this.members.map(
      ({ type }, memberI) => code`\
triples = triples.concat(${type.valueSparqlConstructTriplesFunction.annotatedUsage}({ ...otherParameters, filter, ignoreRdfType: true, schema: schema.members[${literalOf(memberI)}] }));`,
    ),
  )}
  
  return triples;
}`;
  }

  protected valueSparqlWherePatternsFunctionExpression(): Code {
    return code`\
({ filter, schema, ...otherParameters }) => {
  let intersectionPatterns: ${this.reusables.snippets.SparqlPattern}[] = [];

  ${joinCode(
    this.members.map(
      ({ type }, memberI) => code`\
intersectionPatterns = intersectionPatterns.concat(${type.valueSparqlWherePatternsFunction.annotatedUsage}({ ...otherParameters, filter, ignoreRdfType: true, schema: schema.members[${literalOf(memberI)}] }));`,
    ),
  )}
  
  return intersectionPatterns;
}`;
  }
}

export namespace AbstractIntersectionType {
  export type JsonType = AbstractCompoundType.JsonType;
  export interface Member<TypeT extends Type> {
    readonly type: TypeT;
  }
}
