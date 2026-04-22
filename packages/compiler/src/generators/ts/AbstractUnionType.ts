import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import { imports } from "./imports.js";
import { removeUndefined } from "./removeUndefined.js";
import { snippets } from "./snippets.js";
import type { Type } from "./Type.js";
import type { Typeof } from "./Typeof.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

interface MemberTypeDescriptor<MemberTypeT extends Type> {
  readonly discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
  readonly jsonTypeCheck: (instance: Code) => Code;
  readonly memberType: MemberTypeT;
  readonly payload: (instance: Code) => Code;
  readonly primaryDiscriminantValue: AbstractType.DiscriminantProperty.Value;
  readonly typeCheck: (instance: Code) => Code;
}

export abstract class AbstractUnionType<
  MemberTypeT extends Type,
> extends AbstractType {
  private readonly discriminant: Discriminant;

  override readonly abstract = false;
  readonly memberTypes: readonly MemberTypeT[];
  override readonly recursive: boolean;

  constructor({
    memberDiscriminantValues,
    memberTypes,
    recursive,
    ...superParameters
  }: {
    memberDiscriminantValues: readonly string[];
    memberTypes: readonly MemberTypeT[];
    recursive: boolean;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    invariant(memberTypes.length >= 2);
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
          ({ memberType, primaryDiscriminantValue, typeCheck }) => ({
            conversionExpression: (value) => value,
            sourceTypeCheckExpression: (value) => typeCheck(value),
            sourceTypeName: memberType.name,
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
  get memberTypeDescriptors(): readonly MemberTypeDescriptor<MemberTypeT>[] {
    return this.memberTypes.flatMap((memberType, memberTypeI) => {
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

      if (discriminantValues.length === 0) {
        return [];
      }

      const typeCheck =
        (json: boolean) =>
        (instance: Code): Code => {
          switch (this.discriminant.kind) {
            case "envelope":
              return code`(${joinCode(
                discriminantValues.map(
                  (discriminantValue) =>
                    code`${instance}.type === ${literalOf(discriminantValue)}`,
                ),
                { on: " || " },
              )})`;

            case "inline": {
              if (!json) {
                switch (memberType.kind) {
                  case "NamedObjectUnionType":
                  case "NamedUnionType":
                  case "ObjectType":
                    return code`${memberType.staticModuleName}.is${memberType.name}(${instance})`;
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

      return [
        {
          discriminantValues,
          jsonTypeCheck: typeCheck(true),
          memberType,
          payload: (instance: Code): Code => {
            switch (this.discriminant.kind) {
              case "envelope":
                return code`${instance}.value`;
              // return code`(${instance}.value as ${memberType.name})`;
              case "inline":
              case "typeof":
                return instance;
              // return code`(${instance} as ${memberType.name})`;
            }
          },
          primaryDiscriminantValue: discriminantValues[0],
          typeCheck: typeCheck(false),
        },
      ];
    });
  }

  @Memoize()
  override get mutable(): boolean {
    return this.memberTypes.some((memberType) => memberType.mutable);
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
        this.memberTypeDescriptors.map(
          ({ memberType, primaryDiscriminantValue }) =>
            code`readonly ${literalOf(primaryDiscriminantValue)}: ${{
              discriminantValues: code`readonly (number | string)[]`,
              type: memberType.schemaType,
            }}`,
        ),
        { on: ";" },
      )} }`,
    }}`;
  }

  @Memoize()
  override get typeofs(): AbstractType["typeofs"] {
    return NonEmptyList.fromArray(
      this.memberTypes.flatMap((memberType) => memberType.typeofs),
    ).unsafeCoerce();
  }

  @Memoize()
  protected get concreteMemberTypeDescriptors(): readonly MemberTypeDescriptor<MemberTypeT>[] {
    return this.memberTypeDescriptors.filter(
      ({ memberType }) => !memberType.abstract,
    );
  }

  @Memoize()
  protected get inlineEqualsFunction(): Code {
    return code`\
((left: ${this.name}, right: ${this.name}) => {
${joinCode(
  this.concreteMemberTypeDescriptors.map(
    ({ memberType, payload, typeCheck }) =>
      code`if (${typeCheck(code`left`)} && ${typeCheck(code`right`)}) {
  return ${memberType.equalsFunction}(${payload(code`left`)} as ${memberType.name}, ${payload(code`right`)} as ${memberType.name});
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
${joinCode(
  this.memberTypeDescriptors.map(
    ({ memberType, primaryDiscriminantValue, payload, typeCheck }) => code`\
if (filter.on?.[${literalOf(primaryDiscriminantValue)}] !== undefined && ${typeCheck(code`value`)}) {
  if (!${memberType.filterFunction}(filter.on[${literalOf(primaryDiscriminantValue)}], ${payload(code`value`)})) {
    return false;
  }
}`,
  ),
)}

  return true;
})`;
  }

  @Memoize()
  protected get inlineFilterType(): Code {
    return code`{ readonly on?: { ${joinCode(
      this.memberTypeDescriptors.map(
        ({ memberType, primaryDiscriminantValue }) =>
          code`readonly ${literalOf(primaryDiscriminantValue)}?: ${memberType.filterType}`,
      ),
      { on: ";" },
    )} } }`;
  }

  protected get inlineFromJsonFunction(): Code {
    return code`\
((value: ${this.jsonType().name}): ${this.name} => {
${joinCode(
  this.concreteMemberTypeDescriptors.map(
    ({ jsonTypeCheck, memberType, primaryDiscriminantValue, payload }) => {
      let memberTypeFromJsonExpression = memberType.fromJsonExpression({
        variables: {
          value: code`(${payload(code`value`)} as ${memberType.jsonType().name})`,
        },
      });
      if (this.discriminant.kind === "envelope") {
        memberTypeFromJsonExpression = code`{ ${this.discriminant.name}: "${primaryDiscriminantValue}" as const, value: ${memberTypeFromJsonExpression} }`;
      }
      return code`if (${jsonTypeCheck(code`value`)}) { return ${memberTypeFromJsonExpression}; }`;
    },
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
      return ${this.concreteMemberTypeDescriptors.reduce(
        (expression, { memberType, primaryDiscriminantValue }) => {
          let typeExpression: Code = memberType.fromRdfResourceValuesExpression(
            {
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
            },
          );
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
            this.concreteMemberTypeDescriptors.map(
              ({ memberType, primaryDiscriminantValue }) =>
                code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: ${literalOf(primaryDiscriminantValue)}, value: ${memberType.jsonType().name} }`,
            ),
            { on: "|" },
          )})`,
        );
      case "inline":
      case "typeof":
        return new AbstractType.JsonType(
          joinCode(
            this.concreteMemberTypeDescriptors.map(
              ({ memberType }) =>
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

  protected get inlineJsonZodSchema(): Code {
    switch (this.discriminant.kind) {
      case "envelope":
        return code`${imports.z}.discriminatedUnion("${this.discriminant.name}", [${joinCode(
          this.concreteMemberTypeDescriptors.map(
            ({ memberType, primaryDiscriminantValue }) =>
              code`${imports.z}.object({ ${(this.discriminant as EnvelopeDiscriminant).name}: ${imports.z}.literal(${literalOf(primaryDiscriminantValue)}), value: ${memberType.jsonZodSchema({ context: "type" })} })`,
          ),
          { on: "," },
        )}])`;
      case "inline":
        return code`${imports.z}.discriminatedUnion("${this.discriminant.name}", [${joinCode(
          this.concreteMemberTypeDescriptors.map(({ memberType }) =>
            memberType.jsonZodSchema({
              includeDiscriminantProperty: true,
              context: "type",
            }),
          ),
          { on: "," },
        )}])`;
      case "typeof":
        return code`${imports.z}.union([${joinCode(
          this.concreteMemberTypeDescriptors.map(({ memberType }) =>
            memberType.jsonZodSchema({ context: "type" }),
          ),
          { on: "," },
        )}])`;
      default:
        throw this.discriminant satisfies never;
    }
  }

  @Memoize()
  protected get inlineName(): Code {
    switch (this.discriminant.kind) {
      case "envelope":
        return code`(${joinCode(
          this.memberTypeDescriptors.map(
            ({ memberType, primaryDiscriminantValue }) =>
              code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: ${literalOf(primaryDiscriminantValue)}, value: ${memberType.name} }`,
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
  protected get inlineValueSparqlConstructTriplesFunction(): Code {
    return code`\
((({ ignoreRdfType, filter, schema, ...otherParameters }) => {
  let triples: ${imports.sparqljs}.Triple[] = [];

  ${joinCode(
    this.concreteMemberTypeDescriptors.map(
      ({ memberType, primaryDiscriminantValue }) => code`\
triples = triples.concat(${memberType.valueSparqlConstructTriplesFunction}({ ...otherParameters, filter: filter?.on?.[${literalOf(primaryDiscriminantValue)}], ignoreRdfType: false, schema: schema.members[${literalOf(primaryDiscriminantValue)}].type }));`,
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
    this.concreteMemberTypeDescriptors.map(
      ({ memberType, primaryDiscriminantValue }) => code`\
unionPatterns.push({ patterns: ${memberType.valueSparqlWherePatternsFunction}({ ...otherParameters, filter: filter?.on?.[${literalOf(primaryDiscriminantValue)}], ignoreRdfType: false, schema: schema.members[${literalOf(primaryDiscriminantValue)}].type }).concat(), type: "group" });`,
    ),
  )}
  
  return [{ patterns: unionPatterns, type: "union" }];
}) satisfies ${snippets.ValueSparqlWherePatternsFunction}<${this.filterType}, ${this.schemaType}>)`;
  }

  protected get inlineToJsonFunction(): Code {
    return code`\
((value: ${this.name}): ${this.jsonType().name} => {
${joinCode(
  this.concreteMemberTypeDescriptors.map(
    ({ memberType, payload, primaryDiscriminantValue, typeCheck }) => {
      let memberTypeToJsonExpression = memberType.toJsonExpression({
        includeDiscriminantProperty: this.discriminant.kind === "inline",
        variables: { value: payload(code`value`) },
      });
      if (this.discriminant.kind === "envelope") {
        memberTypeToJsonExpression = code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: "${primaryDiscriminantValue}" as const, value: ${memberTypeToJsonExpression} }`;
      }
      return code`if (${typeCheck(code`value`)}) { return ${memberTypeToJsonExpression}; }`;
    },
  ),
)}

  throw new Error("unable to serialize to JSON");
})`;
  }

  protected get inlineToRdfResourceValuesFunction(): Code {
    return code`\
(((value, _options) => {
${joinCode(
  this.concreteMemberTypeDescriptors.map(
    ({ memberType, payload, typeCheck }) =>
      code`if (${typeCheck(code`value`)}) { return ${memberType.toRdfResourceValuesExpression(
        {
          variables: {
            graph: code`_options.graph`,
            propertyPath: code`_options.propertyPath`,
            resource: code`_options.resource`,
            resourceSet: code`_options.resourceSet`,
            value: payload(code`value`),
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
        this.memberTypeDescriptors.map(
          ({ discriminantValues, memberType, primaryDiscriminantValue }) =>
            code`${literalOf(primaryDiscriminantValue)}: ${{
              discriminantValues: discriminantValues,
              type: memberType.schema,
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
    return this.concreteMemberTypeDescriptors.map(
      ({ memberType, payload, typeCheck }) =>
        code`if (${typeCheck(variables.value)}) { ${joinCode(
          memberType
            .hashStatements({
              depth: depth + 1,
              variables: {
                hasher: variables.hasher,
                value: payload(variables.value),
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
