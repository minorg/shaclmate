import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { Import } from "./Import.js";
import { mergeSnippetDeclarations } from "./mergeSnippetDeclarations.js";
import { Sparql } from "./Sparql.js";
import { Type } from "./Type.js";

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

  get typeofs() {
    return this.delegate.typeofs;
  }

  fromJsonExpression(parameters: Parameters<Type["fromJsonExpression"]>[0]) {
    return this.delegate.fromJsonExpression(parameters);
  }

  fromRdfExpression(parameters: Parameters<Type["fromRdfExpression"]>[0]) {
    return this.delegate.fromRdfExpression(parameters);
  }

  jsonType(parameters?: Parameters<Type["jsonType"]>[0]) {
    return this.delegate.jsonType(parameters);
  }

  hashStatements(parameters: Parameters<Type["hashStatements"]>[0]) {
    return this.delegate.hashStatements(parameters);
  }

  jsonZodSchema(parameters: Parameters<Type["jsonZodSchema"]>[0]) {
    return this.delegate.jsonZodSchema(parameters);
  }

  payload(instance: string): string {
    switch (this.discriminant.kind) {
      case "envelope":
        return `${instance}.value`;
      case "inline":
      case "typeof":
        return instance;
    }
  }

  snippetDeclarations(parameters: Parameters<Type["snippetDeclarations"]>[0]) {
    return this.delegate.snippetDeclarations(parameters);
  }

  sparqlConstructTriples(
    parameters: Parameters<Type["sparqlConstructTriples"]>[0],
  ) {
    return this.delegate.sparqlConstructTriples(parameters);
  }

  sparqlWherePatterns(parameters: Parameters<Type["sparqlWherePatterns"]>[0]) {
    return this.delegate.sparqlWherePatterns(parameters);
  }

  toJsonExpression(parameters: Parameters<Type["toJsonExpression"]>[0]) {
    return this.delegate.toJsonExpression(parameters);
  }

  toRdfExpression(parameters: Parameters<Type["toRdfExpression"]>[0]) {
    return this.delegate.toRdfExpression(parameters);
  }

  useImports(parameters: Parameters<Type["useImports"]>[0]) {
    return this.delegate.useImports(parameters);
  }
}

export class UnionType extends AbstractType {
  private readonly discriminant: Discriminant;
  private readonly memberTypes: readonly MemberType[];
  #name?: string;

  override readonly graphqlArgs: Type["graphqlArgs"] = Maybe.empty();
  readonly kind = "UnionType";

  constructor({
    memberDiscriminantValues,
    memberTypes,
    name,
    ...superParameters
  }: {
    memberDiscriminantValues: readonly string[];
    memberTypes: readonly Type[];
    name?: string;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    invariant(memberTypes.length >= 2);
    invariant(
      memberDiscriminantValues.length === 0 ||
        memberDiscriminantValues.length === memberTypes.length,
    );
    this.#name = name;

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
  override get conversions(): readonly Type.Conversion[] {
    switch (this.discriminant.kind) {
      case "envelope":
      case "inline":
        return [
          {
            conversionExpression: (value) => value,
            sourceTypeCheckExpression: (value) =>
              `typeof ${value} === "object"`,
            sourceTypeName: this.name,
          },
        ];
      case "typeof":
        return this.memberTypes.map((memberType) => ({
          conversionExpression: (value) => value,
          sourceTypeCheckExpression: (value) =>
            `typeof ${value} === "${memberType.discriminantValues[0]}"`,
          sourceTypeName: memberType.name,
        }));
      default:
        throw this.discriminant satisfies never;
    }
  }

  @Memoize()
  override get discriminantProperty(): Maybe<Type.DiscriminantProperty> {
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
  override get equalsFunction(): string {
    return `\
((left: ${this.name}, right: ${this.name}) => {
${this.memberTypes
  .flatMap((memberType) =>
    memberType.discriminantValues.map(
      (
        value,
      ) => `if (${this.discriminantVariable("left")} === "${value}" && ${this.discriminantVariable("right")} === "${value}") {
  return ${memberType.equalsFunction}(${memberType.payload("left")}, ${memberType.payload("right")});
}`,
    ),
  )
  .join("\n")}

  return purify.Left({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "BooleanEquals" as const }, type: "Property" as const });
})`;
  }

  @Memoize()
  get filterFunction(): string {
    return `\
((filter: ${this.filterType.name}, value: ${this.name}) => {
${this.memberTypes
  .map(
    (memberType) => `\
if (typeof filter.on?.["${memberType.discriminantValues[0]}"] !== "undefined") {
  switch (${this.discriminantVariable("value")}) {
${memberType.discriminantValues.map((discriminantValue) => `case "${discriminantValue}":`)}
    if (!${memberType.filterFunction}(filter.on["${memberType.discriminantValues[0]}"], ${memberType.payload("value")})) {
      return false;
    }
    break;
  }
}`,
  )
  .join("\n\n")}

  return true;
})`;
  }

  @Memoize()
  get filterType(): Type.CompositeFilterType {
    return new Type.CompositeFilterType({
      on: new Type.CompositeFilterType(
        this.memberTypes.reduce(
          (acc, memberType) => {
            acc[memberType.discriminantValues[0]] = memberType.filterType;
            return acc;
          },
          {} as Record<string, Type["filterType"]>,
        ),
      ),
    });
  }

  override get graphqlType(): Type.GraphqlType {
    throw new Error("GraphQL doesn't support scalar unions");
  }

  @Memoize()
  override jsonType(): Type.JsonType {
    switch (this.discriminant.kind) {
      case "envelope":
        return new Type.JsonType(
          `(${this.memberTypes.map((memberType) => `{ ${(this.discriminant as EnvelopeDiscriminant).name}: "${memberType.discriminantValues[0]}", value: ${memberType.jsonType().name} }`).join(" | ")})`,
        );
      case "inline":
      case "typeof":
        return new Type.JsonType(
          this.memberTypes
            .map(
              (memberType) =>
                memberType.jsonType({
                  includeDiscriminantProperty:
                    this.discriminant.kind === "inline",
                }).name,
            )
            .join(" | "),
        );
      default:
        throw this.discriminant satisfies never;
    }
  }

  @Memoize()
  override get mutable(): boolean {
    return this.memberTypes.some((memberType) => memberType.mutable);
  }

  @Memoize()
  override get name(): string {
    if (typeof this.#name === "undefined") {
      switch (this.discriminant.kind) {
        case "envelope":
          this.#name = `(${this.memberTypes.map((memberType) => `{ ${(this.discriminant as EnvelopeDiscriminant).name}: "${memberType.discriminantValues[0]}", value: ${memberType.name} }`).join(" | ")})`;
          break;
        case "inline":
          // If every type shares a discriminant (e.g., RDF/JS "termType" or generated ObjectType "type"),
          // just join their names with "|"
          this.#name = `(${this.memberTypes.map((memberType) => memberType.name).join(" | ")})`;
          break;
        case "typeof":
          // The memberType.name may include literal values, but they should still be unambiguous with other member types since the typeofs
          // of the different member types are known to be different.
          this.#name = `(${this.memberTypes.map((memberType) => memberType.name).join(" | ")})`;
          break;
      }
    }
    return this.#name!;
  }

  @Memoize()
  override get typeofs(): Type["typeofs"] {
    return NonEmptyList.fromArray(
      this.memberTypes.flatMap((memberType) => memberType.typeofs),
    ).unsafeCoerce();
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    return this.ternaryExpression({
      memberTypeExpression: (memberType) => {
        let typeExpression = memberType.fromJsonExpression({
          variables: {
            value: memberType.payload(variables.value),
          },
        });
        if (this.discriminant.kind === "envelope") {
          typeExpression = `{ ${this.discriminant.name}: "${memberType.discriminantValues[0]}" as const, value: ${typeExpression} }`;
        }
        return typeExpression;
      },
      variables,
    });
  }

  override fromRdfExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    return `${variables.resourceValues}.chain(values => values.chainMap(value => {
      const valueAsValues = purify.Either.of(value.toValues());
      return ${this.memberTypes.reduce((expression, memberType) => {
        let typeExpression = memberType.fromRdfExpression({
          variables: {
            ...variables,
            ignoreRdfType: false,
            resourceValues: "valueAsValues",
          },
        });
        if (this.discriminant.kind === "envelope") {
          typeExpression = `${typeExpression}.map(values => values.map(value => ({ ${this.discriminant.name}: "${memberType.discriminantValues[0]}" as const, value }) as (${this.name})))`;
        }
        typeExpression = `(${typeExpression} as purify.Either<Error, rdfjsResource.Resource.Values<${this.name}>>)`;
        return expression.length > 0
          ? `${expression}.altLazy(() => ${typeExpression})`
          : typeExpression;
      }, "")}.chain(values => values.head());
      }))`;
  }

  override graphqlResolveExpression(
    _parameters: Parameters<Type["graphqlResolveExpression"]>[0],
  ): string {
    throw new Error("not implemented");
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
    const caseBlocks: string[] = [];
    for (const memberType of this.memberTypes) {
      caseBlocks.push(
        `${memberType.discriminantValues.map((discriminantPropertyValue) => `case "${discriminantPropertyValue}":`).join("\n")} { ${memberType
          .hashStatements({
            depth: depth + 1,
            variables: {
              hasher: variables.hasher,
              value: `${memberType.payload(variables.value)}`,
            },
          })
          .join("\n")}; break; }`,
      );
    }
    caseBlocks.push(
      `default: ${variables.value} satisfies never; throw new Error("unrecognized type");`,
    );
    return [
      `switch (${this.discriminantVariable(variables.value)}) { ${caseBlocks.join("\n")} }`,
    ];
  }

  override jsonUiSchemaElement(): Maybe<string> {
    return Maybe.empty();
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    switch (this.discriminant.kind) {
      case "envelope":
        return `${variables.zod}.discriminatedUnion("${this.discriminant.name}", [${this.memberTypes
          .map(
            (memberType) =>
              `${variables.zod}.object({ ${(this.discriminant as EnvelopeDiscriminant).name}: ${variables.zod}.literal("${memberType.discriminantValues[0]}"), value: ${memberType.jsonZodSchema({ context: "type", variables })} })`,
          )
          .join(", ")}])`;
      case "inline":
        return `${variables.zod}.discriminatedUnion("${this.discriminant.name}", [${this.memberTypes
          .map((memberType) =>
            memberType.jsonZodSchema({
              includeDiscriminantProperty: true,
              context: "type",
              variables,
            }),
          )
          .join(", ")}])`;
      case "typeof":
        return `${variables.zod}.union([${this.memberTypes
          .map((memberType) =>
            memberType.jsonZodSchema({ context: "type", variables }),
          )
          .join(", ")}])`;
      default:
        throw this.discriminant satisfies never;
    }
  }

  override snippetDeclarations(
    parameters: Parameters<Type["snippetDeclarations"]>[0],
  ): Readonly<Record<string, string>> {
    const { recursionStack } = parameters;
    if (recursionStack.some((type) => Object.is(type, this))) {
      return {};
    }
    recursionStack.push(this);
    const snippetDeclarations = this.memberTypes.reduce(
      (snippetDeclarations, memberType) =>
        mergeSnippetDeclarations(
          snippetDeclarations,
          memberType.snippetDeclarations(parameters),
        ),
      {} as Record<string, string>,
    );
    invariant(Object.is(recursionStack.pop(), this));
    return snippetDeclarations;
  }

  override sparqlConstructTriples(
    parameters: Parameters<Type["sparqlConstructTriples"]>[0],
  ): readonly string[] {
    return this.memberTypes.flatMap((memberType) =>
      memberType.sparqlConstructTriples({
        ...parameters,
        allowIgnoreRdfType: false,
      }),
    );
  }

  override sparqlWherePatterns({
    allowIgnoreRdfType: _allowIgnoreRdfType,
    variables,
    ...otherParameters
  }: Parameters<Type["sparqlWherePatterns"]>[0]): readonly Sparql.Pattern[] {
    const groupPatternStrings = new Set<string>();
    const groupPatterns = this.memberTypes.flatMap((memberType) => {
      const groupPattern = {
        patterns: memberType.sparqlWherePatterns({
          ...otherParameters,
          allowIgnoreRdfType: false,
          variables: {
            ...variables,
            filter: variables.filter.map(
              (filterVariable) =>
                `${filterVariable}?.on?.["${memberType.discriminantValues[0]}"]`,
            ),
          },
        }),
        type: "group" as const,
      };
      const groupPatternString = Sparql.Pattern.stringify(groupPattern);
      if (groupPatternStrings.has(groupPatternString)) {
        return [];
      }
      groupPatternStrings.add(groupPatternString);
      return [groupPattern];
    });

    switch (groupPatterns.length) {
      case 0:
        return [];
      case 1:
        return groupPatterns[0].patterns;
      default:
        return [
          {
            patterns: groupPatterns,
            type: "union",
          },
        ];
    }
  }

  override toJsonExpression({
    variables,
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    switch (this.discriminant.kind) {
      case "envelope":
        return this.ternaryExpression({
          memberTypeExpression: (memberType) =>
            `{ ${(this.discriminant as EnvelopeDiscriminant).name}: "${memberType.discriminantValues[0]}" as const, value: ${memberType.toJsonExpression(
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
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    return this.ternaryExpression({
      memberTypeExpression: (memberType) =>
        `(${memberType.toRdfExpression({
          variables: {
            ...variables,
            value: memberType.payload(variables.value),
          },
        })} as readonly Parameters<rdfjsResource.MutableResource["add"]>[1][])`,
      variables,
    });
  }

  override useImports(
    parameters: Parameters<Type["useImports"]>[0],
  ): readonly Import[] {
    return this.memberTypes.flatMap((memberType) =>
      memberType.useImports(parameters),
    );
  }

  private discriminantVariable(variableValue: string) {
    switch (this.discriminant.kind) {
      case "envelope":
      case "inline":
        return `${variableValue}.${this.discriminant.name}`;
      case "typeof":
        return `(typeof ${variableValue})`;
    }
  }

  private ternaryExpression({
    memberTypeExpression,
    variables,
  }: {
    memberTypeExpression: (memberType: MemberType) => string;
    variables: { value: string };
  }): string {
    return this.memberTypes.reduce((expression, memberType) => {
      if (expression.length === 0) {
        return memberTypeExpression(memberType);
      }

      const memberTypeExpression_ = memberTypeExpression(memberType);
      if (memberTypeExpression_ === expression) {
        return expression;
      }

      return `(${memberType.discriminantValues
        .map(
          (value) =>
            `${this.discriminantVariable(variables.value)} === "${value}"`,
        )
        .join(" || ")}) ? ${memberTypeExpression_} : ${expression}`;
    }, "");
  }
}

type Discriminant =
  | EnvelopeDiscriminant
  | InlineDiscriminant
  | TypeofDiscriminant;

type EnvelopeDiscriminant = {
  kind: "envelope";
} & Type.DiscriminantProperty;

type InlineDiscriminant = {
  kind: "inline";
} & Type.DiscriminantProperty;

type TypeofDiscriminant = {
  kind: "typeof";
};

function inlineDiscriminantProperty(memberTypes: readonly Type[]):
  | (Omit<Type.DiscriminantProperty, "descendantValues" | "ownValues"> & {
      descendantValues: string[];
      ownValues: string[];
    })
  | undefined {
  let inlineDiscriminantProperty:
    | (Omit<Type.DiscriminantProperty, "descendantValues" | "ownValues"> & {
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
