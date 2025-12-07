import { Maybe, NonEmptyList } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import { AbstractType } from "./AbstractType.js";
import type { Import } from "./Import.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";

class MemberType {
  private readonly delegate: AbstractType;
  private readonly delegateIndex: number;
  private readonly discriminatorKind: DiscriminatorKind;
  private readonly universe: readonly AbstractType[];

  constructor({
    delegate,
    delegateIndex,
    discriminatorKind,
    universe,
  }: {
    delegate: AbstractType;
    delegateIndex: number;
    discriminatorKind: DiscriminatorKind;
    universe: readonly AbstractType[];
  }) {
    this.delegate = delegate;
    this.delegateIndex = delegateIndex;
    this.discriminatorKind = discriminatorKind;
    this.universe = universe;
  }

  @Memoize()
  get discriminatorValues(): readonly string[] {
    switch (this.discriminatorKind) {
      case "sharedProperty": {
        // A member type's combined discriminator property values are its "own" values plus any descendant values that are
        // not the "own" values of some other member type.
        // So if you have type A, type B, and B inherits A, then
        // A has
        //   own discriminator property values: ["A"]
        //   descendant discriminator property values: ["B"]
        // and B has
        //  own discriminator property values: ["B"]
        //  descendant discriminator property values ["B"]
        // In this case A shouldn't have "B" as a combined discriminator property value since it's "claimed" by B.
        const memberOwnDiscriminatorPropertyValues = new Set<string>();
        for (const memberType of this.universe) {
          for (const ownDiscriminatorPropertyValue of memberType.discriminatorProperty.unsafeCoerce()
            .ownValues) {
            memberOwnDiscriminatorPropertyValues.add(
              ownDiscriminatorPropertyValue,
            );
          }
        }

        return this.delegate.discriminatorProperty
          .unsafeCoerce()
          .ownValues.concat(
            this.delegate.discriminatorProperty
              .unsafeCoerce()
              .descendantValues.filter(
                (value) => !memberOwnDiscriminatorPropertyValues.has(value),
              ),
          );
      }
      case "syntheticProperty":
        return [`${this.delegateIndex}-${this.delegate.name}`];
      case "typeof":
        return this.delegate.typeofs;
      default:
        throw this.discriminatorKind satisfies never;
    }
  }

  get equalsFunction() {
    return this.delegate.equalsFunction;
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

  jsonName(parameters?: Parameters<AbstractType["jsonName"]>[0]) {
    return this.delegate.jsonName(parameters);
  }

  hashStatements(parameters: Parameters<AbstractType["hashStatements"]>[0]) {
    return this.delegate.hashStatements(parameters);
  }

  jsonZodSchema(parameters: Parameters<AbstractType["jsonZodSchema"]>[0]) {
    return this.delegate.jsonZodSchema(parameters);
  }

  payload(instance: string): string {
    switch (this.discriminatorKind) {
      case "sharedProperty":
      case "typeof":
        return instance;
      case "syntheticProperty":
        return `${instance}.value`;
    }
  }

  snippetDeclarations(
    parameters: Parameters<AbstractType["snippetDeclarations"]>[0],
  ): readonly string[] {
    return this.delegate.snippetDeclarations(parameters);
  }

  sparqlConstructTemplateTriples(
    parameters: Parameters<AbstractType["sparqlConstructTemplateTriples"]>[0],
  ) {
    return this.delegate.sparqlConstructTemplateTriples(parameters);
  }

  sparqlWherePatterns(
    parameters: Parameters<AbstractType["sparqlWherePatterns"]>[0],
  ) {
    return this.delegate.sparqlWherePatterns(parameters);
  }

  toJsonExpression(
    parameters: Parameters<AbstractType["toJsonExpression"]>[0],
  ) {
    return this.delegate.toJsonExpression(parameters);
  }

  toRdfExpression(parameters: Parameters<AbstractType["toRdfExpression"]>[0]) {
    return this.delegate.toRdfExpression(parameters);
  }

  useImports(parameters: Parameters<AbstractType["useImports"]>[0]) {
    return this.delegate.useImports(parameters);
  }
}

export class UnionType extends AbstractType {
  private readonly discriminator: Discriminator;
  private readonly memberTypes: readonly MemberType[];
  #name?: string;

  override readonly graphqlArgs: AbstractType["graphqlArgs"] = Maybe.empty();
  readonly kind = "UnionType";

  constructor({
    memberTypes,
    name,
    ...superParameters
  }: {
    memberTypes: readonly AbstractType[];
    name?: string;
  } & ConstructorParameters<typeof AbstractType>[0]) {
    super(superParameters);
    invariant(memberTypes.length >= 2);
    this.#name = name;

    const sharedDiscriminatorProperty_ =
      sharedDiscriminatorProperty(memberTypes);
    if (sharedDiscriminatorProperty_) {
      this.discriminator = {
        ...sharedDiscriminatorProperty_,
        kind: "sharedProperty",
      };
    } else {
      const memberTypeofs = new Set<string>();
      for (const memberType of memberTypes) {
        for (const typeof_ of memberType.typeofs) {
          memberTypeofs.add(typeof_);
        }
      }
      if (memberTypeofs.size === memberTypes.length) {
        this.discriminator = {
          kind: "typeof",
        };
      } else {
        this.discriminator = {
          descendantValues: [],
          kind: "syntheticProperty",
          name: "type",
          ownValues: memberTypes.map(
            (memberType, memberTypeIndex) =>
              `${memberTypeIndex}-${memberType.name}`,
          ),
        };
      }
    }

    this.memberTypes = memberTypes.map(
      (memberType, memberTypeIndex) =>
        new MemberType({
          delegate: memberType,
          delegateIndex: memberTypeIndex,
          discriminatorKind: this.discriminator.kind,
          universe: memberTypes,
        }),
    );
  }

  @Memoize()
  override get conversions(): readonly Type.Conversion[] {
    switch (this.discriminator.kind) {
      case "sharedProperty":
      case "syntheticProperty":
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
            `typeof ${value} === "${memberType.discriminatorValues[0]}"`,
          sourceTypeName: memberType.name,
        }));
      default:
        throw this.discriminator satisfies never;
    }
  }

  @Memoize()
  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    switch (this.discriminator.kind) {
      case "sharedProperty":
      case "syntheticProperty":
        return Maybe.of(this.discriminator);
      case "typeof":
        return Maybe.empty();
      default:
        throw this.discriminator satisfies never;
    }
  }

  @Memoize()
  override get equalsFunction(): string {
    return `
(left: ${this.name}, right: ${this.name}) => {
${this.memberTypes
  .flatMap((memberType) =>
    memberType.discriminatorValues.map(
      (
        value,
      ) => `if (${this.discriminatorVariable("left")} === "${value}" && ${this.discriminatorVariable("right")} === "${value}") {
  return ${memberType.equalsFunction}(${memberType.payload("left")}, ${memberType.payload("right")});
}`,
    ),
  )
  .join("\n")}

  return purify.Left({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "BooleanEquals" as const }, type: "Property" as const });
}`;
  }

  override get graphqlName(): Type.GraphqlName {
    throw new Error("not implemented");
  }

  @Memoize()
  override jsonName(): Type.JsonName {
    switch (this.discriminator.kind) {
      case "sharedProperty":
      case "typeof":
        return new Type.JsonName(
          this.memberTypes
            .map((memberType) =>
              memberType.jsonName({
                includeDiscriminatorProperty:
                  this.discriminator.kind === "sharedProperty",
              }),
            )
            .join(" | "),
        );
      case "syntheticProperty":
        return new Type.JsonName(
          `(${this.memberTypes.map((memberType) => `{ ${(this.discriminator as SyntheticPropertyDiscriminator).name}: "${memberType.discriminatorValues[0]}", value: ${memberType.jsonName()} }`).join(" | ")})`,
        );
      default:
        throw this.discriminator satisfies never;
    }
  }

  @Memoize()
  override get mutable(): boolean {
    return this.memberTypes.some((memberType) => memberType.mutable);
  }

  @Memoize()
  override get name(): string {
    if (typeof this.#name === "undefined") {
      switch (this.discriminator.kind) {
        case "sharedProperty":
          // If every type shares a discriminator (e.g., RDF/JS "termType" or generated ObjectType "type"),
          // just join their names with "|"
          this.#name = `(${this.memberTypes.map((memberType) => memberType.name).join(" | ")})`;
          break;
        case "syntheticProperty":
          this.#name = `(${this.memberTypes.map((memberType) => `{ ${(this.discriminator as SyntheticPropertyDiscriminator).name}: "${memberType.discriminatorValues[0]}", value: ${memberType.name} }`).join(" | ")})`;
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
  override get typeofs(): AbstractType["typeofs"] {
    return NonEmptyList.fromArray(
      this.memberTypes.flatMap((memberType) => memberType.typeofs),
    ).unsafeCoerce();
  }

  override fromJsonExpression({
    variables,
  }: Parameters<AbstractType["fromJsonExpression"]>[0]): string {
    return this.ternaryExpression({
      memberTypeExpression: (memberType) => {
        let typeExpression = memberType.fromJsonExpression({
          variables: {
            value: memberType.payload(variables.value),
          },
        });
        if (this.discriminator.kind === "syntheticProperty") {
          typeExpression = `{ ${this.discriminator.name}: "${memberType.discriminatorValues[0]}" as const, value: ${typeExpression} }`;
        }
        return typeExpression;
      },
      variables,
    });
  }

  override fromRdfExpression({
    variables,
  }: Parameters<AbstractType["fromRdfExpression"]>[0]): string {
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
        if (this.discriminator.kind === "syntheticProperty") {
          typeExpression = `${typeExpression}.map(values => values.map(value => ({ ${this.discriminator.name}: "${memberType.discriminatorValues[0]}" as const, value }) as (${this.name})))`;
        }
        typeExpression = `(${typeExpression} as purify.Either<Error, rdfjsResource.Resource.Values<${this.name}>>)`;
        return expression.length > 0
          ? `${expression}.altLazy(() => ${typeExpression})`
          : typeExpression;
      }, "")}.chain(values => values.head());
      }))`;
  }

  override graphqlResolveExpression(
    _parameters: Parameters<AbstractType["graphqlResolveExpression"]>[0],
  ): string {
    throw new Error("not implemented");
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<AbstractType["hashStatements"]>[0]): readonly string[] {
    const caseBlocks: string[] = [];
    for (const memberType of this.memberTypes) {
      caseBlocks.push(
        `${memberType.discriminatorValues.map((discriminatorPropertyValue) => `case "${discriminatorPropertyValue}":`).join("\n")} { ${memberType
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
      `switch (${this.discriminatorVariable(variables.value)}) { ${caseBlocks.join("\n")} }`,
    ];
  }

  override jsonUiSchemaElement(): Maybe<string> {
    return Maybe.empty();
  }

  override jsonZodSchema({
    variables,
  }: Parameters<AbstractType["jsonZodSchema"]>[0]): ReturnType<
    AbstractType["jsonZodSchema"]
  > {
    switch (this.discriminator.kind) {
      case "sharedProperty":
        return `${variables.zod}.discriminatedUnion("${this.discriminator.name}", [${this.memberTypes
          .map((memberType) =>
            memberType.jsonZodSchema({
              includeDiscriminatorProperty: true,
              context: "type",
              variables,
            }),
          )
          .join(", ")}])`;
      case "syntheticProperty":
        return `${variables.zod}.discriminatedUnion("${this.discriminator.name}", [${this.memberTypes
          .map(
            (memberType) =>
              `${variables.zod}.object({ ${(this.discriminator as SyntheticPropertyDiscriminator).name}: ${variables.zod}.literal("${memberType.discriminatorValues[0]}"), value: ${memberType.jsonZodSchema({ context: "type", variables })} })`,
          )
          .join(", ")}])`;
      case "typeof":
        return `${variables.zod}.union([${this.memberTypes
          .map((memberType) =>
            memberType.jsonZodSchema({ context: "type", variables }),
          )
          .join(", ")}])`;
      default:
        throw this.discriminator satisfies never;
    }
  }

  override snippetDeclarations(
    parameters: Parameters<AbstractType["snippetDeclarations"]>[0],
  ): readonly string[] {
    const { recursionStack } = parameters;
    if (recursionStack.some((type) => Object.is(type, this))) {
      return [];
    }
    recursionStack.push(this);
    const result = this.memberTypes.flatMap((memberType) =>
      memberType.snippetDeclarations(parameters),
    );
    invariant(Object.is(recursionStack.pop(), this));
    return result;
  }

  override sparqlConstructTemplateTriples(
    parameters: Parameters<AbstractType["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    return this.memberTypes.reduce(
      (array, memberType) =>
        array.concat(
          memberType.sparqlConstructTemplateTriples({
            ...parameters,
            allowIgnoreRdfType: false,
          }),
        ),
      [] as string[],
    );
  }

  override sparqlWherePatterns(
    parameters: Parameters<AbstractType["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    let haveEmptyGroup = false; // Only need one empty group
    return [
      `{ patterns: [${this.memberTypes
        .flatMap((memberType) => {
          const groupPatterns = memberType.sparqlWherePatterns({
            ...parameters,
            allowIgnoreRdfType: false,
          });
          if (groupPatterns.length === 0) {
            if (haveEmptyGroup) {
              return [];
            }
            haveEmptyGroup = true;
            return [objectInitializer({ patterns: "[]", type: '"group"' })];
          }
          return [
            objectInitializer({
              patterns: `[${groupPatterns.join(", ")}]`,
              type: '"group"',
            }),
          ];
        })
        .join(", ")}], type: "union" }`,
    ];
  }

  override toJsonExpression({
    variables,
  }: Parameters<AbstractType["toJsonExpression"]>[0]): string {
    switch (this.discriminator.kind) {
      case "sharedProperty":
      case "typeof":
        return this.ternaryExpression({
          memberTypeExpression: (memberType) =>
            memberType.toJsonExpression({
              includeDiscriminatorProperty:
                this.discriminator.kind === "sharedProperty",
              variables: {
                ...variables,
                value: memberType.payload(variables.value),
              },
            }),
          variables,
        });
      case "syntheticProperty":
        return this.ternaryExpression({
          memberTypeExpression: (memberType) =>
            `{ ${(this.discriminator as SyntheticPropertyDiscriminator).name}: "${memberType.discriminatorValues[0]}" as const, value: ${memberType.toJsonExpression(
              {
                variables: {
                  ...variables,
                  value: memberType.payload(variables.value),
                },
              },
            )} }`,
          variables,
        });
    }
  }

  override toRdfExpression({
    variables,
  }: Parameters<AbstractType["toRdfExpression"]>[0]): string {
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
    parameters: Parameters<AbstractType["useImports"]>[0],
  ): readonly Import[] {
    return this.memberTypes.flatMap((memberType) =>
      memberType.useImports(parameters),
    );
  }

  private discriminatorVariable(variableValue: string) {
    switch (this.discriminator.kind) {
      case "sharedProperty":
      case "syntheticProperty":
        return `${variableValue}.${this.discriminator.name}`;
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

      return `(${memberType.discriminatorValues
        .map(
          (value) =>
            `${this.discriminatorVariable(variables.value)} === "${value}"`,
        )
        .join(" || ")}) ? ${memberTypeExpression_} : ${expression}`;
    }, "");
  }
}

type Discriminator =
  | SharedPropertyDiscriminator
  | SyntheticPropertyDiscriminator
  | TypeofDiscriminator;

type DiscriminatorKind = Discriminator["kind"];

type SharedPropertyDiscriminator = {
  kind: "sharedProperty";
} & Type.DiscriminatorProperty;

type SyntheticPropertyDiscriminator = {
  kind: "syntheticProperty";
} & Type.DiscriminatorProperty;

type TypeofDiscriminator = {
  kind: "typeof";
};

function sharedDiscriminatorProperty(memberTypes: readonly AbstractType[]):
  | (Omit<Type.DiscriminatorProperty, "descendantValues" | "ownValues"> & {
      descendantValues: string[];
      ownValues: string[];
    })
  | undefined {
  let sharedDiscriminatorProperty:
    | (Omit<Type.DiscriminatorProperty, "descendantValues" | "ownValues"> & {
        descendantValues: string[];
        ownValues: string[];
      })
    | undefined;
  for (const memberType of memberTypes) {
    const memberTypeDiscriminatorProperty =
      memberType.discriminatorProperty.extract();
    if (!memberTypeDiscriminatorProperty) {
      sharedDiscriminatorProperty = undefined;
      break;
    }
    if (!sharedDiscriminatorProperty) {
      sharedDiscriminatorProperty = {
        name: memberTypeDiscriminatorProperty.name,
        ownValues: memberTypeDiscriminatorProperty.ownValues.concat(),
        descendantValues:
          memberTypeDiscriminatorProperty.descendantValues.concat(),
      };
    } else if (
      memberTypeDiscriminatorProperty.name === sharedDiscriminatorProperty.name
    ) {
      sharedDiscriminatorProperty.descendantValues =
        sharedDiscriminatorProperty.descendantValues.concat(
          memberTypeDiscriminatorProperty.descendantValues,
        );
      sharedDiscriminatorProperty.ownValues =
        sharedDiscriminatorProperty.ownValues.concat(
          memberTypeDiscriminatorProperty.ownValues,
        );
    } else {
      return undefined;
    }
  }

  return sharedDiscriminatorProperty;
}
