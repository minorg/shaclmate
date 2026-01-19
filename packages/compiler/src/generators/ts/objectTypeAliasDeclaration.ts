import { StructureKind, type TypeAliasDeclarationStructure } from "ts-morph";
import type { ObjectType } from "./ObjectType.js";
import { syntheticNamePrefix } from "./syntheticNamePrefix.js";

export function objectTypeAliasDeclaration({
  objectTypes,
}: {
  objectTypes: readonly ObjectType[];
}): TypeAliasDeclarationStructure {
  return {
    isExported: true,
    kind: StructureKind.TypeAlias,
    name: `${syntheticNamePrefix}Object`,
    type:
      objectTypes.length > 0
        ? objectTypes.map((objectType) => `${objectType.name}`).join(" | ")
        : "object",
  };
}
