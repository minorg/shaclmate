import { Maybe } from "purify-ts";
import { StructureKind, type TypeAliasDeclarationStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { Type } from "../Type.js";

function filterTypeToString(filterType: Type.FilterType): string {
  if (filterType instanceof Type.CompositeFilterType) {
    return `{ ${Object.entries(filterType.properties).map(([name, filterType]) => `readonly ${name}?: ${filterTypeToString(filterType)}`)} }`;
  }
  if (filterType instanceof Type.CompositeFilterTypeReference) {
    return filterType.reference;
  }
  if (filterType instanceof Type.ScalarFilterType) {
    return filterType.name;
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
    members.push(
      filterTypeToString(new Type.CompositeFilterType(combinedProperties)),
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
