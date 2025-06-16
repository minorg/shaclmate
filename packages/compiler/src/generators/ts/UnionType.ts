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
  private readonly discriminatorPropertyKind: "shared" | "synthetic";
  private readonly universe: readonly Type[];

  constructor({
    delegate,
    delegateIndex,
    discriminatorPropertyKind,
    universe,
  }: {
    delegate: Type;
    delegateIndex: number;
    discriminatorPropertyKind: "shared" | "synthetic";
    universe: readonly Type[];
  }) {
    this.delegate = delegate;
    this.delegateIndex = delegateIndex;
    this.discriminatorPropertyKind = discriminatorPropertyKind;
    this.universe = universe;
  }

  @Memoize()
  get discriminatorPropertyValues(): readonly string[] {
    switch (this.discriminatorPropertyKind) {
      case "shared": {
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
      case "synthetic":
        return [`${this.delegateIndex}-${this.delegate.name}`];
      default:
        throw new RangeError(this.discriminatorPropertyKind);
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
    switch (this.discriminatorPropertyKind) {
      case "shared":
        return instance;
      case "synthetic":
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
  private readonly _discriminatorProperty: Type.DiscriminatorProperty & {
    readonly kind: "shared" | "synthetic";
  };
  private readonly memberTypes: readonly MemberType[];

  private _name?: string;

  readonly kind = "UnionType";

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
        memberTypeDiscriminatorProperty.name ===
        sharedDiscriminatorProperty.name
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
        sharedDiscriminatorProperty = undefined;
        break;
      }
    }

    if (sharedDiscriminatorProperty) {
      this._discriminatorProperty = {
        ...sharedDiscriminatorProperty,
        kind: "shared",
      };
    } else {
      this._discriminatorProperty = {
        descendantValues: [],
        kind: "synthetic",
        name: "type",
        ownValues: memberTypes.map(
          (memberType, memberTypeIndex) =>
            `${memberTypeIndex}-${memberType.name}`,
        ),
      };
    }

    this.memberTypes = memberTypes.map(
      (memberType, memberTypeIndex) =>
        new MemberType({
          delegate: memberType,
          delegateIndex: memberTypeIndex,
          discriminatorPropertyKind: this._discriminatorProperty.kind,
          universe: memberTypes,
        }),
    );
  }

  override get conversions(): readonly Type.Conversion[] {
    return [
      {
        conversionExpression: (value) => value,
        sourceTypeCheckExpression: (value) => `typeof ${value} === "object"`,
        sourceTypeName: this.name,
      },
    ];
  }

  @Memoize()
  override get discriminatorProperty(): Maybe<Type.DiscriminatorProperty> {
    return Maybe.of(this._discriminatorProperty);
  }

  override get equalsFunction(): string {
    return `
(left: ${this.name}, right: ${this.name}) => {
${this.memberTypes
  .flatMap((memberType) =>
    memberType.discriminatorPropertyValues.map(
      (
        value,
      ) => `if (left.${this._discriminatorProperty.name} === "${value}" && right.${this._discriminatorProperty.name} === "${value}") {
  return ${memberType.equalsFunction}(${memberType.payload("left")}, ${memberType.payload("right")});
}`,
    ),
  )
  .join("\n")}

  return purify.Left({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "BooleanEquals" as const }, type: "Property" as const });
}`;
  }

  override get jsonName(): string {
    switch (this._discriminatorProperty.kind) {
      case "shared":
        return this.memberTypes
          .map((memberType) => memberType.jsonName)
          .join(" | ");
      case "synthetic":
        return `(${this.memberTypes.map((memberType) => `{ ${this._discriminatorProperty.name}: "${memberType.discriminatorPropertyValues[0]}", value: ${memberType.jsonName} }`).join(" | ")})`;
      default:
        throw new RangeError(this._discriminatorProperty.kind);
    }
  }

  override get mutable(): boolean {
    return this.memberTypes.some((memberType) => memberType.mutable);
  }

  override get name(): string {
    if (typeof this._name === "undefined") {
      switch (this._discriminatorProperty.kind) {
        case "shared":
          // If every type shares a discriminator (e.g., RDF/JS "termType" or generated ObjectType "type"),
          // just join their names with "|"
          this._name = `(${this.memberTypes.map((memberType) => memberType.name).join(" | ")})`;
          break;
        case "synthetic":
          this._name = `(${this.memberTypes.map((memberType) => `{ ${this._discriminatorProperty.name}: "${memberType.discriminatorPropertyValues[0]}", value: ${memberType.name} }`).join(" | ")})`;
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
        if (this._discriminatorProperty.kind === "synthetic") {
          typeExpression = `{ ${this._discriminatorProperty.name}: "${memberType.discriminatorPropertyValues[0]}" as const, value: ${typeExpression} }`;
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
      if (this._discriminatorProperty.kind === "synthetic") {
        typeExpression = `${typeExpression}.map(value => ({ ${this._discriminatorProperty.name}: "${memberType.discriminatorPropertyValues[0]}" as const, value }) as (${this.name}))`;
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
        `${memberType.discriminatorPropertyValues.map((discriminatorPropertyValue) => `case "${discriminatorPropertyValue}":`).join("\n")} { ${memberType
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
      `switch (${variables.value}.${this._discriminatorProperty.name}) { ${caseBlocks.join("\n")} }`,
    ];
  }

  override jsonZodSchema({
    variables,
  }: Parameters<Type["jsonZodSchema"]>[0]): ReturnType<Type["jsonZodSchema"]> {
    switch (this._discriminatorProperty.kind) {
      case "shared":
        return `${variables.zod}.discriminatedUnion("${this._discriminatorProperty.name}", [${this.memberTypes
          .map((memberType) => memberType.jsonZodSchema({ variables }))
          .join(", ")}])`;
      case "synthetic":
        return `${variables.zod}.discriminatedUnion("${this._discriminatorProperty.name}", [${this.memberTypes
          .map(
            (memberType) =>
              `${variables.zod}.object({ ${this._discriminatorProperty.name}: ${variables.zod}.literal("${memberType.discriminatorPropertyValues[0]}"), value: ${memberType.jsonZodSchema({ variables })} })`,
          )
          .join(", ")}])`;
      default:
        throw new RangeError(this._discriminatorProperty.kind);
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
    switch (this._discriminatorProperty.kind) {
      case "shared":
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
      case "synthetic":
        return this.ternaryExpression({
          memberTypeExpression: (memberType) =>
            `{ ${this._discriminatorProperty.name}: "${memberType.discriminatorPropertyValues[0]}" as const, value: ${memberType.toJsonExpression(
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
      return `(${memberType.discriminatorPropertyValues
        .map(
          (value) =>
            `${variables.value}.${this._discriminatorProperty.name} === "${value}"`,
        )
        .join(" || ")}) ? ${memberTypeExpression(memberType)} : ${expression}`;
    }, "");
  }
}
