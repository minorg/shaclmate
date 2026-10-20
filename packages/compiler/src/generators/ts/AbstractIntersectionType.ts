import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { ObjectType } from "./ObjectType.js";
import type { Type } from "./Type.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export abstract class AbstractIntersectionType<
  MemberTypeT extends Type,
> extends AbstractType {
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
  override get equalsFunction(): Code {
    return this.name
      .map((name) => code`${name}.equals`)
      .orDefault(this.equalsFunctionExpression);
  }

  @Memoize()
  override get filterFunction(): Code {
    return this.name
      .map((name) => code`${name}.filter`)
      .orDefault(this.filterFunctionExpression);
  }

  @Memoize()
  get filterType(): Code {
    return this.name
      .map((name) => code`${name}.Filter`)
      .orDefault(this.filterTypeExpression);
  }

  @Memoize()
  override get fromRdfResourceValuesFunction(): Code {
    return this.name
      .map((name) => code`${name}.fromRdfResourceValues`)
      .orDefault(this.fromRdfResourceValuesFunctionExpression);
  }

  @Memoize()
  override get graphqlType(): AbstractType.GraphqlType {
    throw new Error("not implemented");
  }

  @Memoize()
  override get hashFunction(): Code {
    return this.name
      .map((name) => code`${name}.hash`)
      .orDefault(this.hashFunctionExpression);
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
      .orDefault(this.schemaTypeExpression);
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
      .orDefault(this.valueSparqlConstructTriplesFunctionExpression);
  }

  @Memoize()
  override get valueSparqlWherePatternsFunction(): Code {
    return this.name
      .map((name) => code`${name}.valueSparqlWherePatterns`)
      .orDefault(this.valueSparqlWherePatternsFunctionExpression);
  }

  protected override get schemaInitializers(): readonly Code[] {
    return super.schemaInitializers.concat(
      code`members: [${joinCode(
        this.members.map(({ type }) => type.schema),
        { on: "," },
      )}]`,
    );
  }

  private get equalsFunctionExpression(): Code {
    return code`\
((left: ${this.expression}, right: ${this.expression}) =>
${joinCode(
  this.members.map(({ type }) => code`${type.equalsFunction}(left, right)`),
  { on: " && " },
)})`;
  }

  private get filterFunctionExpression(): Code {
    return code`\
((filter: ${this.filterType}, value: ${this.expression}) =>
  ${joinCode(
    this.members.map(({ type }) => code`${type.filterFunction}(filter, value)`),
    { on: " && " },
  )})`;
  }

  private get filterTypeExpression(): Code {
    return joinCode(
      this.members.map(({ type }) => type.filterType),
      { on: " & " },
    );
  }

  private get fromRdfResourceValuesFunctionExpression(): Code {
    return code`\
((
  (inputValues, options) =>
    ${joinCode(
      this.members.map(
        (member, memberI) => code`\
      ${member.type.fromRdfResourceValuesFunction}(inputValues, { ...options, ignoreRdfType: true, schema: options.schema.members[${literalOf(memberI)}].type }).${memberI + 1 < this.members.length ? "chain" : "map"}(member${memberI} =>`,
      ),
    )} ({ ${joinCode(
      this.members.map((_, memberI) => code`...member${memberI}`),
      { on: "," },
    )} }) ${")".repeat(this.members.length - 1)}
) satisfies ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}, ${this.schemaType}>)`;
  }

  private get hashFunctionExpression(): Code {
    return code`\
(<HasherT extends ${this.reusables.snippets.Hasher}>(hasher: HasherT, value: ${this.expression}): HasherT => {
${joinCode(
  this.members.map(({ type }) => code`${type.hashFunction}(hasher, value);`),
)}
  return hasher;
})`;
  }

  private get schemaTypeExpression(): Code {
    return code`${{
      kind: this.kind,
      members: code`[${joinCode(
        this.members.map(({ type }) => type.schemaType),
        { on: ", " },
      )}]`,
    }}`;
  }

  private get valueSparqlConstructTriplesFunctionExpression(): Code {
    return code`\
((({ ignoreRdfType, filter, schema, ...otherParameters }) => {
  let triples: ${this.reusables.imports.sparqljs}.Triple[] = [];

  ${joinCode(
    this.members.map(
      ({ type }, memberI) => code`\
triples = triples.concat(${type.valueSparqlConstructTriplesFunction}({ ...otherParameters, filter, ignoreRdfType: true, schema: schema.members[${literalOf(memberI)}].type }));`,
    ),
  )}
  
  return triples;
}) satisfies ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}>)`;
  }

  private get valueSparqlWherePatternsFunctionExpression(): Code {
    return code`\
((
  ({ filter, schema, ...otherParameters }) => {
    let intersectionPatterns: ${this.reusables.snippets.SparqlPattern}[] = [];

    ${joinCode(
      this.members.map(
        ({ type }, memberI) => code`\
intersectionPatterns = intersectionPatterns.concat(${type.valueSparqlWherePatternsFunction}({ ...otherParameters, filter, ignoreRdfType: true, schema: schema.members[${literalOf(memberI)}].type });`,
      ),
    )}
    
    return intersectionPatterns;
}) satisfies ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>)`;
  }

  // override fromJsonExpression({
  //   variables,
  // }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
  //   return code`${this.name.map((name) => code`${name}.fromJson`).orDefault(AbstractIntersectionType_fromJsonFunctionExpression.call(this))}(${variables.value})`;
  // }
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
