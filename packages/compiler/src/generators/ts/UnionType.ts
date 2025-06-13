import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";

import type { TsFeature } from "../../enums/index.js";
import type { Import } from "./Import.js";
import { Type } from "./Type.js";
import { objectInitializer } from "./objectInitializer.js";

// We can't extend the member Type directly since it's an arbitrary Type subclass,
// so we wrap it.
interface MemberTypeTraits {
  readonly discriminatorPropertyValues: readonly string[];
  readonly memberType: Type;
  readonly payload: (instance: string) => string;
}

export class UnionType extends Type {
  private readonly memberTypes: readonly Type[];

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
    this.memberTypes = memberTypes;
    this._name = name;
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
${this.memberTypeTraits
  .flatMap((memberTypeTraits) =>
    memberTypeTraits.discriminatorPropertyValues.map(
      (
        value,
      ) => `if (left.${this._discriminatorProperty.name} === "${value}" && right.${this._discriminatorProperty.name} === "${value}") {
  return ${memberTypeTraits.memberType.equalsFunction}(${memberTypeTraits.payload("left")}, ${memberTypeTraits.payload("right")});
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
        return `(${this.memberTypeTraits.map((memberTypeTraits) => `{ ${this._discriminatorProperty.name}: "${memberTypeTraits.discriminatorPropertyValues[0]}", value: ${memberTypeTraits.memberType.jsonName} }`).join(" | ")})`;
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
          this._name = `(${this.memberTypeTraits.map((memberTypeTraits) => `{ ${this._discriminatorProperty.name}: "${memberTypeTraits.discriminatorPropertyValues[0]}", value: ${memberTypeTraits.memberType.name} }`).join(" | ")})`;
          break;
      }
    }
    return this._name!;
  }

  @Memoize()
  private get _discriminatorProperty(): Type.DiscriminatorProperty & {
    readonly kind: "shared" | "synthetic";
  } {
    let sharedDiscriminatorProperty:
      | (Omit<Type.DiscriminatorProperty, "descendantValues" | "ownValues"> & {
          descendantValues: string[];
          ownValues: string[];
        })
      | undefined;
    for (const memberType of this.memberTypes) {
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
      return {
        ...sharedDiscriminatorProperty,
        kind: "shared",
      };
    }

    return {
      descendantValues: [],
      kind: "synthetic",
      name: "type",
      ownValues: this.memberTypes.map(
        (memberType, memberTypeIndex) =>
          `${memberTypeIndex}-${memberType.name}`,
      ),
    };
  }

  @Memoize()
  private get memberTypeTraits(): readonly MemberTypeTraits[] {
    switch (this._discriminatorProperty.kind) {
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
        for (const memberType of this.memberTypes) {
          for (const ownDiscriminatorPropertyValue of memberType.discriminatorProperty.unsafeCoerce()
            .ownValues) {
            memberOwnDiscriminatorPropertyValues.add(
              ownDiscriminatorPropertyValue,
            );
          }
        }

        const memberTypeTraits: readonly MemberTypeTraits[] =
          this.memberTypes.map((memberType) => ({
            discriminatorPropertyValues: memberType.discriminatorProperty
              .unsafeCoerce()
              .ownValues.concat(
                memberType.discriminatorProperty
                  .unsafeCoerce()
                  .descendantValues.filter(
                    (value) => !memberOwnDiscriminatorPropertyValues.has(value),
                  ),
              ),
            memberType,
            payload: (instance) => instance,
          }));
        return memberTypeTraits;
      }
      case "synthetic":
        return this.memberTypes.map((memberType, memberTypeIndex) => ({
          discriminatorPropertyValues: [
            `${memberTypeIndex}-${memberType.name}`,
          ],
          memberType,
          payload: (instance) => `${instance}.value`,
        }));
      default:
        throw new RangeError(this._discriminatorProperty.kind);
    }
  }

  override fromJsonExpression({
    variables,
  }: Parameters<Type["fromJsonExpression"]>[0]): string {
    return this.ternaryExpression({
      memberTypeExpression: (memberTypeTraits) => {
        let typeExpression = memberTypeTraits.memberType.fromJsonExpression({
          variables: {
            value: memberTypeTraits.payload(variables.value),
          },
        });
        if (this._discriminatorProperty.kind === "synthetic") {
          typeExpression = `{ ${this._discriminatorProperty.name}: "${memberTypeTraits.discriminatorPropertyValues[0]}" as const, value: ${typeExpression} }`;
        }
        return typeExpression;
      },
      variables,
    });
  }

  override fromRdfExpression({
    variables,
  }: Parameters<Type["fromRdfExpression"]>[0]): string {
    return this.memberTypeTraits.reduce((expression, memberTypeTraits) => {
      let typeExpression = memberTypeTraits.memberType.fromRdfExpression({
        variables: { ...variables, ignoreRdfType: false },
      });
      if (this._discriminatorProperty.kind === "synthetic") {
        typeExpression = `${typeExpression}.map(value => ({ ${this._discriminatorProperty.name}: "${memberTypeTraits.discriminatorPropertyValues[0]}" as const, value }) as (${this.name}))`;
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
    for (const memberTypeTraits of this.memberTypeTraits) {
      for (const discriminatorPropertyValue of memberTypeTraits.discriminatorPropertyValues) {
        caseBlocks.push(
          `case "${discriminatorPropertyValue}": { ${memberTypeTraits.memberType
            .hashStatements({
              depth: depth + 1,
              variables: {
                hasher: variables.hasher,
                value: `${memberTypeTraits.payload(variables.value)}`,
              },
            })
            .join("\n")}; break; }`,
        );
      }
    }
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
        return `${variables.zod}.discriminatedUnion("${this._discriminatorProperty.name}", [${this.memberTypeTraits
          .map(
            (memberTypeTraits) =>
              `${variables.zod}.object({ ${this._discriminatorProperty.name}: ${variables.zod}.literal("${memberTypeTraits.discriminatorPropertyValues[0]}"), value: ${memberTypeTraits.memberType.jsonZodSchema({ variables })} })`,
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
          memberTypeExpression: (memberTypeTraits) =>
            memberTypeTraits.memberType.toJsonExpression({
              variables: {
                ...variables,
                value: memberTypeTraits.payload(variables.value),
              },
            }),
          variables,
        });
      case "synthetic":
        return this.ternaryExpression({
          memberTypeExpression: (memberTypeTraits) =>
            `{ ${this._discriminatorProperty.name}: "${memberTypeTraits.discriminatorPropertyValues[0]}" as const, value: ${memberTypeTraits.memberType.toJsonExpression(
              {
                variables: {
                  ...variables,
                  value: memberTypeTraits.payload(variables.value),
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
      memberTypeExpression: (memberTypeTraits) =>
        memberTypeTraits.memberType.toRdfExpression({
          variables: {
            ...variables,
            value: memberTypeTraits.payload(variables.value),
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
    memberTypeExpression: (memberTypeTraits: MemberTypeTraits) => string;
    variables: { value: string };
  }): string {
    return this.memberTypeTraits.reduce((expression, memberTypeTraits) => {
      if (expression.length === 0) {
        return memberTypeExpression(memberTypeTraits);
      }
      return `(${memberTypeTraits.discriminatorPropertyValues
        .map(
          (value) =>
            `${variables.value}.${this._discriminatorProperty.name} === "${value}"`,
        )
        .join(
          " || ",
        )}) ? ${memberTypeExpression(memberTypeTraits)} : ${expression}`;
    }, "");
  }
}
