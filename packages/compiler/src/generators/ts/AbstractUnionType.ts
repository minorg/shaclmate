import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { BlankNodeType } from "./BlankNodeType.js";
import type { IdentifierType } from "./IdentifierType.js";
import type { IriType } from "./IriType.js";

import { removeUndefined } from "./removeUndefined.js";

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
    this.discriminant = Discriminant.infer(members);

    this.lazyMembers = () =>
      members.map((member, memberI) => {
        let discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
        invariant(this.discriminant.memberValues.length === members.length);
        switch (this.discriminant.kind) {
          case "extrinsic":
            discriminantValues = [this.discriminant.memberValues[memberI]];
            break;
          case "hybrid":
            discriminantValues =
              this.discriminant.memberValues[memberI].ownValues;
            break;
          case "intrinsic": {
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

            if (discriminant.kind === "typeof") {
              return code`(${joinCode(
                discriminantValues.map(
                  (discriminantValue) =>
                    code`typeof ${instance} === ${literalOf(discriminantValue)}`,
                ),
                { on: " || " },
              )})`;
            }

            if (discriminant.kind === "intrinsic" && !json) {
              switch (member.type.kind) {
                case "NamedObjectUnionType":
                case "NamedUnionType":
                case "NamedObjectType":
                  return code`${member.type.name}.is${member.type.name}(${instance})`;
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
              this.discriminant.kind === "intrinsic" ||
              (this.discriminant.kind === "hybrid" &&
                this.discriminant.memberValues[memberI].kind === "intrinsic"),
          }).name,
          jsonTypeCheck: typeCheck(true),
          primaryDiscriminantValue: discriminantValues[0],
          type: member.type,
          typeCheck: typeCheck(false),
          typeToJsonExpression: (valueVariable) =>
            member.type.toJsonExpression({
              includeDiscriminantProperty:
                this.discriminant.kind === "intrinsic" ||
                (this.discriminant.kind === "hybrid" &&
                  this.discriminant.memberValues[memberI].kind === "intrinsic"),
              variables: { value: valueVariable },
            }),
          unwrap: (instance: Code): Code => {
            switch (this.discriminant.kind) {
              case "extrinsic":
                return code`${instance}.value`;
              case "hybrid":
                return this.discriminant.memberValues[memberI].kind ===
                  "intrinsic"
                  ? instance
                  : code`${instance}.value`;
              case "intrinsic":
              case "typeof":
                return instance;
            }
          },
          wrap: (instance: Code): Code => {
            switch (this.discriminant.kind) {
              case "extrinsic":
                return code`{ ${this.discriminant.name}: ${literalOf(discriminantValues[0])} as const, value: ${instance} }`;
              case "hybrid":
                return this.discriminant.memberValues[memberI].kind ===
                  "intrinsic"
                  ? instance
                  : code`{ ${this.discriminant.name}: ${literalOf(discriminantValues[0])} as const, value: ${instance} }`;
              case "intrinsic":
              case "typeof":
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
        this.discriminant.kind === "typeof"
          ? this.members.map(({ primaryDiscriminantValue, type }) => ({
              name: type.name,
              typeof: primaryDiscriminantValue as Typeof,
            }))
          : [
              {
                name: this.name,
                typeof: "object",
              },
            ],
    });
  }

  @Memoize()
  override get discriminantProperty(): Maybe<AbstractType.DiscriminantProperty> {
    switch (this.discriminant.kind) {
      case "extrinsic":
        return Maybe.of({
          descendantValues: [],
          jsonName: this.discriminant.jsonName,
          ownValues: this.discriminant.memberValues,
          name: this.discriminant.name,
        });
      case "hybrid":
        return Maybe.of({
          descendantValues: [],
          jsonName: this.discriminant.jsonName,
          ownValues: this.discriminant.memberValues.flatMap((_) => _.ownValues),
          name: "termType",
        });
      case "intrinsic":
        return Maybe.of({
          descendantValues: this.discriminant.memberValues.flatMap(
            (_) => _.descendantValues,
          ),
          jsonName: this.discriminant.jsonName,
          name: this.discriminant.name,
          ownValues: this.discriminant.memberValues.flatMap((_) => _.ownValues),
        });
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
      //   kind: '"extrinsic" | "intrinsic" | "typeof"',
      // },
      kind: code`${literalOf(this.kind.substring(0, this.kind.length - "Type".length))}`,
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
  override get typeofs(): AbstractType["typeofs"] {
    return [...new Set(this.members.flatMap((member) => member.type.typeofs))];
  }

  @Memoize()
  protected get inlineEqualsFunction(): Code {
    return code`\
((left: ${this.name}, right: ${this.name}) => {
${joinCode(
  this.members.map(
    ({ type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`left`)} && ${typeCheck(code`right`)}) {
  return ${type.equalsFunction}(${unwrap(code`left`)} as ${type.name}, ${unwrap(code`right`)} as ${type.name});
}`,
  ),
)}

  return ${this.reusables.imports.Left}({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "boolean" as const }, type: "property" as const });
})`;
  }

  @Memoize()
  protected get inlineFilterFunction(): Code {
    const syntheticNamePrefix = this.configuration.syntheticNamePrefix;
    return code`\
((filter: ${this.filterType}, value: ${this.name}) => {
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
  protected get inlineFilterType(): Code {
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

  protected get inlineFromJsonFunction(): Code {
    return code`\
((value: ${this.jsonType().name}): ${this.name} => {
${joinCode(
  this.members.map(
    ({ jsonType, jsonTypeCheck, type, unwrap, wrap }) =>
      code`if (${jsonTypeCheck(code`value`)}) { return ${wrap(
        type.fromJsonExpression({
          variables: {
            value: code`(${unwrap(code`value`)} as ${jsonType})`,
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
            this.discriminant.kind === "extrinsic" ||
            (this.discriminant.kind === "hybrid" &&
              this.discriminant.memberValues[memberI].kind === "extrinsic")
          ) {
            typeExpression = code`${typeExpression}.map(values => values.map(value => ({ ${this.discriminant.name}: ${literalOf(primaryDiscriminantValue)} as const, value }) as (${this.name})))`;
          }
          typeExpression = code`(${typeExpression} as ${this.reusables.imports.Either}<Error, ${this.reusables.imports.Resource}.Values<${this.name}>>)`;
          return expression !== null
            ? code`${expression}.altLazy(() => ${typeExpression})`
            : typeExpression;
        },
        null as Code | null,
      )!}.chain(values => values.head());
    }))
) satisfies ${this.reusables.snippets.FromRdfResourceValuesFunction}<${this.name}>)`;
  }

  protected get inlineJsonSchema(): Code {
    const discriminant = this.discriminant; // To get type narrowing to work
    switch (discriminant.kind) {
      case "extrinsic":
        return code`${this.reusables.imports.z}.discriminatedUnion("${discriminant.name}", [${joinCode(
          this.members.map(
            ({ type, primaryDiscriminantValue }) =>
              code`${this.reusables.imports.z}.object({ ${discriminant.name}: ${this.reusables.imports.z}.literal(${literalOf(primaryDiscriminantValue)}), value: ${type.jsonSchema({ context: "type" })} })`,
          ),
          { on: "," },
        )}]).readonly()`;

      case "hybrid":
        return code`${this.reusables.imports.z}.discriminatedUnion("${discriminant.name}", [${joinCode(
          this.members.map(({ primaryDiscriminantValue, type }, memberI) => {
            switch (discriminant.memberValues[memberI].kind) {
              case "extrinsic":
                return code`${this.reusables.imports.z}.object({ ${discriminant.name}: ${this.reusables.imports.z}.literal(${literalOf(primaryDiscriminantValue)}), value: ${type.jsonSchema({ context: "type" })} })`;
              case "intrinsic":
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

      case "intrinsic":
        return code`${this.reusables.imports.z}.discriminatedUnion("${discriminant.name}", [${joinCode(
          this.members.map(({ type }) =>
            type.jsonSchema({
              includeDiscriminantProperty: true,
              context: "type",
            }),
          ),
          { on: "," },
        )}]).readonly()`;

      case "typeof":
        return code`${this.reusables.imports.z}.union([${joinCode(
          this.members.map(({ type }) => type.jsonSchema({ context: "type" })),
          { on: "," },
        )}]).readonly()`;

      default:
        throw discriminant satisfies never;
    }
  }

  @Memoize()
  protected get inlineJsonType(): AbstractType.JsonType {
    const discriminant = this.discriminant; // To get type narrowing to work
    switch (discriminant.kind) {
      case "extrinsic":
        return new AbstractType.JsonType(
          code`(${joinCode(
            this.members.map(
              ({ jsonType, primaryDiscriminantValue }) =>
                code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${jsonType} }`,
            ),
            { on: "|" },
          )})`,
        );

      case "hybrid":
        return new AbstractType.JsonType(
          code`(${joinCode(
            this.members.map(
              ({ jsonType, primaryDiscriminantValue }, memberI) => {
                switch (discriminant.memberValues[memberI].kind) {
                  case "extrinsic":
                    return code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${jsonType} }`;
                  case "intrinsic":
                    return code`${jsonType}`;
                  default:
                    throw new Error();
                }
              },
            ),
            { on: "|" },
          )})`,
        );

      case "intrinsic":
      case "typeof":
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

  @Memoize()
  protected get inlineName(): Code {
    const discriminant = this.discriminant; // To get type narrowing to work
    switch (discriminant.kind) {
      case "extrinsic":
        return code`(${joinCode(
          this.members.map(
            ({ type, primaryDiscriminantValue }) =>
              code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${type.name} }`,
          ),
          { on: "|" },
        )})`;
      case "hybrid":
        return code`(${joinCode(
          this.members.map(({ primaryDiscriminantValue, type }, memberI) => {
            switch (discriminant.memberValues[memberI].kind) {
              case "extrinsic":
                return code`{ ${discriminant.name}: ${literalOf(primaryDiscriminantValue)}, value: ${type.name} }`;
              case "intrinsic":
                return code`${type.name}`;
              default:
                throw new Error();
            }
          }),
          { on: "|" },
        )})`;
      case "intrinsic":
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
        discriminant satisfies never;
        throw new Error("should never reach this point");
    }
  }

  protected get inlineToJsonFunction(): Code {
    return code`\
((value: ${this.name}): ${this.jsonType().name} => {
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

  protected get inlineHashFunction(): Code {
    return code`\
(<HasherT extends ${this.reusables.snippets.Hasher}>(hasher: HasherT, value: ${this.name}): HasherT => {
${joinCode(
  this.members.map(
    ({ type, typeCheck, unwrap }) =>
      code`if (${typeCheck(code`value`)}) { return ${type.hashFunction}(hasher, ${unwrap(code`value`)}); }`,
  ),
)}
  return hasher;
})`;
  }

  protected get inlineToRdfResourceValuesFunction(): Code {
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
}) satisfies ${this.reusables.snippets.ToRdfResourceValuesFunction}<${this.name}>)`;
  }

  protected get inlineToStringFunction(): Code {
    return code`\
((value: ${this.name}): string => {
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
  protected get inlineValueSparqlConstructTriplesFunction(): Code {
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
  protected get inlineValueSparqlWherePatternsFunction(): Code {
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

  protected override get schemaObject(): {
    kind: Code;
    members: Code;
  } {
    return {
      ...super.schemaObject,
      members: code`{ ${joinCode(
        this.members.map(
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

  private readonly lazyMembers: () => readonly AbstractUnionType.Member<MemberTypeT>[];
}

type Discriminant =
  | ExtrinsicDiscriminant
  | HybridDiscriminant
  | IntrinsicDiscriminant
  | TypeofDiscriminant;

type ExtrinsicDiscriminant = {
  readonly jsonName: string;
  readonly kind: "extrinsic";
  readonly memberValues: readonly AbstractType.DiscriminantProperty.Value[];
  readonly name: string;
};

type HybridDiscriminant = {
  readonly jsonName: string;
  readonly kind: "hybrid";
  readonly memberValues: readonly {
    readonly kind: "extrinsic" | "intrinsic";
    readonly ownValues: readonly AbstractType.DiscriminantProperty.Value[];
  }[];
  readonly name: string;
};

type IntrinsicDiscriminant = {
  readonly jsonName: string;
  readonly kind: "intrinsic";
  readonly memberValues: readonly {
    readonly descendantValues: readonly AbstractType.DiscriminantProperty.Value[];
    readonly ownValues: readonly AbstractType.DiscriminantProperty.Value[];
  }[];
  readonly name: string;
};

type TypeofDiscriminant = {
  readonly kind: "typeof";
  readonly memberValues: readonly Typeof[];
};

function termTypes(
  type: Type,
): ReadonlySet<"BlankNode" | "Literal" | "NamedNode"> {
  switch (type.kind) {
    case "BlankNodeType":
    case "IriType":
    case "IdentifierType":
    case "LiteralType":
    case "TermType":
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
        kind: "extrinsic",
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
      const memberValues: {
        readonly descendantValues: readonly AbstractType.DiscriminantProperty.Value[];
        readonly ownValues: readonly AbstractType.DiscriminantProperty.Value[];
      }[] = [];
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
        memberValues.push({
          descendantValues: memberTypeDiscriminantProperty.descendantValues,
          ownValues: memberTypeDiscriminantProperty.ownValues,
        });
      }

      if (inlineDiscriminantProperty) {
        return {
          jsonName: inlineDiscriminantProperty.jsonName,
          kind: "intrinsic",
          memberValues,
          name: inlineDiscriminantProperty.name,
        };
      }
    }

    // typeof
    {
      const memberTypeofsSet = new Set<Typeof>();
      for (const memberType of memberTypes) {
        for (const memberTypeof of memberType.typeofs) {
          memberTypeofsSet.add(memberTypeof);
        }
      }
      if (memberTypeofsSet.size === memberTypes.length) {
        return {
          memberValues: memberTypes.flatMap((memberType) => memberType.typeofs),
          kind: "typeof",
        };
      }
    }

    // hybrid
    // If some member type is an RDF/JS term then reuse "termType" as the discriminant.
    if (memberTypes.some((memberType) => termTypes(memberType).size > 0)) {
      const extrinsicMemberTypeNamesSet = new Set<string>();
      let extrinsicMemberTypeCount = 0;
      for (const memberType of memberTypes) {
        if (termTypes(memberType).size > 0) {
          continue;
        }
        extrinsicMemberTypeCount++;
        if (typeof memberType.name === "string") {
          extrinsicMemberTypeNamesSet.add(memberType.name);
        } else {
          break;
        }
      }

      return {
        jsonName: "termType",
        kind: "hybrid",
        memberValues: memberTypes.map((memberType, memberTypeI) => {
          const memberTermTypes = termTypes(memberType);
          if (memberTermTypes.size > 0) {
            return {
              kind: "intrinsic",
              ownValues: [...memberTermTypes],
            };
          }

          return {
            kind: "extrinsic",
            ownValues:
              extrinsicMemberTypeNamesSet.size === extrinsicMemberTypeCount
                ? [memberType.name as string]
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
        const memberTypeNames = memberTypes.map(
          (memberType) => memberType.name,
        );
        if (
          memberTypeNames.every(
            (memberTypeName) => typeof memberTypeName === "string",
          )
        ) {
          const memberTypeNamesSet = new Set(memberTypeNames);
          if (memberTypeNamesSet.size === memberTypeNames.length) {
            memberValues = memberTypeNames;
          } else {
            // Otherwise prefix the non-unique strings with an index and use those as the discriminant values.
            memberValues = memberTypeNames.map(
              (memberTypeName, memberTypeI) =>
                `${memberTypeI}-${memberTypeName}`,
            );
          }
        } else {
          // At least one member type name is Code
          // Use member type indices as the discriminant values.
          memberValues = memberTypes.map((_, memberTypeI) => memberTypeI);
        }
      }
      invariant(memberValues.length === memberTypes.length);

      return {
        jsonName: "type",
        kind: "extrinsic",
        name: "type",
        memberValues: memberValues,
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
