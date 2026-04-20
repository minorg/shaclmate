import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import type { TsFeature } from "../../enums/TsFeature.js";
import { snippets_FromRdfOptions } from "./_snippets/snippets_FromRdfOptions.js";
import { snippets_ToRdfOptions } from "./_snippets/snippets_ToRdfOptions.js";
import { AbstractType } from "./AbstractType.js";
import { codeEquals } from "./codeEquals.js";
import { imports } from "./imports.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";
import type { Typeof } from "./Typeof.js";
import {
  type Code,
  code,
  def,
  joinCode,
  literalOf,
} from "./ts-poet-wrapper.js";

interface MemberTypeDescriptor<MemberTypeT extends Type> {
  discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
  memberType: MemberTypeT;
  payload: (instance: Code) => Code;
}

export class UnionType<MemberTypeT extends Type = Type> extends AbstractType {
  private readonly alias: Maybe<string>;
  private readonly discriminant: Discriminant;
  private readonly features: ReadonlySet<TsFeature>;

  protected readonly memberTypes: readonly MemberTypeT[];

  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  override readonly kind = "UnionType";
  override readonly recursive: boolean;

  constructor({
    features,
    memberDiscriminantValues,
    memberTypes,
    name,
    recursive,
    ...superParameters
  }: {
    features: ReadonlySet<TsFeature>;
    memberDiscriminantValues: readonly string[];
    memberTypes: readonly MemberTypeT[];
    name: Maybe<string>;
    recursive: boolean;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.features = features;
    invariant(memberTypes.length >= 2);
    this.alias = name;
    this.memberTypes = memberTypes;
    this.recursive = recursive;

    if (memberDiscriminantValues.length === memberTypes.length) {
      this.discriminant = {
        descendantValues: [],
        kind: "envelope",
        name: "type",
        ownValues: memberDiscriminantValues,
      };
    } else {
      invariant(memberDiscriminantValues.length === 0);
      this.discriminant = Discriminant.infer(memberTypes);
    }
  }

  @Memoize()
  protected get memberTypeDescriptors(): readonly MemberTypeDescriptor<MemberTypeT>[] {
    return this.memberTypes.map((memberType, memberTypeI) => {
      let discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
      switch (this.discriminant.kind) {
        case "envelope":
          discriminantValues = [this.discriminant.ownValues[memberTypeI]];
          break;
        case "inline": {
          // A member type's combined discriminant property values are its "own" values plus any descendant values that are
          // not the "own" values of some other member type.
          // So if you have type A, type B, and B inherits A, then
          // A has
          //   own discriminant property values: ["A"]
          //   descendant discriminant property values: ["B"]
          // and B has
          //  own discriminant property values: ["B"]
          //  descendant discriminant property values ["B"]
          // In this case A shouldn't have "B" as a combined discriminant property value since it's "claimed" by B.
          const memberOwnDiscriminantPropertyValues =
            new Set<AbstractType.DiscriminantProperty.Value>();
          for (const memberType_ of this.memberTypes) {
            for (const ownDiscriminantPropertyValue of memberType_.discriminantProperty.unsafeCoerce()
              .ownValues) {
              memberOwnDiscriminantPropertyValues.add(
                ownDiscriminantPropertyValue,
              );
            }
          }

          discriminantValues = memberType.discriminantProperty
            .unsafeCoerce()
            .ownValues.concat(
              memberType.discriminantProperty
                .unsafeCoerce()
                .descendantValues.filter(
                  (value) => !memberOwnDiscriminantPropertyValues.has(value),
                ),
            );
          break;
        }
        case "typeof":
          discriminantValues = memberType.typeofs;
          break;
        default:
          throw this.discriminant satisfies never;
      }

      return {
        discriminantValues,
        memberType,
        payload: (instance: Code): Code => {
          switch (this.discriminant.kind) {
            case "envelope":
              return code`${instance}.value`;
            case "inline":
            case "typeof":
              return instance;
          }
        },
      };
    });
  }

  @Memoize()
  override get conversions(): readonly AbstractType.Conversion[] {
    switch (this.discriminant.kind) {
      case "envelope":
      case "inline":
        return [
          {
            conversionExpression: (value) => value,
            sourceTypeCheckExpression: (value) =>
              code`typeof ${value} === "object"`,
            sourceTypeName: this.name,
            sourceTypeof: "object",
          },
        ];
      case "typeof":
        return this.memberTypeDescriptors.map(
          ({ memberType, discriminantValues }) => ({
            conversionExpression: (value) => value,
            sourceTypeCheckExpression: (value) =>
              code`typeof ${value} === ${literalOf(discriminantValues[0])}`,
            sourceTypeName: memberType.name,
            sourceTypeof: discriminantValues[0] as Typeof,
          }),
        );
      default:
        throw this.discriminant satisfies never;
    }
  }

  @Memoize()
  get declaration(): Maybe<Code> {
    const alias = this.alias.extract();
    if (!alias) {
      return Maybe.empty();
    }

    const declarations: Code[] = [
      code`export type ${def(alias)} = ${this.inlineName};`,
    ];

    if (this.staticModuleDeclarations.length > 0) {
      declarations.push(code`\
export namespace ${def(alias)} {
${joinCode(this.staticModuleDeclarations.concat(), { on: "\n\n" })}
}`);
    }

    return Maybe.of(joinCode(declarations, { on: "\n\n" }));
  }

  @Memoize()
  override get discriminantProperty(): Maybe<AbstractType.DiscriminantProperty> {
    switch (this.discriminant.kind) {
      case "envelope":
      case "inline":
        return Maybe.of(this.discriminant);
      case "typeof":
        return Maybe.empty();
      default:
        throw this.discriminant satisfies never;
    }
  }

  @Memoize()
  override get equalsFunction(): Code {
    const alias = this.alias.extract();
    if (alias && this.features.has("equals")) {
      return code`${alias}.${syntheticNamePrefix}equals`;
    }
    return this.inlineEqualsFunction;
  }

  @Memoize()
  override get filterFunction(): Code {
    const alias = this.alias.extract();
    if (alias) {
      return code`${alias}.${syntheticNamePrefix}filter`;
    }
    return this.inlineFilterFunction;
  }

  @Memoize()
  get filterType(): Code {
    const alias = this.alias.extract();
    if (alias) {
      return code`${alias}.${syntheticNamePrefix}Filter`;
    }
    return this.inlineFilterType;
  }

  override get graphqlType(): AbstractType.GraphqlType {
    throw new Error("GraphQL doesn't support scalar unions");
  }

  @Memoize()
  override get mutable(): boolean {
    return this.memberTypes.some((memberType) => memberType.mutable);
  }

  @Memoize()
  override get name(): Code {
    return this.alias.map((name) => code`${name}`).orDefault(this.inlineName);
  }

  @Memoize()
  override get schema(): Code {
    return code`${{
      // discriminant: {
      //   kind: `${JSON.stringify(this.discriminant.kind)} as const`,
      // },
      kind: code`${literalOf("Union")} as const`,
      members: code`{ ${joinCode(
        this.memberTypeDescriptors.map(
          ({ memberType, discriminantValues }) =>
            code`${literalOf(discriminantValues[0])}: ${{
              discriminantValues,
              type: memberType.schema,
            }}`,
        ),
        { on: "," },
      )} }`,
    }}`;
  }

  override get schemaType(): Code {
    return code`${{
      // discriminant: {
      //   kind: '"envelope" | "inline" | "typeof"',
      // },
      kind: literalOf("Union"),
      members: code`{ ${joinCode(
        this.memberTypeDescriptors.map(
          ({ memberType, discriminantValues }) =>
            code`readonly ${literalOf(discriminantValues[0])}: ${{
              discriminantValues: code`readonly (number | string)[]`,
              type: memberType.schemaType,
            }}`,
        ),
        { on: ";" },
      )} }`,
    }}`;
  }

  @Memoize()
  override get sparqlConstructTriplesFunction(): Code {
    const alias = this.alias.extract();
    if (alias && this.features.has("sparql")) {
      return code`${alias}.${syntheticNamePrefix}sparqlConstructTriples`;
    }
    return this.inlineSparqlConstructTriplesFunction;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    const alias = this.alias.extract();
    if (alias && this.features.has("sparql")) {
      return code`${alias}.${syntheticNamePrefix}sparqlWherePatterns`;
    }
    return this.inlineSparqlWherePatternsFunction;
  }

  @Memoize()
  override get typeofs(): AbstractType["typeofs"] {
    return NonEmptyList.fromArray(
      this.memberTypes.flatMap((memberType) => memberType.typeofs),
    ).unsafeCoerce();
  }

  @Memoize()
  protected get staticModuleDeclarations(): readonly Code[] {
    const staticModuleDeclarations: Code[] = [];

    const alias = this.alias.unsafeCoerce();

    if (this.features.has("equals")) {
      staticModuleDeclarations.push(
        code`export const ${syntheticNamePrefix}equals = ${this.inlineEqualsFunction}`,
      );
    }
    staticModuleDeclarations.push(
      code`export type ${syntheticNamePrefix}Filter = ${this.inlineFilterType};`,
      code`export const ${syntheticNamePrefix}filter = ${this.inlineFilterFunction};`,
    );
    if (this.features.has("hash")) {
      staticModuleDeclarations.push(
        code`export function ${syntheticNamePrefix}hash<HasherT extends ${snippets.Hasher}>(value: ${alias}, hasher: HasherT): HasherT { ${this.inlineHashStatements({ depth: 0, variables: { hasher: code`hasher`, value: code`value` } })} return hasher; }`,
      );
    }
    if (this.features.has("json")) {
      staticModuleDeclarations.push(
        code`export type ${syntheticNamePrefix}Json = ${this.inlineJsonType().requiredName}`,
        code`export const ${syntheticNamePrefix}fromJson = (json: ${syntheticNamePrefix}Json) => ${this.inlineFromJsonExpression({ variables: { value: code`json` } })}`,
        code`export const ${syntheticNamePrefix}jsonZodSchema = () => ${this.inlineJsonZodSchema()}`,
        code`export const ${syntheticNamePrefix}toJson = (value: ${alias}) => ${this.inlineToJsonExpression({ variables: { value: code`value` } })}`,
      );
    }
    if (this.features.has("rdf")) {
      staticModuleDeclarations.push(
        code`export const ${syntheticNamePrefix}fromRdf = (parameters: ${snippets_FromRdfOptions} & { propertyPath: ${imports.PropertyPath}; resource: ${imports.Resource}; resourceValues: ${imports.Either}<Error, ${imports.Resource}.Values>; }) => ${this.inlineFromRdfExpression(
          {
            variables: {
              context: code`parameters.context`,
              graph: code`parameters.graph`,
              ignoreRdfType: false,
              objectSet: code`parameters.objectSet`,
              preferredLanguages: code`parameters.preferredLanguages`,
              propertyPath: code`parameters.propertyPath`,
              resource: code`parameters.resource`,
              resourceValues: code`parameters.resourceValues`,
            },
          },
        )}`,
        code`export const ${syntheticNamePrefix}toRdf = (parameters: ${snippets_ToRdfOptions} & { propertyPath: ${imports.PropertyPath}; resource: ${imports.Resource}; resourceSet: ${imports.ResourceSet}; value: ${alias}; }) => ${this.inlineToRdfExpression(
          {
            variables: {
              graph: code`parameters.graph`,
              propertyPath: code`parameters.propertyPath`,
              resource: code`parameters.resource`,
              resourceSet: code`parameters.resourceSet`,
              value: code`parameters.value`,
            },
          },
        )}`,
      );
    }
    if (this.features.has("sparql")) {
      staticModuleDeclarations.push(
        code`export const ${syntheticNamePrefix}sparqlConstructTriples = ${this.inlineSparqlConstructTriplesFunction};`,
        code`export const ${syntheticNamePrefix}sparqlWherePatterns = ${this.inlineSparqlWherePatternsFunction};`,
      );
    }

    return staticModuleDeclarations;
  }

  @Memoize()
  private get inlineEqualsFunction(): Code {
    return code`\
((left: ${this.name}, right: ${this.name}) => {
${joinCode(
  this.memberTypeDescriptors.flatMap(
    ({ memberType, discriminantValues, payload }) =>
      discriminantValues.map(
        (
          value,
        ) => code`if (${this.discriminantVariable(code`left`)} === ${literalOf(value)} && ${this.discriminantVariable(code`right`)} === ${literalOf(value)}) {
  return ${memberType.equalsFunction}(${payload(code`left`)}, ${payload(code`right`)});
}`,
      ),
  ),
)}

  return ${imports.Left}({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "boolean" as const }, type: "property" as const });
})`;
  }

  @Memoize()
  private get inlineFilterFunction(): Code {
    return code`\
((filter: ${this.filterType}, value: ${this.name}) => {
${joinCode(
  this.memberTypeDescriptors.map(
    ({ memberType, discriminantValues, payload }) => code`\
if (filter.on?.[${literalOf(discriminantValues[0])}] !== undefined) {
  switch (${this.discriminantVariable(code`value`)}) {
${discriminantValues.map((discriminantValue) => code`case ${literalOf(discriminantValue)}:`)}
    if (!${memberType.filterFunction}(filter.on[${literalOf(discriminantValues[0])}], ${payload(code`value`)})) {
      return false;
    }
    break;
  }
}`,
  ),
)}

  return true;
})`;
  }

  @Memoize()
  private get inlineFilterType(): Code {
    return code`{ readonly on?: { ${joinCode(
      this.memberTypeDescriptors.map(
        ({ memberType, discriminantValues }) =>
          code`readonly ${literalOf(discriminantValues[0])}?: ${memberType.filterType}`,
      ),
      { on: ";" },
    )} } }`;
  }

  @Memoize()
  private get inlineName(): Code {
    switch (this.discriminant.kind) {
      case "envelope":
        return code`(${joinCode(
          this.memberTypeDescriptors.map(
            ({ memberType, discriminantValues }) =>
              code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: ${literalOf(discriminantValues[0])}, value: ${memberType.name} }`,
          ),
          { on: "|" },
        )})`;
      case "inline":
        // If every type shares a discriminant (e.g., RDF/JS "termType" or generated ObjectType "type"),
        // just join their names with "|"
        return code`(${joinCode(
          this.memberTypes.map((memberType) => code`${memberType.name}`),
          { on: "|" },
        )})`;
      case "typeof":
        // The memberType.name may include literal values, but they should still be unambiguous with other member types since the typeofs
        // of the different member types are known to be different.
        return code`(${joinCode(
          this.memberTypes.map((memberType) => code`${memberType.name}`),
          { on: "|" },
        )})`;
      default:
        this.discriminant satisfies never;
        throw new Error("should never reach this point");
    }
  }

  @Memoize()
  private get inlineSparqlConstructTriplesFunction(): Code {
    return code`\
(({ ignoreRdfType, filter, schema, ...otherParameters }: ${snippets.SparqlConstructTriplesFunctionParameters}<${this.filterType}, ${this.schemaType}>) => {
  let triples: ${imports.sparqljs}.Triple[] = [];

  ${joinCode(
    this.memberTypeDescriptors.map(
      ({ memberType, discriminantValues }) => code`\
triples = triples.concat(${memberType.sparqlConstructTriplesFunction}({ ...otherParameters, filter: filter?.on?.[${literalOf(discriminantValues[0])}], ignoreRdfType: false, schema: schema.members[${literalOf(discriminantValues[0])}].type }));`,
    ),
  )}
  
  return triples;
})`;
  }

  @Memoize()
  private get inlineSparqlWherePatternsFunction(): Code {
    return code`\
(({ filter, schema, ...otherParameters }: ${snippets.SparqlWherePatternsFunctionParameters}<${this.filterType}, ${this.schemaType}>): readonly ${snippets.SparqlPattern}[] => {
  const unionPatterns: ${imports.sparqljs}.GroupPattern[] = [];

  ${joinCode(
    this.memberTypeDescriptors.map(
      ({ memberType, discriminantValues }) => code`\
unionPatterns.push({ patterns: ${memberType.sparqlWherePatternsFunction}({ ...otherParameters, filter: filter?.on?.[${literalOf(discriminantValues[0])}], ignoreRdfType: false, schema: schema.members[${literalOf(discriminantValues[0])}].type }).concat(), type: "group" });`,
    ),
  )}
  
  return [{ patterns: unionPatterns, type: "union" }];
})`;
  }

  fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    const alias = this.alias.extract();
    if (alias && this.features.has("json")) {
      return code`${alias}.${syntheticNamePrefix}fromJson(${variables.value})`;
    }
    return this.inlineFromJsonExpression({ variables });
  }

  override fromRdfExpression({
    variables,
  }: Parameters<AbstractType["fromRdfExpression"]>[0]): Code {
    const alias = this.alias.extract();
    if (alias && this.features.has("rdf")) {
      return code`${alias}.${syntheticNamePrefix}fromRdf(${variables})`;
    }
    return this.inlineFromRdfExpression({ variables });
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractType["graphqlResolveExpression"]>[0],
  ): Code {
    throw new Error("not implemented");
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly Code[] {
    const alias = this.alias.extract();
    if (alias && this.features.has("hash")) {
      return [
        code`${alias}.${syntheticNamePrefix}hash(${variables.value}, ${variables.hasher});`,
      ];
    }
    return this.inlineHashStatements({ depth, variables });
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    const alias = this.alias.extract();
    if (alias && this.features.has("json")) {
      return new AbstractType.JsonType(`${alias}.${syntheticNamePrefix}Json`);
    }
    return this.inlineJsonType();
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  override jsonZodSchema({
    context,
  }: Parameters<AbstractType["jsonZodSchema"]>[0]): Code {
    const alias = this.alias.extract();
    if (alias && this.features.has("json")) {
      const expression = code`${alias}.${syntheticNamePrefix}jsonZodSchema()`;
      if (context === "property" && this.recursive) {
        return code`${imports.z}.lazy((): ${imports.z}.ZodType<${alias}.${syntheticNamePrefix}Json> => ${expression})`;
      }
      return expression;
    }

    return this.inlineJsonZodSchema();
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    const alias = this.alias.extract();
    if (alias && this.features.has("json")) {
      return code`${alias}.${syntheticNamePrefix}toJson(${variables.value})`;
    }
    return this.inlineToJsonExpression({ variables });
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): Code {
    const alias = this.alias.extract();
    if (alias && this.features.has("rdf")) {
      return code`${alias}.${syntheticNamePrefix}toRdf(${variables})`;
    }
    return this.inlineToRdfExpression({ variables });
  }

  private discriminantVariable(variableValue: Code): Code {
    switch (this.discriminant.kind) {
      case "envelope":
      case "inline":
        return code`${variableValue}.${this.discriminant.name}`;
      case "typeof":
        return code`(typeof ${variableValue})`;
    }
  }

  private inlineFromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    return this.ternaryExpression({
      memberTypeExpression: ({ memberType, discriminantValues, payload }) => {
        let typeExpression: Code = memberType.fromJsonExpression({
          variables: {
            value: payload(variables.value),
          },
        });
        if (this.discriminant.kind === "envelope") {
          typeExpression = code`{ ${this.discriminant.name}: ${literalOf(discriminantValues[0])} as const, value: ${typeExpression} }`;
        }
        return typeExpression;
      },
      variables,
    });
  }

  private inlineFromRdfExpression({
    variables,
  }: Parameters<AbstractType["fromRdfExpression"]>[0]): Code {
    return code`${variables.resourceValues}.chain(values => values.chainMap(value => {
      const valueAsValues = ${imports.Right}(value.toValues());
      return ${this.memberTypeDescriptors.reduce(
        (expression, { memberType, discriminantValues }) => {
          let typeExpression: Code = memberType.fromRdfExpression({
            variables: {
              ...variables,
              ignoreRdfType: false,
              resourceValues: code`valueAsValues`,
            },
          });
          if (this.discriminant.kind === "envelope") {
            typeExpression = code`${typeExpression}.map(values => values.map(value => ({ ${this.discriminant.name}: ${literalOf(discriminantValues[0])} as const, value }) as (${this.name})))`;
          }
          typeExpression = code`(${typeExpression} as ${imports.Either}<Error, ${imports.Resource}.Values<${this.name}>>)`;
          return expression !== null
            ? code`${expression}.altLazy(() => ${typeExpression})`
            : typeExpression;
        },
        null as Code | null,
      )!}.chain(values => values.head());
      }))`;
  }

  private inlineHashStatements({
    depth,
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly Code[] {
    const caseBlocks: Code[] = this.memberTypeDescriptors.map(
      ({ memberType, discriminantValues, payload }) =>
        code`${joinCode(discriminantValues.map((discriminantPropertyValue) => code`case ${literalOf(discriminantPropertyValue)}:`))} { ${joinCode(
          memberType
            .hashStatements({
              depth: depth + 1,
              variables: {
                hasher: variables.hasher,
                value: payload(variables.value),
              },
            })
            .concat(),
        )} break; }`,
    );

    caseBlocks.push(
      code`default: ${variables.value} satisfies never; throw new Error("unrecognized type");`,
    );
    return [
      code`switch (${this.discriminantVariable(variables.value)}) { ${joinCode(caseBlocks)} }`,
    ];
  }

  @Memoize()
  private inlineJsonType(): AbstractType.JsonType {
    switch (this.discriminant.kind) {
      case "envelope":
        return new AbstractType.JsonType(
          code`(${joinCode(
            this.memberTypeDescriptors.map(
              ({ memberType, discriminantValues }) =>
                code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: ${literalOf(discriminantValues[0])}, value: ${memberType.jsonType().name} }`,
            ),
            { on: "|" },
          )})`,
        );
      case "inline":
      case "typeof":
        return new AbstractType.JsonType(
          joinCode(
            this.memberTypes.map(
              (memberType) =>
                code`${
                  memberType.jsonType({
                    includeDiscriminantProperty:
                      this.discriminant.kind === "inline",
                  }).name
                }`,
            ),
            { on: "|" },
          ),
        );
      default:
        throw this.discriminant satisfies never;
    }
  }

  private inlineJsonZodSchema(): Code {
    switch (this.discriminant.kind) {
      case "envelope":
        return code`${imports.z}.discriminatedUnion("${this.discriminant.name}", [${joinCode(
          this.memberTypeDescriptors.map(
            ({ memberType, discriminantValues }) =>
              code`${imports.z}.object({ ${(this.discriminant as EnvelopeDiscriminant).name}: ${imports.z}.literal(${literalOf(discriminantValues[0])}), value: ${memberType.jsonZodSchema({ context: "type" })} })`,
          ),
          { on: "," },
        )}])`;
      case "inline":
        return code`${imports.z}.discriminatedUnion("${this.discriminant.name}", [${joinCode(
          this.memberTypes.map((memberType) =>
            memberType.jsonZodSchema({
              includeDiscriminantProperty: true,
              context: "type",
            }),
          ),
          { on: "," },
        )}])`;
      case "typeof":
        return code`${imports.z}.union([${joinCode(
          this.memberTypes.map((memberType) =>
            memberType.jsonZodSchema({ context: "type" }),
          ),
          { on: "," },
        )}])`;
      default:
        throw this.discriminant satisfies never;
    }
  }

  private inlineToJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    switch (this.discriminant.kind) {
      case "envelope":
        return this.ternaryExpression({
          memberTypeExpression: ({ memberType, discriminantValues, payload }) =>
            code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: ${literalOf(discriminantValues[0])} as const, value: ${memberType.toJsonExpression(
              {
                variables: {
                  ...variables,
                  value: payload(variables.value),
                },
              },
            )} }`,
          variables,
        });
      case "inline":
      case "typeof":
        return this.ternaryExpression({
          memberTypeExpression: ({ memberType, payload }) =>
            memberType.toJsonExpression({
              includeDiscriminantProperty: this.discriminant.kind === "inline",
              variables: {
                ...variables,
                value: payload(variables.value),
              },
            }),
          variables,
        });
    }
  }

  private inlineToRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): Code {
    return this.ternaryExpression({
      memberTypeExpression: ({ memberType, payload }) =>
        code`(${memberType.toRdfExpression({
          variables: {
            ...variables,
            value: payload(variables.value),
          },
        })} as (bigint | boolean | number | string | ${imports.BlankNode} | ${imports.Literal} | ${imports.NamedNode})[])`,
      variables,
    });
  }

  private ternaryExpression({
    memberTypeExpression,
    variables,
  }: {
    memberTypeExpression: (
      memberTypeDescriptor: MemberTypeDescriptor<MemberTypeT>,
    ) => Code;
    variables: { value: Code };
  }): Code {
    return this.memberTypeDescriptors.reduce(
      (expression, memberTypeDescriptor) => {
        if (expression === null) {
          return memberTypeExpression(memberTypeDescriptor);
        }

        const memberTypeExpression_ =
          memberTypeExpression(memberTypeDescriptor);
        if (codeEquals(memberTypeExpression_, expression)) {
          return expression;
        }

        return code`(${joinCode(
          memberTypeDescriptor.discriminantValues.map(
            (value) =>
              code`${this.discriminantVariable(variables.value)} === ${literalOf(value)}`,
          ),
          { on: "||" },
        )}) ? ${memberTypeExpression_} : ${expression}`;
      },
      null as Code | null,
    )!;
  }
}

type Discriminant =
  | EnvelopeDiscriminant
  | InlineDiscriminant
  | TypeofDiscriminant;

type EnvelopeDiscriminant = {
  kind: "envelope";
} & AbstractType.DiscriminantProperty;

type InlineDiscriminant = {
  kind: "inline";
} & AbstractType.DiscriminantProperty;

type TypeofDiscriminant = {
  kind: "typeof";
};

export namespace Discriminant {
  function inlineDiscriminantProperty(memberTypes: readonly Type[]):
    | (Omit<
        AbstractType.DiscriminantProperty,
        "descendantValues" | "ownValues"
      > & {
        // Mutable value arrays
        descendantValues: AbstractType.DiscriminantProperty.Value[];
        ownValues: AbstractType.DiscriminantProperty.Value[];
      })
    | undefined {
    let inlineDiscriminantProperty:
      | (Omit<
          AbstractType.DiscriminantProperty,
          "descendantValues" | "ownValues"
        > & {
          // Mutable value arrays
          descendantValues: AbstractType.DiscriminantProperty.Value[];
          ownValues: AbstractType.DiscriminantProperty.Value[];
        })
      | undefined;
    for (const memberType of memberTypes) {
      const memberTypeDiscriminantProperty =
        memberType.discriminantProperty.extract();
      if (!memberTypeDiscriminantProperty) {
        inlineDiscriminantProperty = undefined;
        break;
      }
      if (!inlineDiscriminantProperty) {
        inlineDiscriminantProperty = {
          name: memberTypeDiscriminantProperty.name,
          ownValues: memberTypeDiscriminantProperty.ownValues.concat(),
          descendantValues:
            memberTypeDiscriminantProperty.descendantValues.concat(),
        };
      } else if (
        memberTypeDiscriminantProperty.name === inlineDiscriminantProperty.name
      ) {
        inlineDiscriminantProperty.descendantValues =
          inlineDiscriminantProperty.descendantValues.concat(
            memberTypeDiscriminantProperty.descendantValues,
          );
        inlineDiscriminantProperty.ownValues =
          inlineDiscriminantProperty.ownValues.concat(
            memberTypeDiscriminantProperty.ownValues,
          );
      } else {
        return undefined;
      }
    }

    return inlineDiscriminantProperty;
  }

  export function infer(memberTypes: readonly Type[]): Discriminant {
    // Infer the discriminant kind
    const inlineDiscriminantProperty_ = inlineDiscriminantProperty(memberTypes);
    if (inlineDiscriminantProperty_) {
      return {
        ...inlineDiscriminantProperty_,
        kind: "inline",
      };
    }

    const memberTypeofs = new Set<string>();
    for (const memberType of memberTypes) {
      for (const typeof_ of memberType.typeofs) {
        memberTypeofs.add(typeof_);
      }
    }
    if (memberTypeofs.size === memberTypes.length) {
      return {
        kind: "typeof",
      };
    }

    let ownValues: AbstractType.DiscriminantProperty.Value[];
    const memberTypeNames = memberTypes.map((memberType) => memberType.name);
    if (
      memberTypeNames.every(
        (memberTypeName) => typeof memberTypeName === "string",
      )
    ) {
      const memberTypeNamesSet = new Set(memberTypeNames);
      if (memberTypeNamesSet.size === memberTypeNames.length) {
        // If every member type name is a unique string, use those strings as the discriminant values.
        ownValues = memberTypeNames;
      } else {
        // Otherwise prefix the non-unique strings with an index and use those as the discriminant values.
        ownValues = memberTypeNames.map(
          (memberTypeName, memberTypeIndex) =>
            `${memberTypeIndex}-${memberTypeName}`,
        );
      }
    } else {
      // At least one member type name is Code
      // Use member type indices as the discriminant values.
      ownValues = memberTypes.map((_, memberTypeIndex) => memberTypeIndex);
    }

    return {
      descendantValues: [],
      kind: "envelope",
      name: "type",
      ownValues,
    };
  }
}
