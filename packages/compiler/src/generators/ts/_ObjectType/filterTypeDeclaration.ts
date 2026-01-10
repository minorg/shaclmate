import { Maybe } from "purify-ts";
import { StructureKind, type TypeAliasDeclarationStructure } from "ts-morph";
import type { ObjectType } from "../ObjectType.js";
import { syntheticNamePrefix } from "../syntheticNamePrefix.js";
import { Type } from "../Type.js";

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
    if (Object.entries(combinedProperties).length > 0) {
      members.push(new Type.CompositeFilterType(combinedProperties).name);
    }
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
