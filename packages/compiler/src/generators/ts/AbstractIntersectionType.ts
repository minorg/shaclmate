import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import { codeEquals } from "./codeEquals.js";
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
    invariant(jsTypes.length === 1);
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
      )}] as const`,
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

  private get fromJsonFunctionExpression(): Code {
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

  private get fromRdfResourceValuesFunctionExpression(): Code {
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

  private get toJsonFunctionExpression(): Code {
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

  private get toLoggableFunctionExpression(): Code {
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

  private get toRdfResourceValuesFunctionExpression(): Code {
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

  private get toStringFunctionExpression(): Code {
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

  private get valueSparqlConstructTriplesFunctionExpression(): Code {
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

  private get valueSparqlWherePatternsFunctionExpression(): Code {
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

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.fromJson`).orDefault(this.fromJsonFunctionExpression)}(${variables.value})`;
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
      this.members.map((member) => member.type.jsonType({ form: "compact" })),
      {
        name: this.name.map((name) => [name, "Json"]).extract(),
        recursive: this.recursive,
      },
    );
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.toJson`).orDefault(this.toJsonFunctionExpression)}(${variables.value})`;
  }

  override toLoggableExpression({
    variables,
  }: Parameters<AbstractType["toLoggableExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.${this.configuration.syntheticNamePrefix}toLoggable`).orDefault(this.toLoggableFunctionExpression)}(${variables.value})`;
  }

  override toRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["toRdfResourceValuesExpression"]>[0]): Code {
    const { value: valueVariable, ...otherVariables } = variables;
    return code`${this.name.map((name) => code`${name}.toRdfResourceValues`).orDefault(this.toRdfResourceValuesFunctionExpression)}(${valueVariable}, ${otherVariables})`;
  }

  override toStringExpression({
    variables,
  }: Parameters<AbstractType["toStringExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.${this.configuration.syntheticNamePrefix}toString`).orDefault(this.toStringFunctionExpression)}(${variables.value})`;
  }

  protected override staticModuleDeclarations(
    name: string,
  ): Record<string, Code> {
    const staticModuleDeclarations: Record<string, Code> = {
      ...super.staticModuleDeclarations(name),
    };

    if (this.configuration.features.has("Object.equals")) {
      staticModuleDeclarations["equals"] =
        code`export const equals = ${this.equalsFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.filter")) {
      staticModuleDeclarations["Filter"] =
        code`export type Filter = ${this.filterTypeExpression};`;
      staticModuleDeclarations["filter"] =
        code`export const filter = ${this.filterFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.hash")) {
      staticModuleDeclarations["hash"] =
        code`export const hash = ${this.hashFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.JSON.type")) {
      this.jsonType().declaration.ifJust((jsonTypeDeclaration) => {
        staticModuleDeclarations["JSON"] = jsonTypeDeclaration;
      });
    }

    if (this.configuration.features.has("Object.fromJson")) {
      staticModuleDeclarations["fromJson"] =
        code`export const fromJson = ${this.fromJsonFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.fromRdf")) {
      staticModuleDeclarations["fromRdfResourceValues"] =
        code`export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${name}, ${this.schemaType}> = ${this.fromRdfResourceValuesFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.toJson")) {
      staticModuleDeclarations["toJson"] =
        code`export const toJson = ${this.toJsonFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.toRdf")) {
      staticModuleDeclarations["toRdfResourceValues"] =
        code`export const toRdfResourceValues = ${this.toRdfResourceValuesFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.SPARQL")) {
      staticModuleDeclarations["valueSparqlConstructTriples"] =
        code`export const valueSparqlConstructTriples: ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ${this.valueSparqlConstructTriplesFunctionExpression};`;

      staticModuleDeclarations["valueSparqlWherePatterns"] =
        code`export const valueSparqlWherePatterns: ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ${this.valueSparqlWherePatternsFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.toLoggable")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toLoggable`] =
        code`export const ${syntheticNamePrefix}toLoggable = ${this.toLoggableFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.toString")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toString`] =
        code`export const ${syntheticNamePrefix}toString = ${this.toStringFunctionExpression};`;
    }

    return staticModuleDeclarations;
  }
}

export namespace AbstractIntersectionType {
  export interface Member<TypeT extends Type> {
    readonly type: TypeT;
  }
}
