import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { type Code, code, joinCode } from "ts-poet";
import { Memoize } from "typescript-memoize";
import { AbstractType } from "./AbstractType.js";
import { codeEquals } from "./codeEquals.js";
import { sharedImports } from "./sharedImports.js";
import type { Type } from "./Type.js";
import type { Typeof } from "./Typeof.js";

class MemberType {
  private readonly delegate: Type;
  private readonly delegateIndex: number;
  private readonly discriminant: Discriminant;
  private readonly universe: readonly Type[];

  constructor({
    delegate,
    delegateIndex,
    discriminant,
    universe,
  }: {
    delegate: Type;
    delegateIndex: number;
    discriminant: Discriminant;
    universe: readonly Type[];
  }) {
    this.delegate = delegate;
    this.delegateIndex = delegateIndex;
    this.discriminant = discriminant;
    this.universe = universe;
  }

  @Memoize()
  get discriminantValues(): readonly string[] {
    switch (this.discriminant.kind) {
      case "envelope":
        return [this.discriminant.ownValues[this.delegateIndex]];
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
        const memberOwnDiscriminantPropertyValues = new Set<string>();
        for (const memberType of this.universe) {
          for (const ownDiscriminantPropertyValue of memberType.discriminantProperty.unsafeCoerce()
            .ownValues) {
            memberOwnDiscriminantPropertyValues.add(
              ownDiscriminantPropertyValue,
            );
          }
        }

        return this.delegate.discriminantProperty
          .unsafeCoerce()
          .ownValues.concat(
            this.delegate.discriminantProperty
              .unsafeCoerce()
              .descendantValues.filter(
                (value) => !memberOwnDiscriminantPropertyValues.has(value),
              ),
          );
      }
      case "typeof":
        return this.delegate.typeofs;
      default:
        throw this.discriminant satisfies never;
    }
  }

  get equalsFunction() {
    return this.delegate.equalsFunction;
  }

  get filterFunction() {
    return this.delegate.filterFunction;
  }

  get filterType() {
    return this.delegate.filterType;
  }

  get mutable() {
    return this.delegate.mutable;
  }

  get name() {
    return this.delegate.name;
  }

  get schema() {
    return this.delegate.schema;
  }

  get schemaType() {
    return this.delegate.schemaType;
  }

  get sparqlWherePatternsFunction() {
    return this.delegate.sparqlWherePatternsFunction;
  }

  get typeofs() {
    return this.delegate.typeofs;
  }

  fromJsonExpression(
    parameters: Parameters<AbstractType["fromJsonExpression"]>[0],
  ) {
    return this.delegate.fromJsonExpression(parameters);
  }

  fromRdfExpression(
    parameters: Parameters<AbstractType["fromRdfExpression"]>[0],
  ) {
    return this.delegate.fromRdfExpression(parameters);
  }

  hashStatements(parameters: Parameters<AbstractType["hashStatements"]>[0]) {
    return this.delegate.hashStatements(parameters);
  }

  jsonType(parameters?: Parameters<AbstractType["jsonType"]>[0]) {
    return this.delegate.jsonType(parameters);
  }

  jsonZodSchema(parameters: Parameters<AbstractType["jsonZodSchema"]>[0]) {
    return this.delegate.jsonZodSchema(parameters);
  }

  payload(instance: Code): Code {
    switch (this.discriminant.kind) {
      case "envelope":
        return code`${instance}.value`;
      case "inline":
      case "typeof":
        return instance;
    }
  }

  sparqlConstructTriples(
    parameters: Parameters<AbstractType["sparqlConstructTriples"]>[0],
  ) {
    return this.delegate.sparqlConstructTriples(parameters);
  }

  toJsonExpression(
    parameters: Parameters<AbstractType["toJsonExpression"]>[0],
  ) {
    return this.delegate.toJsonExpression(parameters);
  }

  toRdfExpression(parameters: Parameters<AbstractType["toRdfExpression"]>[0]) {
    return this.delegate.toRdfExpression(parameters);
  }
}

export class UnionType extends AbstractType {
  private readonly discriminant: Discriminant;
  private readonly memberTypes: readonly MemberType[];

  #name?: Code;

  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly kind = "UnionType";

  constructor({
    memberDiscriminantValues,
    memberTypes,
    ...superParameters
  }: {
    memberDiscriminantValues: readonly string[];
    memberTypes: readonly Type[];
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    invariant(memberTypes.length >= 2);
    invariant(
      memberDiscriminantValues.length === 0 ||
        memberDiscriminantValues.length === memberTypes.length,
    );

    let discriminant: Discriminant | undefined;
    if (memberDiscriminantValues.length === 0) {
      // Infer the discriminant kind
      const inlineDiscriminantProperty_ =
        inlineDiscriminantProperty(memberTypes);
      if (inlineDiscriminantProperty_) {
        discriminant = {
          ...inlineDiscriminantProperty_,
          kind: "inline",
        };
      } else {
        const memberTypeofs = new Set<string>();
        for (const memberType of memberTypes) {
          for (const typeof_ of memberType.typeofs) {
            memberTypeofs.add(typeof_);
          }
        }
        if (memberTypeofs.size === memberTypes.length) {
          discriminant = {
            kind: "typeof",
          };
        }
      }
    }
    if (!discriminant) {
      discriminant = {
        descendantValues: [],
        kind: "envelope",
        name: "type",
        ownValues:
          memberDiscriminantValues.length > 0
            ? memberDiscriminantValues
            : memberTypes.map(
                (memberType, memberTypeIndex) =>
                  `${memberTypeIndex}-${memberType.name}`,
              ),
      };
    }
    this.discriminant = discriminant;

    this.memberTypes = memberTypes.map(
      (memberType, memberTypeIndex) =>
        new MemberType({
          delegate: memberType,
          delegateIndex: memberTypeIndex,
          discriminant: this.discriminant,
          universe: memberTypes,
        }),
    );
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
        return this.memberTypes.map((memberType) => ({
          conversionExpression: (value) => value,
          sourceTypeCheckExpression: (value) =>
            code`typeof ${value} === "${memberType.discriminantValues[0]}"`,
          sourceTypeName: memberType.name,
          sourceTypeof: memberType.discriminantValues[0] as Typeof,
        }));
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
  override get equalsFunction(): Code {
    return code`\
((left: ${this.name}, right: ${this.name}) => {
${joinCode(
  this.memberTypes.flatMap((memberType) =>
    memberType.discriminantValues.map(
      (
        value,
      ) => code`if (${this.discriminantVariable(code`left`)} === "${value}" && ${this.discriminantVariable(code`right`)} === "${value}") {
  return ${memberType.equalsFunction}(${memberType.payload(code`left`)}, ${memberType.payload(code`right`)});
}`,
    ),
  ),
)}

  return ${sharedImports.Left}({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "BooleanEquals" as const }, type: "Property" as const });
})`;
  }

  @Memoize()
  get filterFunction(): Code {
    return code`\
((filter: ${this.filterType}, value: ${this.name}) => {
${joinCode(
  this.memberTypes.map(
    (memberType) => code`\
if (typeof filter.on?.["${memberType.discriminantValues[0]}"] !== "undefined") {
  switch (${this.discriminantVariable(code`value`)}) {
${memberType.discriminantValues.map((discriminantValue) => `case "${discriminantValue}":`)}
    if (!${memberType.filterFunction}(filter.on["${memberType.discriminantValues[0]}"], ${memberType.payload(code`value`)})) {
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
  get filterType(): Code {
    return code`{ readonly on?: { ${joinCode(
      this.memberTypes.map(
        (memberType) =>
          code`readonly "${memberType.discriminantValues[0]}"?: ${memberType.filterType}`,
      ),
      { on: ";" },
    )} } }`;
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
    if (typeof this.#name === "undefined") {
      switch (this.discriminant.kind) {
        case "envelope":
          this.#name = code`(${joinCode(
            this.memberTypes.map(
              (memberType) =>
                code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: "${memberType.discriminantValues[0]}", value: ${memberType.name} }`,
            ),
            { on: "|" },
          )})`;
          break;
        case "inline":
          // If every type shares a discriminant (e.g., RDF/JS "termType" or generated ObjectType "type"),
          // just join their names with "|"
          this.#name = code`(${joinCode(
            this.memberTypes.map((memberType) => memberType.name),
            { on: "|" },
          )})`;
          break;
        case "typeof":
          // The memberType.name may include literal values, but they should still be unambiguous with other member types since the typeofs
          // of the different member types are known to be different.
          this.#name = code`(${joinCode(
            this.memberTypes.map((memberType) => memberType.name),
            { on: "|" },
          )})`;
          break;
      }
    }
    return this.#name!;
  }

  @Memoize()
  override get schema(): Code {
    return code`${{
      // discriminant: {
      //   kind: `${JSON.stringify(this.discriminant.kind)} as const`,
      // },
      kind: '"UnionType" as const',
      members: `{ ${joinCode(
        this.memberTypes.map(
          (memberType) =>
            code`"${memberType.discriminantValues[0]}": ${{
              discriminantValues: memberType.discriminantValues,
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
      kind: '"UnionType"',
      members: `{ ${joinCode(
        this.memberTypes.map(
          (memberType) =>
            code`readonly "${memberType.discriminantValues[0]}": ${{
              discriminantValues: "readonly string[]",
              type: memberType.schemaType,
            }}`,
        ),
        { on: ";" },
      )} }`,
    }}`;
  }

  @Memoize()
  override get sparqlWherePatternsFunction(): Code {
    return code`\
(({ filter, schema, ...otherParameters }) => {
  const unionPatterns: ${sharedImports.sparqljs}.GroupPattern[] = [];

  ${joinCode(
    this.memberTypes.map(
      (memberType) => code`\
{
  unionPatterns.push({ patterns: ${memberType.sparqlWherePatternsFunction}({ filter: filter?.on?.["${memberType.discriminantValues[0]}"], schema: schema.members["${memberType.discriminantValues[0]}"].type, ...otherParameters }).concat(), type: "group" });
}`,
    ),
  )}
  
  return [{ patterns: unionPatterns, type: "union" }];
})`;
  }

  @Memoize()
  override get typeofs(): AbstractType["typeofs"] {
    return NonEmptyList.fromArray(
      this.memberTypes.flatMap((memberType) => memberType.typeofs),
    ).unsafeCoerce();
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): Code {
    return this.ternaryExpression({
      memberTypeExpression: (memberType) => {
        let typeExpression: Code = memberType.fromJsonExpression({
          variables: {
            value: memberType.payload(variables.value),
          },
        });
        if (this.discriminant.kind === "envelope") {
          typeExpression = code`{ ${this.discriminant.name}: "${memberType.discriminantValues[0]}" as const, value: ${typeExpression} }`;
        }
        return typeExpression;
      },
      variables,
    });
  }

  override fromRdfExpression({
    variables,
  }: Parameters<AbstractType["fromRdfExpression"]>[0]): Code {
    return code`${variables.resourceValues}.chain(values => values.chainMap(value => {
      const valueAsValues = ${sharedImports.Either}.of(value.toValues());
      return ${this.memberTypes.reduce(
        (expression, memberType) => {
          let typeExpression: Code = memberType.fromRdfExpression({
            variables: {
              ...variables,
              ignoreRdfType: false,
              resourceValues: code`valueAsValues`,
            },
          });
          if (this.discriminant.kind === "envelope") {
            typeExpression = code`${typeExpression}.map(values => values.map(value => ({ ${this.discriminant.name}: "${memberType.discriminantValues[0]}" as const, value }) as (${this.name})))`;
          }
          typeExpression = code`(${typeExpression} as ${sharedImports.Either}<Error, ${sharedImports.Resource}.Values<${this.name}>>)`;
          return expression !== null
            ? code`${expression}.altLazy(() => ${typeExpression})`
            : typeExpression;
        },
        null as Code | null,
      )!}.chain(values => values.head());
      }))`;
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
    const caseBlocks: Code[] = [];
    for (const memberType of this.memberTypes) {
      caseBlocks.push(
        code`${joinCode(memberType.discriminantValues.map((discriminantPropertyValue) => code`case "${discriminantPropertyValue}":`))} { ${joinCode(
          memberType
            .hashStatements({
              depth: depth + 1,
              variables: {
                hasher: variables.hasher,
                value: memberType.payload(variables.value),
              },
            })
            .concat(),
        )}; break; }`,
      );
    }
    caseBlocks.push(
      code`default: ${variables.value} satisfies never; throw new Error("unrecognized type");`,
    );
    return [
      code`switch (${this.discriminantVariable(variables.value)}) { ${joinCode(caseBlocks)} }`,
    ];
  }

  @Memoize()
  override jsonType(): AbstractType.JsonType {
    switch (this.discriminant.kind) {
      case "envelope":
        return new AbstractType.JsonType(
          code`(${joinCode(
            this.memberTypes.map(
              (memberType) =>
                code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: "${memberType.discriminantValues[0]}", value: ${memberType.jsonType().name} }`,
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
                memberType.jsonType({
                  includeDiscriminantProperty:
                    this.discriminant.kind === "inline",
                }).name,
            ),
            { on: "|" },
          ),
        );
      default:
        throw this.discriminant satisfies never;
    }
  }

  override jsonUiSchemaElement(): Maybe<Code> {
    return Maybe.empty();
  }

  override jsonZodSchema(
    _parameters: Parameters<AbstractType["jsonZodSchema"]>[0],
  ): Code {
    switch (this.discriminant.kind) {
      case "envelope":
        return code`${sharedImports.z}.discriminatedUnion("${this.discriminant.name}", [${joinCode(
          this.memberTypes.map(
            (memberType) =>
              code`${sharedImports.z}.object({ ${(this.discriminant as EnvelopeDiscriminant).name}: ${sharedImports.z}.literal("${memberType.discriminantValues[0]}"), value: ${memberType.jsonZodSchema({ context: "type" })} })`,
          ),
          { on: "," },
        )}])`;
      case "inline":
        return code`${sharedImports.z}.discriminatedUnion("${this.discriminant.name}", [${joinCode(
          this.memberTypes.map((memberType) =>
            memberType.jsonZodSchema({
              includeDiscriminantProperty: true,
              context: "type",
            }),
          ),
          { on: "," },
        )}])`;
      case "typeof":
        return code`${sharedImports.z}.union([${joinCode(
          this.memberTypes.map((memberType) =>
            memberType.jsonZodSchema({ context: "type" }),
          ),
          { on: "," },
        )}])`;
      default:
        throw this.discriminant satisfies never;
    }
  }

  override sparqlConstructTriples(
    parameters: Parameters<AbstractType["sparqlConstructTriples"]>[0],
  ): Code {
    return code`[${joinCode(
      this.memberTypes.map(
        (memberType) =>
          code`...${memberType.sparqlConstructTriples({
            ...parameters,
            allowIgnoreRdfType: false,
          })}`,
      ),
      { on: "," },
    )}]`;
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): Code {
    switch (this.discriminant.kind) {
      case "envelope":
        return this.ternaryExpression({
          memberTypeExpression: (memberType) =>
            code`{ ${(this.discriminant as EnvelopeDiscriminant).name}: "${memberType.discriminantValues[0]}" as const, value: ${memberType.toJsonExpression(
              {
                variables: {
                  ...variables,
                  value: memberType.payload(variables.value),
                },
              },
            )} }`,
          variables,
        });
      case "inline":
      case "typeof":
        return this.ternaryExpression({
          memberTypeExpression: (memberType) =>
            memberType.toJsonExpression({
              includeDiscriminantProperty: this.discriminant.kind === "inline",
              variables: {
                ...variables,
                value: memberType.payload(variables.value),
              },
            }),
          variables,
        });
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): Code {
    return this.ternaryExpression({
      memberTypeExpression: (memberType) =>
        code`(${memberType.toRdfExpression({
          variables: {
            ...variables,
            value: memberType.payload(variables.value),
          },
        })} as readonly Parameters<${sharedImports.MutableResource}["add"]>[1][])`,
      variables,
    });
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

  private ternaryExpression({
    memberTypeExpression,
    variables,
  }: {
    memberTypeExpression: (memberType: MemberType) => Code;
    variables: { value: Code };
  }): Code {
    return this.memberTypes.reduce(
      (expression, memberType) => {
        if (expression === null) {
          return memberTypeExpression(memberType);
        }

        const memberTypeExpression_ = memberTypeExpression(memberType);
        if (codeEquals(memberTypeExpression_, expression)) {
          return expression;
        }

        return code`(${joinCode(
          memberType.discriminantValues.map(
            (value) =>
              code`${this.discriminantVariable(variables.value)} === "${value}"`,
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

function inlineDiscriminantProperty(memberTypes: readonly Type[]):
  | (Omit<
      AbstractType.DiscriminantProperty,
      "descendantValues" | "ownValues"
    > & {
      descendantValues: string[];
      ownValues: string[];
    })
  | undefined {
  let inlineDiscriminantProperty:
    | (Omit<
        AbstractType.DiscriminantProperty,
        "descendantValues" | "ownValues"
      > & {
        descendantValues: string[];
        ownValues: string[];
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
