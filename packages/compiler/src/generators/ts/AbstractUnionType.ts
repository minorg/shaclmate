import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import { codeEquals } from "./codeEquals.js";
import { imports } from "./imports.js";
import { removeUndefined } from "./removeUndefined.js";
import { snippets } from "./snippets.js";
import type { Type } from "./Type.js";
import type { Typeof } from "./Typeof.js";
import { type Code, code, joinCode, literalOf } from "./ts-poet-wrapper.js";

interface MemberTypeDescriptor<MemberTypeT extends Type> {
  readonly discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
  readonly memberType: MemberTypeT;
  readonly payload: (instance: Code) => Code;
}

export abstract class AbstractUnionType<
  MemberTypeT extends Type,
> extends AbstractType {
  private readonly discriminant: Discriminant;

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

      return [
        {
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
    return code`${this.schemaTypeObject}`;
  }

  @Memoize()
  override get typeofs(): AbstractType["typeofs"] {
    return NonEmptyList.fromArray(
      this.memberTypes.flatMap((memberType) => memberType.typeofs),
    ).unsafeCoerce();
  }

  @Memoize()
  protected get inlineEqualsFunction(): Code {
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
  protected get inlineFilterFunction(): Code {
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
  protected get inlineFilterType(): Code {
    return code`{ readonly on?: { ${joinCode(
      this.memberTypeDescriptors.map(
        ({ memberType, discriminantValues }) =>
          code`readonly ${literalOf(discriminantValues[0])}?: ${memberType.filterType}`,
      ),
      { on: ";" },
    )} } }`;
  }

  @Memoize()
  protected get inlineName(): Code {
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
  protected get inlineSparqlConstructTriplesFunction(): Code {
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
  protected get inlineSparqlWherePatternsFunction(): Code {
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

  protected override get schemaObject(): {
    kind: Code;
    members: Readonly<
      Record<
        string,
        Readonly<{
          discriminantValues: readonly AbstractType.DiscriminantProperty.Value[];
          type: Code;
        }>
      >
    >;
  } {
    return {
      ...super.schemaObject,
      members: this.memberTypeDescriptors.reduce(
        (map, { memberType, discriminantValues }) => {
          map[discriminantValues[0]] = {
            discriminantValues,
            type: memberType.schema,
          };
          return map;
        },
        {} as Record<string, any>,
      ),
    };
  }

  protected get schemaTypeObject(): { kind: Code; members: Code } {
    invariant(this.kind.endsWith("Type"));
    return {
      kind: code`${literalOf(this.kind.substring(0, this.kind.length - "Type".length))} as const`,
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
    };
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  protected discriminantVariable(variableValue: Code): Code {
    switch (this.discriminant.kind) {
      case "envelope":
      case "inline":
        return code`${variableValue}.${this.discriminant.name}`;
      case "typeof":
        return code`(typeof ${variableValue})`;
    }
  }

  protected inlineFromJsonExpression({
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

  protected inlineFromRdfExpression({
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

  protected inlineHashStatements({
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
  protected inlineJsonType(): AbstractType.JsonType {
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

  protected inlineJsonZodSchema(): Code {
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

  protected inlineToJsonExpression({
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

  protected inlineToRdfExpression({
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

  protected ternaryExpression({
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
