import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import { AbstractCompoundType } from "./AbstractCompoundType.js";
import { AbstractType } from "./AbstractType.js";
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
  override readonly conversionFunction: AbstractType["conversionFunction"] =
    Maybe.empty();
  override readonly discriminantProperty: AbstractType["discriminantProperty"] =
    Maybe.empty();
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
  override get graphqlType(): AbstractType.GraphqlType {
    throw new Error("not implemented");
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
((left: ${this.expression}, right: ${this.expression}) =>
${joinCode(
  this.members.map(({ type }) => code`${type.equalsFunction}(left, right)`),
  { on: " && " },
)})`;
  }

  protected filterFunctionExpression(): Code {
    return code`\
((filter: ${this.filterType}, value: ${this.expression}) =>
  ${joinCode(
    this.members.map(({ type }) => code`${type.filterFunction}(filter, value)`),
    { on: " && " },
  )})`;
  }

  protected filterTypeExpression(): Code {
    return joinCode(
      this.members.map(({ type }) => type.filterType),
      { on: " & " },
    );
  }

  protected fromJsonFunctionExpression(): Code {
    return code`\
((value: ${this.jsonType().expression}): ${this.reusables.imports.Either}<Error, ${this.expression}> =>
    ${joinCode(
      this.members.map(
        (member, memberI) => code`
${member.type.fromJsonExpression({
  form: "compact",
  variables: {
    value: code`value`,
  },
})}.${memberI + 1 < this.members.length ? "chain" : "map"}(member${memberI} =>`,
      ),
    )} ({ ${joinCode(
      this.members.map((_, memberI) => code`...member${memberI}`),
      { on: "," },
    )} }) ${")".repeat(this.members.length)}
)`;
  }

  protected fromRdfResourceValuesFunctionExpression(): Code {
    return code`\
((
  (inputValues, options) =>
    ${joinCode(
      this.members.map(
        (member, memberI) => code`\
      ${member.type.fromRdfResourceValuesFunction}(inputValues, { ...options, ignoreRdfType: true, schema: options.schema.members[${literalOf(memberI)}] }).${memberI + 1 < this.members.length ? "chain" : "map"}(member${memberI} =>`,
      ),
    )} ({ ${joinCode(
      this.members.map((_, memberI) => code`...member${memberI}`),
      { on: "," },
    )} }) ${")".repeat(this.members.length)}
) satisfies ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}>)`;
  }

  protected hashFunctionExpression(): Code {
    return code`\
(<HasherT extends ${this.reusables.snippets.Hasher}>(hasher: HasherT, value: ${this.expression}): HasherT => {
${joinCode(
  this.members.map(({ type }) => code`${type.hashFunction}(hasher, value);`),
)}
  return hasher;
})`;
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

  protected toJsonFunctionExpression(): Code {
    return code`\
((value: ${this.expression}): ${this.jsonType().expression} => ({
${joinCode(
  this.members.map(
    ({ type }) =>
      code`...${type.toJsonExpression({
        form: "compact",
        variables: { value: code`value` },
      })} }`,
  ),
)}})`;
  }

  protected toLoggableFunctionExpression(): Code {
    const memberToLoggableExpressions = this.members.map(({ type }) =>
      type.toLoggableExpression({
        variables: { value: code`value` },
      }),
    );

    const returnTypeAnnotation = this.recursive ? code`: any` : code``;

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
      return code`((value: ${this.expression})${returnTypeAnnotation} => ${memberToLoggableExpressions[0]})`;
    }

    return code`((value: ${this.expression})${returnTypeAnnotation} => [${joinCode(memberToLoggableExpressions, { on: "," })}])`;
  }

  protected toRdfResourceValuesFunctionExpression(): Code {
    const returnType = code`(${joinCode(
      [...this.toRdfResourceValueTypes].map((toRdfResourceValueType) => {
        switch (toRdfResourceValueType) {
          case "BlankNode":
            return code`${this.reusables.imports.BlankNode}`;
          case "Literal":
            return code`${this.reusables.imports.Literal}`;
          case "NamedNode":
            return code`${this.reusables.imports.NamedNode}`;
          default:
            toRdfResourceValueType satisfies never;
            throw new Error();
        }
      }),
      { on: " | " },
    )})[]`;

    return code`\
((
  (value, _options): ${returnType} => {
    let rdfResourceValues: ${returnType} = [];
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
  }
) satisfies ${this.reusables.snippets.ToRdfResourceValuesFunction}<${this.expression}>)`;
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
      return code`((value: ${this.expression}): string => ${memberToStringExpressions[0]})`;
    }

    return code`\
((value: ${this.expression}): string =>
JSON.stringify([${joinCode(
      this.members.map(({ type }) =>
        type.toStringExpression({
          variables: { value: code`value` },
        }),
      ),
      { on: ", " },
    )}]))`;
  }

  protected valueSparqlConstructTriplesFunctionExpression(): Code {
    return code`\
((({ ignoreRdfType, filter, schema, ...otherParameters }) => {
  let triples: ${this.reusables.imports.sparqljs}.Triple[] = [];

  ${joinCode(
    this.members.map(
      ({ type }, memberI) => code`\
triples = triples.concat(${type.valueSparqlConstructTriplesFunction}({ ...otherParameters, filter, ignoreRdfType: true, schema: schema.members[${literalOf(memberI)}] }));`,
    ),
  )}
  
  return triples;
}) satisfies ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}>)`;
  }

  protected valueSparqlWherePatternsFunctionExpression(): Code {
    return code`\
((
  ({ filter, schema, ...otherParameters }) => {
    let intersectionPatterns: ${this.reusables.snippets.SparqlPattern}[] = [];

    ${joinCode(
      this.members.map(
        ({ type }, memberI) => code`\
intersectionPatterns = intersectionPatterns.concat(${type.valueSparqlWherePatternsFunction}({ ...otherParameters, filter, ignoreRdfType: true, schema: schema.members[${literalOf(memberI)}] });`,
      ),
    )}
    
    return intersectionPatterns;
}) satisfies ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>)`;
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    return this.jsonTypeFactory.createJsonIntersectionType(
      this.members.map((member) => member.type.jsonType({ form: "compact" })),
      {
        name: this.name.map((name) => [name, "Json"]).extract(),
        recursive: this.recursive,
      },
    );
  }
}

export namespace AbstractIntersectionType {
  export interface Member<TypeT extends Type> {
    readonly type: TypeT;
  }
}
