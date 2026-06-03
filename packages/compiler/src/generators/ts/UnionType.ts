import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import type { Type } from "./Type.js";
import type { Typeof } from "./Typeof.js";
import {
  type Code,
  code,
  def,
  joinCode,
  literalOf,
} from "./ts-poet-wrapper.js";

export class UnionType<MemberTypeT extends Type> extends AbstractType {
  private readonly discriminant: Discriminant;

  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly identifierType: Maybe<BlankNodeType | IdentifierType | IriType>;
  override readonly kind: "ObjectUnion" | "Union" = "Union";
  override readonly recursive: boolean;
  readonly synthetic: boolean;
  override readonly validationFunction: Maybe<Code> = Maybe.empty();

  constructor({
    identifierType,
    members,
    recursive,
    synthetic,
    ...superParameters
  }: {
    identifierType: Maybe<BlankNodeType | IdentifierType | IriType>;
    members: readonly (Pick<AbstractUnionType.Member<MemberTypeT>, "type"> & {
      readonly discriminantValue: Maybe<number | string>;
    })[];
    recursive: boolean;
    synthetic: boolean;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.identifierType = identifierType;
    invariant(members.length >= 2);
    this.recursive = recursive;
    this.discriminant = Discriminant.infer(members);
    this.synthetic = synthetic;

    this.lazyMembers = () =>
      members.map((member, memberI) => {
        let discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
        invariant(this.discriminant.memberValues.length === members.length);
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
                case "ObjectUnion":
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
        code`export type ${def(name)} = ${this.inlineExpression};`,
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
      .orDefault(this.equalsFunctionExpression);
  }

  @Memoize()
  override get expression(): Code {
    return this.name
      .map((name) => code`${name}`)
      .orDefault(this.inlineExpression);
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
      .orDefault(this.filterTypeLiteral);
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

  get jsonSchemaFunctionDeclaration(): Code {
    const meta: Record<string, string> = {
      // id: this.name,
    };
    this.comment.ifJust((description) => {
      meta["description"] = description;
    });
    this.label.ifJust((label) => {
      meta["title"] = label;
    });

    return code`export const schema = () => ${this.jsonSchemaExpression}.meta(${meta});`;
  }

  get jsonTypeAliasDeclaration(): Code {
    return code`export type Json = ${this.jsonTypeLiteral.expression}`;
  }

  @Memoize()
  get members(): readonly AbstractUnionType.Member<MemberTypeT>[] {
    return this.lazyMembers();
  }

  @Memoize()
  override get mutable(): boolean {
    return this.members.some((member) => member.type.mutable);
  }

  get referencesObjectType(): boolean {
    return this.members.some((member) => member.type.referencesObjectType);
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
  protected get schemaTypeExpression(): Code {
    return code`${{
      kind: this.kind,
      members: code`{ ${joinCode(
        this.members.map(
          ({ type, primaryDiscriminantValue }) =>
            code`readonly ${literalOf(primaryDiscriminantValue)}: ${{
              discriminantValues: code`readonly (number | string)[]`,
              type: type.schemaType,
            }}`,
        ),
        { on: ";" },
      )} }`,
    }}`;
  }

  protected get staticModuleDeclarations(): Record<string, Code> {
    const name = this.name.unsafeCoerce();
    const staticModuleDeclarations: Record<string, Code> = {};

    if (this.configuration.features.has("Object.equals")) {
      staticModuleDeclarations[`equals`] =
        code`export const equals = ${this.equalsFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.filter")) {
      staticModuleDeclarations[`Filter`] =
        code`export type Filter = ${this.filterTypeLiteral};`;
      staticModuleDeclarations[`filter`] =
        code`export const filter = ${this.filterFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.hash")) {
      staticModuleDeclarations[`hash`] =
        code`export const hash = ${this.hashFunctionExpression};`;
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
        code`export const fromJson = ${this.fromJsonFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.fromRdf")) {
      staticModuleDeclarations[`fromRdfResourceValues`] =
        code`export const fromRdfResourceValues: ${this.reusables.snippets.FromRdfResourceValuesFunction}<${name}, ${this.schemaType}> = ${this.fromRdfResourceValuesFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.schema")) {
      staticModuleDeclarations["schema"] =
        code`export const schema = ${this.schemaExpression}`;
    }

    if (this.configuration.features.has("Object.toJson")) {
      staticModuleDeclarations[`toJson`] =
        code`export const toJson = ${this.toJsonFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.toRdf")) {
      staticModuleDeclarations[`toRdfResourceValues`] =
        code`export const toRdfResourceValues = ${this.toRdfResourceValuesFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.SPARQL")) {
      staticModuleDeclarations[`valueSparqlConstructTriples`] =
        code`export const valueSparqlConstructTriples: ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}> = ${this.valueSparqlConstructTriplesFunctionExpression};`;

      staticModuleDeclarations[`valueSparqlWherePatterns`] =
        code`export const valueSparqlWherePatterns: ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}> = ${this.valueSparqlWherePatternsFunctionExpression};`;
    }

    if (this.configuration.features.has("Object.toString")) {
      const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
      staticModuleDeclarations[`${syntheticNamePrefix}toString`] =
        code`export const ${syntheticNamePrefix}toString = ${this.toStringFunctionExpression};`;
    }

    return staticModuleDeclarations;
  }

  @Memoize()
  private get equalsFunctionExpression(): Code {
    return code`\
((left: ${this.expression}, right: ${this.expression}) => {
${joinCode(
  this.members.map(
    ({ type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`left`)} && ${typeCheck(code`right`)}) {
  return ${type.equalsFunction}(${unwrap(code`left`)} as ${type.expression}, ${unwrap(code`right`)} as ${type.expression});
}`,
  ),
)}

  return ${this.reusables.imports.Left}({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "boolean" as const }, type: "property" as const });
})`;
  }

  @Memoize()
  private get filterFunctionExpression(): Code {
    const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
    return code`\
((filter: ${this.filterType}, value: ${this.expression}) => {
${joinCode([
  ...this.identifierType
    .map(
      (identifierType) => code`\
if (filter.${syntheticNamePrefix}identifier !== undefined && !${identifierType.filterFunction}(filter.${syntheticNamePrefix}identifier, value.${syntheticNamePrefix}identifier())) {
  return false;
}`,
    )
    .toList(),
  ...this.members.map(
    ({ primaryDiscriminantValue, type, typeCheck, unwrap }) => code`\
if (filter.on?.[${literalOf(primaryDiscriminantValue)}] !== undefined && ${typeCheck(code`value`)}) {
  if (!${type.filterFunction}(filter.on[${literalOf(primaryDiscriminantValue)}], ${unwrap(code`value`)})) {
    return false;
  }
}`,
  ),
])}

  return true;
})`;
  }

  @Memoize()
  private get filterTypeLiteral(): Code {
    const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
    return code`\
  {
   ${this.identifierType.map((identifierType) => code`readonly ${syntheticNamePrefix}identifier?: ${identifierType.filterType};`).orDefault(code``)}
   readonly on?: { ${joinCode(
     this.members.map(
       ({ type, primaryDiscriminantValue }) =>
         code`readonly ${literalOf(primaryDiscriminantValue)}?: ${type.filterType}`,
     ),
     { on: ";" },
   )} }
  }`;
  }

  private get fromJsonFunctionExpression(): Code {
    return code`\
((value: ${this.jsonType().expression}): ${this.reusables.imports.Either}<Error, ${this.expression}> => {
${joinCode(
  this.members.map(
    ({ jsonType, jsonTypeCheck, type, unwrap, wrap }) =>
      code`if (${jsonTypeCheck(code`value`)}) { return ${type.fromJsonExpression(
        {
          variables: {
            value: code`(${unwrap(code`value`)} as ${jsonType})`,
          },
        },
      )}.map(value => (${wrap(code`value`)})); }`,
  ),
)}

  throw new Error("unable to deserialize JSON");
})`;
  }

  private get fromRdfResourceValuesFunctionExpression(): Code {
    const variables: Omit<
      Parameters<
        AbstractType["fromRdfResourceValuesExpression"]
      >[0]["variables"],
      "resourceValues"
    > = {
      context: code`_options.context`,
      graph: code`_options.graph`,
      ignoreRdfType: false,
      objectSet: code`_options.objectSet`,
      preferredLanguages: code`_options.preferredLanguages`,
      propertyPath: code`_options.propertyPath`,
      resource: code`_options.resource`,
    };

    return code`\
(((values, _options) =>
    values.chain(values => values.chainMap(value => {
      const valueAsValues = ${this.reusables.imports.Right}(value.toValues());
      return ${this.members.reduce(
        (expression, { type, primaryDiscriminantValue }, memberI) => {
          let typeExpression: Code = type.fromRdfResourceValuesExpression({
            variables: {
              context: variables.context,
              graph: variables.graph,
              ignoreRdfType: false,
              objectSet: variables.objectSet,
              preferredLanguages: variables.preferredLanguages,
              propertyPath: variables.propertyPath,
              resource: variables.resource,
              resourceValues: code`valueAsValues`,
            },
          });
          if (
            this.discriminant.kind === "Extrinsic" ||
            (this.discriminant.kind === "Hybrid" &&
              this.discriminant.memberValues[memberI].kind === "Extrinsic")
          ) {
            typeExpression = code`${typeExpression}.map(values => values.map(value => ({ ${this.discriminant.name}: ${literalOf(primaryDiscriminantValue)} as const, value }) as (${this.expression})))`;
          }
          typeExpression = code`(${typeExpression} as ${this.reusables.imports.Either}<Error, ${this.reusables.imports.Resource}.Values<${this.expression}>>)`;
          return expression !== null
            ? code`${expression}.altLazy(() => ${typeExpression})`
            : typeExpression;
        },
        null as Code | null,
      )!}.chain(values => values.head());
    }))
) satisfies ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.expression}>)`;
  }

  private get hashFunctionExpression(): Code {
    return code`\
(<HasherT extends ${this.reusables.snippets.Hasher}>(hasher: HasherT, value: ${this.expression}): HasherT => {
${joinCode(
  this.members.map(
    ({ type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`value`)}) { return ${type.hashFunction}(hasher, ${unwrap(code`value`)}); }`,
  ),
)}
  return hasher;
})`;
  }

  /**
   * An inline expression of this type rather than a type reference/name.
   */
  @Memoize()
  private get inlineExpression(): Code {
    const discriminant = this.discriminant; // To get type narrowing to work
    switch (discriminant.kind) {
      case "Extrinsic":
        return code`(${joinCode(
          this.members.map(
            ({ type, primaryDiscriminantValue }) =>
              code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${type.expression} }`,
          ),
          { on: "|" },
        )})`;
      case "Hybrid":
        return code`(${joinCode(
          this.members.map(({ primaryDiscriminantValue, type }, memberI) => {
            switch (discriminant.memberValues[memberI].kind) {
              case "Extrinsic":
                return code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${type.expression} }`;
              case "Intrinsic":
                return code`${type.expression}`;
              default:
                throw new Error();
            }
          }),
          { on: "|" },
        )})`;
      case "Intrinsic":
        // If every type shares a discriminant (e.g., RDF/JS "termType" or generated ObjectType "type"),
        // just join their names with "|"
        return code`(${joinCode(
          this.members.map(({ type }) => code`${type.expression}`),
          { on: "|" },
        )})`;
      case "Typeof":
        // The type.name may include literal values, but they should still be unambiguous with other member types since the typeofs
        // of the different member types are known to be different.
        return code`(${joinCode(
          this.members.map(({ type }) => code`${type.expression}`),
          { on: "|" },
        )})`;
      default:
        discriminant satisfies never;
        throw new Error("should never reach this point");
    }
  }

  private get jsonSchemaExpression(): Code {
    const discriminant = this.discriminant; // To get type narrowing to work
    switch (discriminant.kind) {
      case "Extrinsic":
        return code`${this.reusables.imports.z}.discriminatedUnion("${discriminant.name}", [${joinCode(
          this.members.map(
            ({ type, primaryDiscriminantValue }) =>
              code`${this.reusables.imports.z}.object({ ${discriminant.name}: ${this.reusables.imports.z}.literal(${literalOf(primaryDiscriminantValue)}), value: ${type.jsonSchema({ context: "type" })} })`,
          ),
          { on: "," },
        )}]).readonly()`;

      case "Hybrid":
        return code`${this.reusables.imports.z}.discriminatedUnion("${discriminant.name}", [${joinCode(
          this.members.map(({ primaryDiscriminantValue, type }, memberI) => {
            switch (discriminant.memberValues[memberI].kind) {
              case "Extrinsic":
                return code`${this.reusables.imports.z}.object({ ${discriminant.name}: ${this.reusables.imports.z}.literal(${literalOf(primaryDiscriminantValue)}), value: ${type.jsonSchema({ context: "type" })} })`;
              case "Intrinsic":
                return type.jsonSchema({
                  includeDiscriminantProperty: true,
                  context: "type",
                });
              default:
                throw new Error();
            }
          }),
          { on: "," },
        )}]).readonly()`;

      case "Intrinsic":
        return code`${this.reusables.imports.z}.discriminatedUnion("${discriminant.name}", [${joinCode(
          this.members.map(({ type }) =>
            type.jsonSchema({
              includeDiscriminantProperty: true,
              context: "type",
            }),
          ),
          { on: "," },
        )}]).readonly()`;

      case "Typeof":
        return code`${this.reusables.imports.z}.union([${joinCode(
          this.members.map(({ type }) => type.jsonSchema({ context: "type" })),
          { on: "," },
        )}]).readonly()`;

      default:
        throw discriminant satisfies never;
    }
  }

  @Memoize()
  private get jsonTypeLiteral(): AbstractType.JsonType {
    const discriminant = this.discriminant; // To get type narrowing to work
    switch (discriminant.kind) {
      case "Extrinsic":
        return new AbstractType.JsonType(
          code`(${joinCode(
            this.members.map(
              ({ jsonType, primaryDiscriminantValue }) =>
                code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${jsonType} }`,
            ),
            { on: "|" },
          )})`,
        );

      case "Hybrid":
        return new AbstractType.JsonType(
          code`(${joinCode(
            this.members.map(
              ({ jsonType, primaryDiscriminantValue }, memberI) => {
                switch (discriminant.memberValues[memberI].kind) {
                  case "Extrinsic":
                    return code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${jsonType} }`;
                  case "Intrinsic":
                    return code`${jsonType}`;
                  default:
                    throw new Error();
                }
              },
            ),
            { on: "|" },
          )})`,
        );

      case "Intrinsic":
      case "Typeof":
        return new AbstractType.JsonType(
          joinCode(
            this.members.map(({ jsonType }) => code`${jsonType}`),
            { on: "|" },
          ),
        );
      default:
        throw discriminant satisfies never;
    }
  }

  private get toJsonFunctionExpression(): Code {
    return code`\
((value: ${this.expression}): ${this.jsonType().expression} => {
${joinCode(
  this.members.map(
    ({ typeCheck, typeToJsonExpression, unwrap, wrap }) =>
      code`if (${typeCheck(code`value`)}) { return ${wrap(
        typeToJsonExpression(unwrap(code`value`)),
      )}; }`,
  ),
)}

  throw new Error("unable to serialize to JSON");
})`;
  }

  private get toRdfResourceValuesFunctionExpression(): Code {
    return code`\
(((value, _options): (${joinCode(
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
    )})[] => {
${joinCode(
  this.members.map(
    ({ type, unwrap, typeCheck }) =>
      code`if (${typeCheck(code`value`)}) { return ${type.toRdfResourceValuesExpression(
        {
          variables: {
            graph: code`_options.graph`,
            propertyPath: code`_options.propertyPath`,
            resource: code`_options.resource`,
            resourceSet: code`_options.resourceSet`,
            value: unwrap(code`value`),
          },
        },
      )}; }`,
  ),
)}

  throw new Error("unable to serialize to RDF");
}) satisfies ${this.reusables.snippets.ToRdfResourceValuesFunction}<${this.expression}>)`;
  }

  private get toStringFunctionExpression(): Code {
    return code`\
((value: ${this.expression}): string => {
${joinCode(
  this.members.map(
    ({ type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`value`)}) { return ${type.toStringExpression({
        variables: { value: unwrap(code`value`) },
      })}; }`,
  ),
)}

  throw new Error("unable to serialize to string");
})`;
  }

  @Memoize()
  private get valueSparqlConstructTriplesFunctionExpression(): Code {
    return code`\
((({ ignoreRdfType, filter, schema, ...otherParameters }) => {
  let triples: ${this.reusables.imports.sparqljs}.Triple[] = [];

  ${joinCode(
    this.members.map(
      ({ type, primaryDiscriminantValue }) => code`\
triples = triples.concat(${type.valueSparqlConstructTriplesFunction}({ ...otherParameters, filter: filter?.on?.[${literalOf(primaryDiscriminantValue)}], ignoreRdfType: false, schema: schema.members[${literalOf(primaryDiscriminantValue)}].type }));`,
    ),
  )}
  
  return triples;
}) satisfies ${this.reusables.snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}>)`;
  }

  @Memoize()
  private get valueSparqlWherePatternsFunctionExpression(): Code {
    return code`\
((({ filter, schema, ...otherParameters }) => {
  const unionPatterns: ${this.reusables.imports.sparqljs}.GroupPattern[] = [];

  ${joinCode(
    this.members.map(
      ({ type, primaryDiscriminantValue }) => code`\
unionPatterns.push({ patterns: ${type.valueSparqlWherePatternsFunction}({ ...otherParameters, filter: filter?.on?.[${literalOf(primaryDiscriminantValue)}], ignoreRdfType: false, schema: schema.members[${literalOf(primaryDiscriminantValue)}].type }).concat(), type: "group" });`,
    ),
  )}
  
  return [{ patterns: unionPatterns, type: "union" }];
}) satisfies ${this.reusables.snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>)`;
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.fromJson`).orDefault(this.fromJsonFunctionExpression)}(${variables.value})`;
  }

  override fromRdfResourceValuesExpression({
    variables,
  }: Parameters<AbstractType["fromRdfResourceValuesExpression"]>[0]): Code {
    const {
      resourceValues: resourceValuesVariable,
      ...fromRdfResourceValuesOptionsTemp
    } = variables;
    const fromRdfResourceValuesOptions: Record<string, boolean | Code> =
      fromRdfResourceValuesOptionsTemp;
    if (!this.configuration.features.has("ObjectSet")) {
      delete fromRdfResourceValuesOptions["objectSet"];
    }
    return code`${this.name.map((name) => code`${name}.fromRdfResourceValues`).orDefault(this.fromRdfResourceValuesFunctionExpression)}(${resourceValuesVariable}, ${fromRdfResourceValuesOptions})`;
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
      .orDefault(this.jsonSchemaExpression);
    if (context === "property" && this.recursive) {
      return code`${this.reusables.imports.z}.lazy((): ${this.reusables.imports.z}.ZodType<${this.jsonType().expression}> => ${expression})`;
    }
    return expression;
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    return this.name
      .map((name) => new AbstractType.JsonType(code`${name}.Json`))
      .orDefault(this.jsonTypeLiteral);
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    return code`${this.name.map((name) => code`${name}.toJson`).orDefault(this.toJsonFunctionExpression)}(${variables.value})`;
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

  private readonly lazyMembers: () => readonly AbstractUnionType.Member<MemberTypeT>[];
}

type Discriminant =
  | ExtrinsicDiscriminant
  | HybridDiscriminant
  | IntrinsicDiscriminant
  | TypeofDiscriminant;

type ExtrinsicDiscriminant = {
  readonly jsonName: string;
  readonly kind: "Extrinsic";
  readonly memberValues: readonly AbstractType.DiscriminantProperty.Value[];
  readonly name: string;
};

type HybridDiscriminant = {
  readonly jsonName: string;
  readonly kind: "Hybrid";
  readonly memberValues: readonly {
    readonly kind: "Extrinsic" | "Intrinsic";
    readonly values: readonly AbstractType.DiscriminantProperty.Value[];
  }[];
  readonly name: string;
};

type IntrinsicDiscriminant = {
  readonly jsonName: string;
  readonly kind: "Intrinsic";
  readonly memberValues: readonly AbstractType.DiscriminantProperty.Value[];
  readonly name: string;
};

type TypeofDiscriminant = {
  readonly kind: "Typeof";
  readonly memberValues: readonly Typeof[];
};

function termTypes(
  type: Type,
): ReadonlySet<"BlankNode" | "Literal" | "NamedNode"> {
  switch (type.kind) {
    case "BlankNode":
    case "Iri":
    case "Identifier":
    case "Literal":
    case "Term":
      return type.termTypes;
    default:
      return emptyTermTypesSet;
  }
}

const emptyTermTypesSet: ReadonlySet<"BlankNode" | "Literal" | "NamedNode"> =
  new Set();

export namespace Discriminant {
  export function infer(
    members: readonly {
      readonly discriminantValue: Maybe<number | string>;
      readonly type: Type;
    }[],
  ): Discriminant {
    // extrinsic with user-specified values
    if (members.some((member) => member.discriminantValue.isJust())) {
      return {
        jsonName: "type",
        kind: "Extrinsic",
        memberValues: members.map((member, memberI) =>
          member.discriminantValue.orDefault(memberI),
        ),
        name: "type",
      };
    }

    const memberTypes = members.map((member) => member.type);

    // intrinsic
    {
      let inlineDiscriminantProperty:
        | AbstractType.DiscriminantProperty
        | undefined;
      let memberValues: AbstractType.DiscriminantProperty.Value[] = [];
      for (const memberType of memberTypes) {
        const memberTypeDiscriminantProperty =
          memberType.discriminantProperty.extract();
        if (!memberTypeDiscriminantProperty) {
          inlineDiscriminantProperty = undefined;
          break;
        }
        if (!inlineDiscriminantProperty) {
          inlineDiscriminantProperty = memberTypeDiscriminantProperty;
        } else if (
          memberTypeDiscriminantProperty.name !==
          inlineDiscriminantProperty.name
        ) {
          inlineDiscriminantProperty = undefined;
          break;
        }
        memberValues = memberValues.concat(
          memberTypeDiscriminantProperty.values,
        );
      }

      if (inlineDiscriminantProperty) {
        return {
          jsonName: inlineDiscriminantProperty.jsonName,
          kind: "Intrinsic",
          memberValues,
          name: inlineDiscriminantProperty.name,
        };
      }
    }

    // typeof
    {
      const memberTypeofs: Typeof[] = [];
      const memberTypeofsSet = new Set<Typeof>();
      for (const memberType of memberTypes) {
        for (const memberJsType of memberType.jsTypes) {
          memberTypeofs.push(memberJsType.typeof);
          memberTypeofsSet.add(memberJsType.typeof);
        }
      }
      if (memberTypeofsSet.size === memberTypes.length) {
        return {
          memberValues: memberTypeofs,
          kind: "Typeof",
        };
      }
    }

    // hybrid
    // If some member type is an RDF/JS term then reuse "termType" as the discriminant.
    if (memberTypes.some((memberType) => termTypes(memberType).size > 0)) {
      const extrinsicMemberTypeAliasesSet = new Set<string>();
      let extrinsicMemberTypeCount = 0;
      for (const memberType of memberTypes) {
        if (termTypes(memberType).size > 0) {
          continue;
        }
        extrinsicMemberTypeCount++;
        if (memberType.name.isJust()) {
          extrinsicMemberTypeAliasesSet.add(memberType.name.extract());
        } else {
          break;
        }
      }

      return {
        jsonName: "termType",
        kind: "Hybrid",
        memberValues: memberTypes.map((memberType, memberTypeI) => {
          const memberTermTypes = termTypes(memberType);
          if (memberTermTypes.size > 0) {
            return {
              kind: "Intrinsic",
              values: [...memberTermTypes],
            };
          }

          return {
            kind: "Extrinsic",
            values:
              extrinsicMemberTypeAliasesSet.size === extrinsicMemberTypeCount
                ? [memberType.name.unsafeCoerce()]
                : [memberTypeI.toString()],
          };
        }),
        name: "termType",
      };
    }

    // extrinsic with inferred values
    {
      let memberValues: readonly AbstractType.DiscriminantProperty.Value[];
      {
        const memberTypeNames: readonly string[] = memberTypes.map(
          (memberType) =>
            memberType.name.orDefault(memberType.jsTypes[0].typeof),
        );
        const memberTypeNamesSet = new Set(memberTypeNames);
        if (memberTypeNamesSet.size === memberTypeNames.length) {
          memberValues = memberTypeNames;
        } else {
          // Otherwise prefix the non-unique strings with an index and use those as the discriminant values.
          memberValues = memberTypeNames.map(
            (memberTypeName, memberTypeI) => `${memberTypeI}-${memberTypeName}`,
          );
        }
      }
      invariant(memberValues.length === memberTypes.length);
      return {
        jsonName: "type",
        kind: "Extrinsic",
        name: "type",
        memberValues,
      };
    }
  }
}

export namespace AbstractUnionType {
  export interface Member<TypeT extends Type> {
    readonly discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
    readonly jsonType: Code | string;
    readonly jsonTypeCheck: (instance: Code) => Code;
    readonly primaryDiscriminantValue: AbstractType.DiscriminantProperty.Value;
    readonly type: TypeT;
    readonly typeCheck: (instance: Code) => Code;
    readonly typeToJsonExpression: (valueVariable: Code) => Code;
    readonly unwrap: (instance: Code) => Code;
    readonly wrap: (instance: Code) => Code;
  }
}
