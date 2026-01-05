import { Maybe } from "purify-ts";
import { StructureKind, type TypeAliasDeclarationStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { Type } from "../Type.js";

function filterTypeToString(filterType: Type.FilterType): Maybe<string> {
  if (filterType instanceof Type.CompositeFilterType) {
    const propertyStrings: string[] = [];
    for (const [propertyName, propertyFilterType] of Object.entries(
      filterType.properties,
    )) {
      filterTypeToString(propertyFilterType).ifJust(
        (propertyFilterTypeString) => {
          propertyStrings.push(
            `readonly ${propertyName}?: ${propertyFilterTypeString};`,
          );
        },
      );
    }
    return propertyStrings.length > 0
      ? Maybe.of(`{ ${propertyStrings.join(" ")} }`)
      : Maybe.empty();
  }
  if (filterType instanceof Type.CompositeFilterTypeReference) {
    return Maybe.of(filterType.reference);
  }
  if (filterType instanceof Type.ScalarFilterType) {
    return Maybe.of(filterType.name);
  }
  filterType satisfies never;
  throw new Error("unsupported");
}

export function filterTypeDeclaration(
  this: ObjectType,
): Maybe<TypeAliasDeclarationStructure> {
  if (this.extern) {
    return Maybe.empty();
  }

  const members: string[] = [];
  if (this.ownProperties.length > 0) {
    const combinedProperties: Record<
      string,
      Type.CompositeFilterType | Type.CompositeFilterTypeReference
    > = {};
    for (const ownProperty of this.ownProperties) {
      ownProperty.filterProperty.ifJust(({ name, type }) => {
        combinedProperties[name] = type;
      });
    }
    filterTypeToString(new Type.CompositeFilterType(combinedProperties)).ifJust(
      (member) => {
        members.push(member);
      },
    );
  }
  for (const parentObjectType of this.parentObjectTypes) {
    members.push(
      `${parentObjectType.staticModuleName}.${syntheticNamePrefix}Filter`,
    );
  }

  return Maybe.of({
    isExported: true,
    kind: StructureKind.TypeAlias,
    name: `${syntheticNamePrefix}Filter`,
    type: members.length > 0 ? members.join(" & ") : "object",
  });
}
