import { Maybe } from "purify-ts";
import { invariant } from "ts-invariant";
import { Memoize } from "typescript-memoize";
import type { Import } from "./Import.js";
import { Type } from "./Type.js";

interface MemberTypeTraits {
  readonly discriminatorPropertyValues: readonly string[];
  readonly memberType: Type;
  readonly payload: (instance: string) => string;
}

export class UnionType extends Type {
  readonly _discriminatorProperty: Type.DiscriminatorProperty & {
    readonly synthetic: boolean;
  };
  readonly kind = "UnionType";
  readonly memberTypes: readonly Type[];
  readonly name: string;
  private readonly memberTypeTraits: readonly MemberTypeTraits[];

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

    const memberTypeTraits: MemberTypeTraits[] = [];
    // Do all the composed types share a single discriminator property?
    let memberTypesSharedDiscriminatorProperty:
      | (Omit<Type.DiscriminatorProperty, "values"> & {
          values: string[];
        })
      | undefined;
    for (const memberType of this.memberTypes) {
      const memberTypeDiscriminatorProperty =
        memberType.discriminatorProperty.extract();
      if (!memberTypeDiscriminatorProperty) {
        memberTypesSharedDiscriminatorProperty = undefined;
        break;
      }
      if (!memberTypesSharedDiscriminatorProperty) {
        memberTypesSharedDiscriminatorProperty = {
          name: memberTypeDiscriminatorProperty.name,
          values: memberTypeDiscriminatorProperty.values.concat(),
        };
      } else if (
        memberTypeDiscriminatorProperty.name ===
        memberTypesSharedDiscriminatorProperty.name
      ) {
        memberTypesSharedDiscriminatorProperty.values =
          memberTypesSharedDiscriminatorProperty.values.concat(
            memberTypeDiscriminatorProperty.values,
          );
      } else {
        memberTypesSharedDiscriminatorProperty = undefined;
        break;
      }
      memberTypeTraits.push({
        discriminatorPropertyValues: memberTypeDiscriminatorProperty.values,
        memberType,
        payload: (instance) => instance,
      });
    }

    if (memberTypesSharedDiscriminatorProperty) {
      this._discriminatorProperty = {
        ...memberTypesSharedDiscriminatorProperty,
        synthetic: false,
      };
      // If every type shares a discriminator (e.g., RDF/JS "termType" or generated ObjectType "type"),
      // just join their names with "|"
      this.memberTypeTraits = memberTypeTraits;
      this.name =
        name ??
        `(${this.memberTypes.map((memberType) => memberType.name).join(" | ")})`;
    } else {
      this._discriminatorProperty = {
        name: "type",
        synthetic: true,
        values: this.memberTypes.map(
          (memberType, memberTypeIndex) =>
            `${memberTypeIndex}-${memberType.name}`,
        ),
      };
      this.memberTypeTraits = this.memberTypes.map(
        (memberType, memberTypeIndex) => ({
          discriminatorPropertyValues: [
            `${memberTypeIndex}-${memberType.name}`,
          ],
          memberType,
          payload: (instance) => `${instance}.value`,
        }),
      );
      this.name =
        name ??
        `(${this.memberTypeTraits.map((memberTypeTraits) => `{ ${this._discriminatorProperty.name}: "${memberTypeTraits.discriminatorPropertyValues[0]}", value: ${memberTypeTraits.memberType.name} }`).join(" | ")})`;
    }
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

  get jsonName(): string {
    if (this._discriminatorProperty.synthetic) {
      return `(${this.memberTypeTraits.map((memberTypeTraits) => `{ ${this._discriminatorProperty.name}: "${memberTypeTraits.discriminatorPropertyValues[0]}", value: ${memberTypeTraits.memberType.jsonName} }`).join(" | ")})`;
    }

    return this.memberTypes
      .map((memberType) => memberType.jsonName)
      .join(" | ");
  }

  override get useImports(): readonly Import[] {
    return this.memberTypes.flatMap((memberType) => memberType.useImports);
  }

  override propertyEqualsFunction(): string {
    return `
(left: ${this.name}, right: ${this.name}) => {
${this.memberTypeTraits
  .flatMap((memberTypeTraits) =>
    memberTypeTraits.discriminatorPropertyValues.map(
      (
        value,
      ) => `if (left.${this._discriminatorProperty.name} === "${value}" && right.${this._discriminatorProperty.name} === "${value}") {
  return ${memberTypeTraits.memberType.propertyEqualsFunction()}(${memberTypeTraits.payload("left")}, ${memberTypeTraits.payload("right")});
}`,
    ),
  )
  .join("\n")}

  return purify.Left({ left, right, propertyName: "type", propertyValuesUnequal: { left: typeof left, right: typeof right, type: "BooleanEquals" as const }, type: "Property" as const });
}`;
  }

  override propertyFromRdfExpression(
    parameters: Parameters<Type["propertyFromRdfExpression"]>[0],
  ): string {
    let expression = "";
    for (const memberTypeTraits of this.memberTypeTraits) {
      let typeExpression =
        memberTypeTraits.memberType.propertyFromRdfExpression(parameters);
      if (this._discriminatorProperty.synthetic) {
        typeExpression = `${typeExpression}.map(value => ({ ${this._discriminatorProperty.name}: "${memberTypeTraits.discriminatorPropertyValues[0]}" as const, value }) as (${this.name}))`;
      }
      typeExpression = `(${typeExpression} as purify.Either<rdfjsResource.Resource.ValueError, ${this.name}>)`;
      expression =
        expression.length > 0
          ? `${expression}.altLazy(() => ${typeExpression})`
          : typeExpression;
    }
    return expression;
  }

  override propertyHashStatements({
    depth,
    variables,
  }: Parameters<Type["propertyHashStatements"]>[0]): readonly string[] {
    const caseBlocks: string[] = [];
    for (const memberTypeTraits of this.memberTypeTraits) {
      for (const discriminatorPropertyValue of memberTypeTraits.discriminatorPropertyValues) {
        caseBlocks.push(
          `case "${discriminatorPropertyValue}": { ${memberTypeTraits.memberType.propertyHashStatements(
            {
              depth: depth + 1,
              variables: {
                hasher: variables.hasher,
                value: `${memberTypeTraits.payload(variables.value)}`,
              },
            },
          )}; break; }`,
        );
      }
    }
    return [
      `switch (${variables.value}.${this._discriminatorProperty.name}) { ${caseBlocks.join("\n")} }`,
    ];
  }

  override propertySparqlGraphPatternExpression(
    parameters: Parameters<Type["propertySparqlGraphPatternExpression"]>[0],
  ): Type.SparqlGraphPatternExpression | Type.SparqlGraphPatternsExpression {
    return new Type.SparqlGraphPatternExpression(
      `sparqlBuilder.GraphPattern.union(${this.memberTypes
        .map((type) =>
          type
            .propertySparqlGraphPatternExpression(parameters)
            .toSparqlGraphPatternExpression()
            .toString(),
        )
        .join(", ")})`,
    );
  }

  override propertyToJsonExpression({
    variables,
  }: Parameters<Type["propertyToJsonExpression"]>[0]): string {
    if (this._discriminatorProperty.synthetic) {
      return this.ternaryExpression({
        memberTypeExpression: (memberTypeTraits) =>
          `{ type: "${memberTypeTraits.discriminatorPropertyValues[0]}" as const, value: ${memberTypeTraits.memberType.propertyToJsonExpression(
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

    return this.ternaryExpression({
      memberTypeExpression: (memberTypeTraits) =>
        memberTypeTraits.memberType.propertyToJsonExpression({
          variables: {
            ...variables,
            value: memberTypeTraits.payload(variables.value),
          },
        }),
      variables,
    });
  }

  override propertyToRdfExpression({
    variables,
  }: Parameters<Type["propertyToRdfExpression"]>[0]): string {
    return this.ternaryExpression({
      memberTypeExpression: (memberTypeTraits) =>
        memberTypeTraits.memberType.propertyToRdfExpression({
          variables: {
            ...variables,
            value: memberTypeTraits.payload(variables.value),
          },
        }),
      variables,
    });
  }

  private ternaryExpression({
    memberTypeExpression,
    variables,
  }: {
    memberTypeExpression: (memberTypeTraits: MemberTypeTraits) => string;
    variables: { value: string };
  }): string {
    let expression = "";
    for (const memberTypeTraits of this.memberTypeTraits) {
      if (expression.length === 0) {
        expression = memberTypeExpression(memberTypeTraits);
      } else {
        expression = `(${memberTypeTraits.discriminatorPropertyValues
          .map(
            (value) =>
              `${variables.value}.${this._discriminatorProperty.name} === "${value}"`,
          )
          .join(
            " || ",
          )}) ? ${memberTypeExpression(memberTypeTraits)} : ${expression}`;
      }
    }
    return expression;
  }
}
