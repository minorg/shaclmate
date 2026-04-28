import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";
import { imports } from "./imports.js";
import { removeUndefined } from "./removeUndefined.js";
import { snippets } from "./snippets.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";
import type { Type } from "./Type.js";
import type { Typeof } from "./Typeof.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

export abstract class AbstractUnionType<
  MemberTypeT extends Type,
> extends AbstractType {
  private readonly discriminant: Discriminant;
  private readonly identifierType: Maybe<
    BlankNodeType | IdentifierType | IriType
  >;

  override readonly abstract = false;
  private readonly lazyMembers: () => readonly AbstractUnionType.Member<MemberTypeT>[];
  override readonly recursive: boolean;

  constructor({
    identifierType,
    members,
    recursive,
    ...superParameters
  }: {
    identifierType: Maybe<BlankNodeType | IdentifierType | IriType>;
    members: readonly (Pick<AbstractUnionType.Member<MemberTypeT>, "type"> & {
      readonly discriminantValue: Maybe<number | string>;
    })[];
    recursive: boolean;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    this.identifierType = identifierType;
    invariant(members.length >= 2);
    this.recursive = recursive;

    if (members.some((member) => member.discriminantValue.isJust())) {
      this.discriminant = {
        descendantValues: [],
        kind: "envelope",
        name: "type",
        ownValues: members.map((member, memberI) =>
          member.discriminantValue.orDefault(memberI),
        ),
      };
    } else {
      this.discriminant = Discriminant.infer(
        members.map((member) => member.type),
      );
    }

    this.lazyMembers = () =>
      members.map((member, memberI) => {
        if (member.type.abstract) {
          return { abstract: true, discriminantValues: [], type: member.type };
        }

        let discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
        switch (this.discriminant.kind) {
          case "envelope":
            discriminantValues = [this.discriminant.ownValues[memberI]];
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
            for (const member of members) {
              for (const ownDiscriminantPropertyValue of member.type.discriminantProperty.unsafeCoerce()
                .ownValues) {
                memberOwnDiscriminantPropertyValues.add(
                  ownDiscriminantPropertyValue,
                );
              }
            }

            discriminantValues = member.type.discriminantProperty
              .unsafeCoerce()
              .ownValues.concat(
                member.type.discriminantProperty
                  .unsafeCoerce()
                  .descendantValues.filter(
                    (value) => !memberOwnDiscriminantPropertyValues.has(value),
                  ),
              );
            break;
          }
          case "typeof":
            discriminantValues = member.type.typeofs;
            break;
          default:
            throw this.discriminant satisfies never;
        }

        if (discriminantValues.length === 0) {
          return { abstract: true, discriminantValues: [], type: member.type };
        }

        const typeCheck =
          (json: boolean) =>
          (instance: Code): Code => {
            switch (this.discriminant.kind) {
              case "envelope":
                return code`(${joinCode(
                  discriminantValues.map(
                    (discriminantValue) =>
                      code`${instance}.${(this.discriminant as EnvelopeDiscriminant).name} === ${literalOf(discriminantValue)}`,
                  ),
                  { on: " || " },
                )})`;

              case "inline": {
                if (!json) {
                  switch (member.type.kind) {
                    case "NamedObjectUnionType":
                    case "NamedUnionType":
                    case "NamedObjectType":
                      return code`${member.type.staticModuleName}.is${member.type.name}(${instance})`;
                  }
                }

                return code`(${joinCode(
                  discriminantValues.map(
                    (discriminantValue) =>
                      code`${instance}.${(this.discriminant as InlineDiscriminant).name} === ${literalOf(discriminantValue)}`,
                  ),
                  { on: " || " },
                )})`;
              }
              case "typeof":
                return code`(${joinCode(
                  discriminantValues.map(
                    (discriminantValue) =>
                      code`typeof ${instance} === ${literalOf(discriminantValue)}`,
                  ),
                  { on: " || " },
                )})`;
            }
          };

        return {
          abstract: false,
          discriminantValues,
          jsonTypeCheck: typeCheck(true),
          primaryDiscriminantValue: discriminantValues[0],
          type: member.type,
          typeCheck: typeCheck(false),
          unwrap: (instance: Code): Code => {
            switch (this.discriminant.kind) {
              case "envelope":
                return code`${instance}.value`;
              case "inline":
              case "typeof":
                return instance;
            }
          },
          wrap: (instance: Code): Code => {
            switch (this.discriminant.kind) {
              case "envelope":
                return code`{ ${this.discriminant.name}: ${literalOf(discriminantValues[0])} as const, value: ${instance} }`;
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
        return this.concreteMembers.map(
          ({ primaryDiscriminantValue, type, typeCheck }) => ({
            conversionExpression: (value) => value,
            sourceTypeCheckExpression: (value) => typeCheck(value),
            sourceTypeName: type.name,
            sourceTypeof: primaryDiscriminantValue as Typeof,
          }),
        );
      default:
        throw this.discriminant satisfies never;
    }
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
  get members(): readonly AbstractUnionType.Member<MemberTypeT>[] {
    return this.lazyMembers();
  }

  @Memoize()
  override get mutable(): boolean {
    return this.members.some((member) => member.type.mutable);
  }

  @Memoize()
  get schema(): Code {
    return code`${removeUndefined(this.schemaObject)}`;
  }

  override get schemaType(): Code {
    invariant(this.kind.endsWith("Type"));

    return code`${{
      // discriminant: {
      //   kind: '"envelope" | "inline" | "typeof"',
      // },
      kind: code`${literalOf(this.kind.substring(0, this.kind.length - "Type".length))}`,
      members: code`{ ${joinCode(
        this.concreteMembers.map(
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

  @Memoize()
  override get typeofs(): AbstractType["typeofs"] {
    return NonEmptyList.fromArray(
      this.concreteMembers.flatMap((member) => member.type.typeofs),
    ).unsafeCoerce();
  }

  @Memoize()
  protected get concreteMembers(): readonly AbstractUnionType.ConcreteMember<MemberTypeT>[] {
    return this.members.filter((member) => !member.abstract);
  }

  @Memoize()
  protected get inlineEqualsFunction(): Code {
    return code`\
((left: ${this.name}, right: ${this.name}) => {
${joinCode(
  this.concreteMembers.map(
    ({ type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`left`)} && ${typeCheck(code`right`)}) {
  return ${type.equalsFunction}(${unwrap(code`left`)} as ${type.name}, ${unwrap(code`right`)} as ${type.name});
}`,
  ),
)}

  return ${imports.Left}({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "boolean" as const }, type: "property" as const });
})`;
  }

  @Memoize()
  protected get inlineFilterFunction(): Code {
    return code`\
((filter: ${this.filterType}, value: ${this.name}) => {
${joinCode([
  ...this.identifierType
    .map(
      (identifierType) => code`\
if (filter.${syntheticNamePrefix}identifier !== undefined && !${identifierType.filterFunction}(filter.${syntheticNamePrefix}identifier, value.${syntheticNamePrefix}identifier)) {
  return false;
}`,
    )
    .toList(),
  ...this.concreteMembers.map(
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
  protected get inlineFilterType(): Code {
    return code`\
  {
   ${this.identifierType.map((identifierType) => code`readonly ${syntheticNamePrefix}identifier?: ${identifierType.filterType};`).orDefault(code``)}
   readonly on?: { ${joinCode(
     this.concreteMembers.map(
       ({ type, primaryDiscriminantValue }) =>
         code`readonly ${literalOf(primaryDiscriminantValue)}?: ${type.filterType}`,
     ),
     { on: ";" },
   )} }
  }`;
  }

  protected get inlineFromJsonFunction(): Code {
    return code`\
((value: ${this.jsonType().name}): ${this.name} => {
${joinCode(
  this.concreteMembers.map(
    ({ jsonTypeCheck, type, unwrap, wrap }) =>
      code`if (${jsonTypeCheck(code`value`)}) { return ${wrap(
        type.fromJsonExpression({
          variables: {
            value: code`(${unwrap(code`value`)} as ${type.jsonType().name})`,
          },
        }),
      )}; }`,
  ),
)}

  throw new Error("unable to deserialize JSON");
})`;
  }

  protected get inlineFromRdfResourceValuesFunction(): Code {
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
      const valueAsValues = ${imports.Right}(value.toValues());
      return ${this.concreteMembers.reduce(
        (expression, { type, primaryDiscriminantValue }) => {
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
          if (this.discriminant.kind === "envelope") {
            typeExpression = code`${typeExpression}.map(values => values.map(value => ({ ${this.discriminant.name}: ${literalOf(primaryDiscriminantValue)} as const, value }) as (${this.name})))`;
          }
          typeExpression = code`(${typeExpression} as ${imports.Either}<Error, ${imports.Resource}.Values<${this.name}>>)`;
          return expression !== null
            ? code`${expression}.altLazy(() => ${typeExpression})`
            : typeExpression;
        },
        null as Code | null,
      )!}.chain(values => values.head());
    }))
) satisfies ${snippets.FromRdfResourceValuesFunction}<${this.name}>)`;
  }

  @Memoize()
  protected get inlineJsonType(): AbstractType.JsonType {
    switch (this.discriminant.kind) {
      case "envelope":
        return new AbstractType.JsonType(
          code`(${joinCode(
            this.concreteMembers.map(
              ({ type, primaryDiscriminantValue }) =>
                code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: ${literalOf(primaryDiscriminantValue)}, value: ${type.jsonType().name} }`,
            ),
            { on: "|" },
          )})`,
        );
      case "inline":
      case "typeof":
        return new AbstractType.JsonType(
          joinCode(
            this.concreteMembers.map(
              ({ type }) =>
                code`${
                  type.jsonType({
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

  protected get inlineJsonSchema(): Code {
    switch (this.discriminant.kind) {
      case "envelope":
        return code`${imports.z}.discriminatedUnion("${this.discriminant.name}", [${joinCode(
          this.concreteMembers.map(
            ({ type, primaryDiscriminantValue }) =>
              code`${imports.z}.object({ ${(this.discriminant as EnvelopeDiscriminant).name}: ${imports.z}.literal(${literalOf(primaryDiscriminantValue)}), value: ${type.jsonSchema({ context: "type" })} })`,
          ),
          { on: "," },
        )}])`;
      case "inline":
        return code`${imports.z}.discriminatedUnion("${this.discriminant.name}", [${joinCode(
          this.concreteMembers.map(({ type }) =>
            type.jsonSchema({
              includeDiscriminantProperty: true,
              context: "type",
            }),
          ),
          { on: "," },
        )}]).readonly()`;
      case "typeof":
        return code`${imports.z}.union([${joinCode(
          this.concreteMembers.map(({ type }) =>
            type.jsonSchema({ context: "type" }),
          ),
          { on: "," },
        )}]).readonly()`;
      default:
        throw this.discriminant satisfies never;
    }
  }

  @Memoize()
  protected get inlineName(): Code {
    switch (this.discriminant.kind) {
      case "envelope":
        return code`(${joinCode(
          this.concreteMembers.map(
            ({ type, primaryDiscriminantValue }) =>
              code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: ${literalOf(primaryDiscriminantValue)}, value: ${type.name} }`,
          ),
          { on: "|" },
        )})`;
      case "inline":
        // If every type shares a discriminant (e.g., RDF/JS "termType" or generated NamedObjectType "type"),
        // just join their names with "|"
        return code`(${joinCode(
          this.members.map(({ type }) => code`${type.name}`),
          { on: "|" },
        )})`;
      case "typeof":
        // The type.name may include literal values, but they should still be unambiguous with other member types since the typeofs
        // of the different member types are known to be different.
        return code`(${joinCode(
          this.members.map(({ type }) => code`${type.name}`),
          { on: "|" },
        )})`;
      default:
        this.discriminant satisfies never;
        throw new Error("should never reach this point");
    }
  }

  @Memoize()
  protected get inlineValueSparqlConstructTriplesFunction(): Code {
    return code`\
((({ ignoreRdfType, filter, schema, ...otherParameters }) => {
  let triples: ${imports.sparqljs}.Triple[] = [];

  ${joinCode(
    this.concreteMembers.map(
      ({ type, primaryDiscriminantValue }) => code`\
triples = triples.concat(${type.valueSparqlConstructTriplesFunction}({ ...otherParameters, filter: filter?.on?.[${literalOf(primaryDiscriminantValue)}], ignoreRdfType: false, schema: schema.members[${literalOf(primaryDiscriminantValue)}].type }));`,
    ),
  )}
  
  return triples;
}) satisfies ${snippets.ValueSparqlConstructTriplesFunction}<${this.filterType}, ${this.schemaType}>)`;
  }

  @Memoize()
  protected get inlineValueSparqlWherePatternsFunction(): Code {
    return code`\
((({ filter, schema, ...otherParameters }) => {
  const unionPatterns: ${imports.sparqljs}.GroupPattern[] = [];

  ${joinCode(
    this.concreteMembers.map(
      ({ type, primaryDiscriminantValue }) => code`\
unionPatterns.push({ patterns: ${type.valueSparqlWherePatternsFunction}({ ...otherParameters, filter: filter?.on?.[${literalOf(primaryDiscriminantValue)}], ignoreRdfType: false, schema: schema.members[${literalOf(primaryDiscriminantValue)}].type }).concat(), type: "group" });`,
    ),
  )}
  
  return [{ patterns: unionPatterns, type: "union" }];
}) satisfies ${snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>)`;
  }

  protected get inlineToJsonFunction(): Code {
    return code`\
((value: ${this.name}): ${this.jsonType().name} => {
${joinCode(
  this.concreteMembers.map(
    ({ type, typeCheck, unwrap, wrap }) =>
      code`if (${typeCheck(code`value`)}) { return ${wrap(
        type.toJsonExpression({
          includeDiscriminantProperty: this.discriminant.kind === "inline",
          variables: { value: unwrap(code`value`) },
        }),
      )}; }`,
  ),
)}

  throw new Error("unable to serialize to JSON");
})`;
  }

  protected get inlineToRdfResourceValuesFunction(): Code {
    return code`\
(((value, _options) => {
${joinCode(
  this.concreteMembers.map(
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
}) as ${snippets.ToRdfResourceValuesFunction}<${this.name}>)`;
  }

  protected override get schemaObject(): {
    kind: Code;
    members: Code;
  } {
    return {
      ...super.schemaObject,
      members: code`{ ${joinCode(
        this.concreteMembers.map(
          ({ discriminantValues, type, primaryDiscriminantValue }) =>
            code`${literalOf(primaryDiscriminantValue)}: ${{
              discriminantValues: discriminantValues,
              type: type.schema,
            }}`,
        ),
        { on: "," },
      )} }`,
    };
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  protected inlineHashStatements({
    depth,
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly Code[] {
    return this.concreteMembers.map(
      ({ type, unwrap, typeCheck }) =>
        code`if (${typeCheck(variables.value)}) { ${joinCode(
          type
            .hashStatements({
              depth: depth + 1,
              variables: {
                hasher: variables.hasher,
                value: unwrap(variables.value),
              },
            })
            .concat(),
        )} }`,
    );
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

export namespace AbstractUnionType {
  export interface AbstractMember<TypeT extends Type> {
    readonly abstract: true;
    readonly discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
    readonly type: TypeT;
  }

  export interface ConcreteMember<TypeT extends Type> {
    readonly abstract: false;
    readonly discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
    readonly jsonTypeCheck: (instance: Code) => Code;
    readonly primaryDiscriminantValue: AbstractType.DiscriminantProperty.Value;
    readonly type: TypeT;
    readonly typeCheck: (instance: Code) => Code;
    readonly unwrap: (instance: Code) => Code;
    readonly wrap: (instance: Code) => Code;
  }

  export type Member<TypeT extends Type> =
    | AbstractMember<TypeT>
    | ConcreteMember<TypeT>;
}
