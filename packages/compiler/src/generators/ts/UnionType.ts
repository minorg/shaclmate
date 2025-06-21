import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import type { TsFeature } from "../../enums/index.js";
import type { Import } from "./Import.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";

class MemberType {
  private readonly delegate: Type;
  private readonly delegateIndex: number;
  private readonly discriminatorKind: DiscriminatorKind;
  private readonly universe: readonly Type[];

  constructor({
    delegate,
    delegateIndex,
    discriminatorKind,
    universe,
  }: {
    delegate: Type;
    delegateIndex: number;
    discriminatorKind: DiscriminatorKind;
    universe: readonly Type[];
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
        return [this.delegate.typeof];
      default:
        throw this.discriminatorKind satisfies never;
    }
  }

  get equalsFunction() {
    return this.delegate.equalsFunction;
  }

  get jsonName() {
    return this.delegate.jsonName;
  }

  get mutable() {
    return this.delegate.mutable;
  }

  get name() {
    return this.delegate.name;
  }

  fromJsonExpression(parameters: Parameters<Type["fromJsonExpression"]>[0]) {
    return this.delegate.fromJsonExpression(parameters);
  }

  fromRdfExpression(parameters: Parameters<Type["fromRdfExpression"]>[0]) {
    return this.delegate.fromRdfExpression(parameters);
  }

  hashStatements(parameters: Parameters<Type["hashStatements"]>[0]) {
    return this.delegate.hashStatements(parameters);
  }

  jsonZodSchema(parameters: Parameters<Type["jsonZodSchema"]>[0]) {
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

  sparqlConstructTemplateTriples(
    parameters: Parameters<Type["sparqlConstructTemplateTriples"]>[0],
  ) {
    return this.delegate.sparqlConstructTemplateTriples(parameters);
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

  useImports(features: Set<TsFeature>) {
    return this.delegate.useImports(features);
  }
}

export class UnionType extends Type {
  private readonly _discriminator: Discriminator;
  private readonly memberTypes: readonly MemberType[];

  private _name?: string;

  readonly kind = "UnionType";
  readonly typeof = "object";

  constructor({
    memberTypes,
    name,
    ...superParameters
  }: ConstructorParameters<typeof Type>[0] & {
    memberTypes: readonly Type[];
    name?: string;
  }) {
    super(superParameters);
    invariant(memberTypes.length >= 2);
    this._name = name;

    const sharedDiscriminatorProperty_ =
      sharedDiscriminatorProperty(memberTypes);
    if (sharedDiscriminatorProperty_) {
      this._discriminator = {
        ...sharedDiscriminatorProperty_,
        kind: "sharedProperty",
      };
    } else {
      const memberTypeofs = new Set<string>();
      for (const memberType of memberTypes) {
        memberTypeofs.add(memberType.typeof);
      }
      if (memberTypeofs.size === memberTypes.length) {
        this._discriminator = {
          kind: "typeof",
        };
      } else {
        this._discriminator = {
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
          discriminatorKind: this._discriminator.kind,
          universe: memberTypes,
        }),
    );
  }

  override get conversions(): readonly Type.Conversion[] {
    switch (this._discriminator.kind) {
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
        throw this._discriminator satisfies never;
    }
  }

  @Memoize()
  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    switch (this._discriminator.kind) {
      case "sharedProperty":
      case "syntheticProperty":
        return Maybe.of(this._discriminator);
      case "typeof":
        return Maybe.empty();
      default:
        throw this._discriminator satisfies never;
    }
  }

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

  override get jsonName(): string {
    switch (this._discriminator.kind) {
      case "sharedProperty":
      case "typeof":
        return this.memberTypes
          .map((memberType) => memberType.jsonName)
          .join(" | ");
      case "syntheticProperty":
        return `(${this.memberTypes.map((memberType) => `{ ${(this._discriminator as SyntheticPropertyDiscriminator).name}: "${memberType.discriminatorValues[0]}", value: ${memberType.jsonName} }`).join(" | ")})`;
      default:
        throw this._discriminator satisfies never;
    }
  }

  override get mutable(): boolean {
    return this.memberTypes.some((memberType) => memberType.mutable);
  }

  override get name(): string {
    if (typeof this._name === "undefined") {
      switch (this._discriminator.kind) {
        case "sharedProperty":
          // If every type shares a discriminator (e.g., RDF/JS "termType" or generated ObjectType "type"),
          // just join their names with "|"
          this._name = `(${this.memberTypes.map((memberType) => memberType.name).join(" | ")})`;
          break;
        case "syntheticProperty":
          this._name = `(${this.memberTypes.map((memberType) => `{ ${(this._discriminator as SyntheticPropertyDiscriminator).name}: "${memberType.discriminatorValues[0]}", value: ${memberType.name} }`).join(" | ")})`;
          break;
        case "typeof":
          // The memberType.name may include literal values, but they should still be unambiguous with other member types since the typeofs
          // of the different member types are known to be different.
          this._name = `(${this.memberTypes.map((memberType) => memberType.name).join(" | ")})`;
          break;
      }
    }
    return this._name!;
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
        if (this._discriminator.kind === "syntheticProperty") {
          typeExpression = `{ ${this._discriminator.name}: "${memberType.discriminatorValues[0]}" as const, value: ${typeExpression} }`;
        }
        return typeExpression;
      },
      variables,
    });
  }

  override fromRdfExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    return this.memberTypes.reduce((expression, memberType) => {
      let typeExpression = memberType.fromRdfExpression({
        variables: { ...variables, ignoreRdfType: false },
      });
      if (this._discriminator.kind === "syntheticProperty") {
        typeExpression = `${typeExpression}.map(value => ({ ${this._discriminator.name}: "${memberType.discriminatorValues[0]}" as const, value }) as (${this.name}))`;
      }
      typeExpression = `(${typeExpression} as purify.Either<rdfjsResource.Resource.ValueError, ${this.name}>)`;
      return expression.length > 0
        ? `${expression}.altLazy(() => ${typeExpression})`
        : typeExpression;
    }, "");
  }

  override hashStatements({
    depth,
    variables,
  }: Parameters<Type["hashStatements"]>[0]): readonly string[] {
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

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    switch (this._discriminator.kind) {
      case "sharedProperty":
        return `${variables.zod}.discriminatedUnion("${this._discriminator.name}", [${this.memberTypes
          .map((memberType) => memberType.jsonZodSchema({ variables }))
          .join(", ")}])`;
      case "syntheticProperty":
        return `${variables.zod}.discriminatedUnion("${this._discriminator.name}", [${this.memberTypes
          .map(
            (memberType) =>
              `${variables.zod}.object({ ${(this._discriminator as SyntheticPropertyDiscriminator).name}: ${variables.zod}.literal("${memberType.discriminatorValues[0]}"), value: ${memberType.jsonZodSchema({ variables })} })`,
          )
          .join(", ")}])`;
      case "typeof":
        return `${variables.zod}.union([${this.memberTypes
          .map((memberType) => memberType.jsonZodSchema({ variables }))
          .join(", ")}])`;
      default:
        throw this._discriminator satisfies never;
    }
  }

  override sparqlConstructTemplateTriples(
    parameters: Parameters<Type["sparqlConstructTemplateTriples"]>[0],
  ): readonly string[] {
    return this.memberTypes.reduce(
      (array, memberType) =>
        array.concat(memberType.sparqlConstructTemplateTriples(parameters)),
      [] as string[],
    );
  }

  override sparqlWherePatterns(
    parameters: Parameters<Type["sparqlWherePatterns"]>[0],
  ): readonly string[] {
    let haveEmptyGroup = false; // Only need one empty group
    return [
      `{ patterns: [${this.memberTypes
        .flatMap((memberType) => {
          const groupPatterns = memberType.sparqlWherePatterns(parameters);
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
  }: Parameters<Type["toJsonExpression"]>[0]): string {
    switch (this._discriminator.kind) {
      case "sharedProperty":
      case "typeof":
        return this.ternaryExpression({
          memberTypeExpression: (memberType) =>
            memberType.toJsonExpression({
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
            `{ ${(this._discriminator as SyntheticPropertyDiscriminator).name}: "${memberType.discriminatorValues[0]}" as const, value: ${memberType.toJsonExpression(
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
  }: Parameters<Type["toRdfExpression"]>[0]): string {
    return this.ternaryExpression({
      memberTypeExpression: (memberType) =>
        memberType.toRdfExpression({
          variables: {
            ...variables,
            value: memberType.payload(variables.value),
          },
        }),
      variables,
    });
  }

  override useImports(features: Set<TsFeature>): readonly Import[] {
    return this.memberTypes.flatMap((memberType) =>
      memberType.useImports(features),
    );
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
      return `(${memberType.discriminatorValues
        .map(
          (value) =>
            `${this.discriminatorVariable(variables.value)} === "${value}"`,
        )
        .join(" || ")}) ? ${memberTypeExpression(memberType)} : ${expression}`;
    }, "");
  }

  private discriminatorVariable(variableValue: string) {
    switch (this._discriminator.kind) {
      case "sharedProperty":
      case "syntheticProperty":
        return `${variableValue}.${this._discriminator.name}`;
      case "typeof":
        return `(typeof ${variableValue})`;
    }
  }
}

type SharedPropertyDiscriminator = {
  kind: "sharedProperty";
} & Type.DiscriminatorProperty;
type SyntheticPropertyDiscriminator = {
  kind: "syntheticProperty";
} & Type.DiscriminatorProperty;
type TypeofDiscriminator = { kind: "typeof" };
type Discriminator =
  | SharedPropertyDiscriminator
  | SyntheticPropertyDiscriminator
  | TypeofDiscriminator;

type DiscriminatorKind = Discriminator["kind"];

function sharedDiscriminatorProperty(memberTypes: readonly Type[]):
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
